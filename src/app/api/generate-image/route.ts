import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 45;

import { AVAILABLE_MODELS } from "@/lib/constants";
import { translatePromptToEnglish } from "@/lib/translator";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const prompt = (body.prompt || "").trim();
    const isTest = Boolean(body.isTest);

    if (!prompt) {
      return NextResponse.json(
        { error: "Prompt tidak boleh kosong" },
        { status: 400 }
      );
    }

    const workerUrl =
      body.workerUrl || process.env.CLOUDFLARE_WORKER_URL || "";
    const accountId =
      body.accountId || process.env.CLOUDFLARE_ACCOUNT_ID || "";
    const apiToken =
      body.apiToken || process.env.CLOUDFLARE_API_TOKEN || "";
    const agnesApiKey =
      body.agnesApiKey || process.env.AGNES_API_KEY || "";
    const requestedModel =
      body.model || body.selectedModel || "agnes-image-2.5-flash";

    // Terjemahkan otomatis prompt Indonesia ke bahasa Inggris menggunakan LLM (Agnes AI / Cloudflare Workers AI)
    const aiPrompt = await translatePromptToEnglish(prompt, {
      agnesApiKey,
      accountId,
      apiToken,
    });

    // ==========================================
    // 1. PENANGANAN MODEL AGNES AI
    // ==========================================
    if (requestedModel.toLowerCase().startsWith("agnes")) {
      const apiKey = agnesApiKey.trim();

      if (!apiKey) {
        if (isTest) {
          return NextResponse.json(
            {
              success: false,
              message:
                "API Key Agnes AI belum diisi. Masukkan Agnes API Key Anda di menu pengaturan.",
            },
            { status: 400 }
          );
        }
      } else {
        const agnesEndpoints = [
          "https://apihub.agnes-ai.com/v1/images/generations",
          "https://api.agnes-ai.com/v1/images/generations",
        ];

        let lastAgnesError = "";

        for (const endpoint of agnesEndpoints) {
          try {
            const agnesRes = await fetch(endpoint, {
              method: "POST",
              headers: {
                Authorization: `Bearer ${apiKey}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                model: requestedModel,
                prompt: aiPrompt,
                size: "1024x1024",
              }),
            });

            if (agnesRes.ok) {
              const data = await agnesRes.json();
              const imgUrl = data?.data?.[0]?.url;
              const b64 = data?.data?.[0]?.b64_json;
              const finalImage = b64
                ? (b64.startsWith("data:") ? b64 : `data:image/jpeg;base64,${b64}`)
                : imgUrl;

              if (finalImage) {
                return NextResponse.json({
                  success: true,
                  image: finalImage,
                  model: requestedModel,
                  source: "agnes-ai",
                  englishPrompt: aiPrompt,
                });
              }
            } else {
              const errBody = await agnesRes.text();
              lastAgnesError = `Agnes HTTP ${agnesRes.status}: ${errBody.slice(0, 180)}`;
            }
          } catch (err: any) {
            lastAgnesError = err.message;
          }
        }

        if (isTest) {
          return NextResponse.json(
            {
              success: false,
              message: `Gagal memanggil Agnes AI: ${lastAgnesError || "Periksa API Key Agnes AI kamu."}`,
            },
            { status: 400 }
          );
        }
      }
    }

    // ==========================================
    // 2. PENANGANAN CLOUDFLARE WORKER URL (CUSTOM)
    // ==========================================
    if (workerUrl && !requestedModel.toLowerCase().startsWith("agnes")) {
      try {
        const workerResponse = await fetch(workerUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            prompt: aiPrompt,
            model: requestedModel,
            num_steps: 4,
          }),
        });

        if (workerResponse.ok) {
          const contentType = workerResponse.headers.get("content-type") || "";

          if (contentType.includes("application/json")) {
            const data = await workerResponse.json();
            if (data.image) {
              return NextResponse.json({
                success: true,
                image: data.image,
                model: data.model || requestedModel,
                source: "cloudflare-worker",
                englishPrompt: aiPrompt,
              });
            }
          } else if (contentType.includes("image/")) {
            const buffer = await workerResponse.arrayBuffer();
            const base64 = Buffer.from(buffer).toString("base64");
            return NextResponse.json({
              success: true,
              image: `data:${contentType};base64,${base64}`,
              model: requestedModel,
              source: "cloudflare-worker-binary",
              englishPrompt: aiPrompt,
            });
          }
        } else {
          const errText = await workerResponse.text();
          if (isTest && !accountId) {
            return NextResponse.json(
              {
                success: false,
                message: `Worker merespons HTTP ${workerResponse.status}: ${errText.slice(0, 150)}`,
              },
              { status: 400 }
            );
          }
        }
      } catch (workerErr: any) {
        console.warn("Cloudflare Worker URL gagal:", workerErr.message);
        if (isTest && !accountId) {
          return NextResponse.json(
            {
              success: false,
              message: `Gagal menghubungi Worker URL: ${workerErr.message}.`,
            },
            { status: 400 }
          );
        }
      }
    }

    // ==========================================
    // 3. PENANGANAN CLOUDFLARE WORKERS AI REST API (DIRECT)
    // ==========================================
    if (accountId && apiToken && !requestedModel.toLowerCase().startsWith("agnes")) {
      const cfModels = [
        requestedModel,
        "@cf/black-forest-labs/flux-1-schnell",
        "@cf/bytedance/stable-diffusion-xl-lightning",
        "@cf/stabilityai/stable-diffusion-xl-base-1.0",
      ];
      const uniqueCfModels = Array.from(new Set(cfModels));

      let lastError = "";

      for (const model of uniqueCfModels) {
        try {
          const cfApiUrl = `https://api.cloudflare.com/client/v4/accounts/${accountId}/ai/run/${model}`;
          const cfResponse = await fetch(cfApiUrl, {
            method: "POST",
            headers: {
              Authorization: `Bearer ${apiToken}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              prompt: aiPrompt,
              num_steps: 4,
            }),
          });

          if (cfResponse.ok) {
            const contentType = cfResponse.headers.get("content-type") || "";

            if (contentType.includes("image/")) {
              const buffer = await cfResponse.arrayBuffer();
              const base64 = Buffer.from(buffer).toString("base64");
              return NextResponse.json({
                success: true,
                image: `data:${contentType};base64,${base64}`,
                model: model,
                source: "cloudflare-workers-ai-free",
                englishPrompt: aiPrompt,
              });
            } else if (contentType.includes("application/json")) {
              const json = await cfResponse.json();
              if (json?.result?.image) {
                const imgData = json.result.image.startsWith("data:")
                  ? json.result.image
                  : `data:image/jpeg;base64,${json.result.image}`;
                return NextResponse.json({
                  success: true,
                  image: imgData,
                  model: model,
                  source: "cloudflare-workers-ai-free",
                  englishPrompt: aiPrompt,
                });
              }
            }
          } else {
            const errText = await cfResponse.text();
            lastError = `HTTP ${cfResponse.status}: ${errText.slice(0, 180)}`;
          }
        } catch (cfErr: any) {
          lastError = cfErr.message;
        }
      }

      if (isTest) {
        return NextResponse.json(
          {
            success: false,
            message: `Gagal memanggil Cloudflare API (${lastError || "Periksa Account ID & API Token"}).`,
          },
          { status: 400 }
        );
      }
    }

    if (isTest) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Harap isi Kredensial AI (Agnes AI API Key atau Cloudflare Account ID & API Token) terlebih dahulu.",
        },
        { status: 400 }
      );
    }

    // 4. Fallback kanvas artistik jika belum ada kredensial atau offline
    return NextResponse.json({
      success: false,
      fallback: true,
      message:
        "Kredensial AI belum disetel atau limit harian tercapai. Menggunakan generator kanvas lokal.",
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Gagal memproses gambar",
      },
      { status: 500 }
    );
  }
}
