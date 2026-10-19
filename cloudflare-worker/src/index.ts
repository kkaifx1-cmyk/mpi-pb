export interface Env {
  AI: any;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    // Handle CORS preflight
    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "POST, OPTIONS, GET",
          "Access-Control-Allow-Headers": "Content-Type, Authorization",
        },
      });
    }

    const url = new URL(request.url);

    // Health check endpoint
    if (request.method === "GET") {
      return new Response(
        JSON.stringify({
          status: "ok",
          message: "Cloudflare Workers AI Image Generator is active",
          models: [
            "@cf/black-forest-labs/flux-1-schnell",
            "@cf/stabilityai/stable-diffusion-xl-base-1.0",
            "@cf/bytedance/stable-diffusion-xl-lightning"
          ]
        }),
        {
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        }
      );
    }

    if (request.method !== "POST") {
      return new Response(JSON.stringify({ error: "Method not allowed" }), {
        status: 405,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      });
    }

    try {
      const body = await request.json() as { prompt?: string; model?: string; num_steps?: number };
      const prompt = body.prompt?.trim();

      if (!prompt) {
        return new Response(JSON.stringify({ error: "Parameter 'prompt' wajib diisi" }), {
          status: 400,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        });
      }

      // Priority model list
      const selectedModel = body.model || "@cf/black-forest-labs/flux-1-schnell";
      const fallbackModels = [
        selectedModel,
        "@cf/stabilityai/stable-diffusion-xl-base-1.0",
        "@cf/bytedance/stable-diffusion-xl-lightning",
      ];

      let lastError = null;
      let finalBytes: Uint8Array | null = null;
      let usedModel = selectedModel;

      for (const model of fallbackModels) {
        try {
          usedModel = model;
          const inputs: any = { prompt };
          if (model.includes("flux-1-schnell")) {
            inputs.num_steps = body.num_steps || 4;
          }

          const response = await env.AI.run(model, inputs);

          if (response instanceof ReadableStream) {
            const reader = response.getReader();
            const chunks: Uint8Array[] = [];
            while (true) {
              const { done, value } = await reader.read();
              if (done) break;
              if (value) chunks.push(value);
            }
            const totalLength = chunks.reduce((acc, c) => acc + c.length, 0);
            const merged = new Uint8Array(totalLength);
            let offset = 0;
            for (const chunk of chunks) {
              merged.set(chunk, offset);
              offset += chunk.length;
            }
            finalBytes = merged;
          } else if (response instanceof Uint8Array) {
            finalBytes = response;
          } else if (response instanceof ArrayBuffer) {
            finalBytes = new Uint8Array(response);
          } else if (response?.image) {
            return new Response(
              JSON.stringify({
                success: true,
                image: response.image.startsWith("data:") ? response.image : `data:image/jpeg;base64,${response.image}`,
                model: usedModel,
              }),
              {
                headers: {
                  "Content-Type": "application/json",
                  "Access-Control-Allow-Origin": "*",
                },
              }
            );
          } else {
            const buf = await new Response(response).arrayBuffer();
            finalBytes = new Uint8Array(buf);
          }

          if (finalBytes && finalBytes.length > 0) {
            break;
          }
        } catch (err: any) {
          lastError = err;
          continue;
        }
      }

      if (!finalBytes) {
        throw new Error(lastError ? lastError.message : "Gagal merender gambar dengan Workers AI");
      }

      // Convert buffer to base64
      let binary = "";
      for (let i = 0; i < finalBytes.length; i++) {
        binary += String.fromCharCode(finalBytes[i]);
      }
      const base64 = btoa(binary);

      return new Response(
        JSON.stringify({
          success: true,
          image: `data:image/jpeg;base64,${base64}`,
          model: usedModel,
        }),
        {
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        }
      );
    } catch (err: any) {
      return new Response(
        JSON.stringify({
          success: false,
          error: err?.message || "Terjadi kesalahan internal pada Worker",
        }),
        {
          status: 500,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        }
      );
    }
  },
};
