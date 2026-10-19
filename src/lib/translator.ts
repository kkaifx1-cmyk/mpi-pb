// Kamus terjemahan istilah umum prompt gambar Indonesia -> Inggris
const DICTIONARY: [RegExp, string][] = [
  // Subjek & Hewan
  [/\bseekor\b/gi, "a"],
  [/\bsebuah\b/gi, "a"],
  [/\bseorang\b/gi, "a"],
  [/\bkucing oranye\b/gi, "orange tabby cat"],
  [/\bkucing\b/gi, "cat"],
  [/\banjing\b/gi, "dog"],
  [/\bmonyet\b/gi, "cute monkey"],
  [/\bkera\b/gi, "monkey"],
  [/\bgorila\b/gi, "gorilla"],
  [/\bsimpanse\b/gi, "chimpanzee"],
  [/\bgajah\b/gi, "elephant"],
  [/\bharimau\b/gi, "tiger"],
  [/\bsinga\b/gi, "lion"],
  [/\bkelinci\b/gi, "rabbit"],
  [/\bberuang\b/gi, "bear"],
  [/\bburung hantu\b/gi, "owl"],
  [/\bburung\b/gi, "bird"],
  [/\bikan\b/gi, "fish"],
  [/\brusa\b/gi, "deer"],
  [/\brubah\b/gi, "fox"],
  [/\bserigala\b/gi, "wolf"],
  [/\bkura-kura\b/gi, "turtle"],
  [/\bkatak\b/gi, "frog"],
  [/\bayam\b/gi, "chicken"],
  [/\bbebek\b/gi, "duck"],
  [/\brobot\b/gi, "robot"],
  [/\bastronot\b/gi, "astronaut"],
  [/\bkoki panda\b/gi, "panda chef"],
  [/\bpanda\b/gi, "panda"],

  // Pakaian & Aksesori
  [/\bmemakai helm astronot\b/gi, "wearing an astronaut helmet"],
  [/\bmemakai helm\b/gi, "wearing a helmet"],
  [/\bmemakai kacamata\b/gi, "wearing glasses"],
  [/\bmemakai sweater rajut\b/gi, "wearing a knitted sweater"],
  [/\bmemakai sweater\b/gi, "wearing a cozy sweater"],
  [/\bmemakai jaket\b/gi, "wearing a jacket"],
  [/\bmemakai celana\b/gi, "wearing trousers"],
  [/\bmemakai baju\b/gi, "wearing clothes"],
  [/\bmemakai\b/gi, "wearing"],
  [/\bjaket\b/gi, "jacket"],

  // Tempat & Lingkungan
  [/\bwarung kopi pinggir jalan\b/gi, "street roadside coffee shop"],
  [/\bwarung kopi\b/gi, "coffee stall"],
  [/\bkedai ramen terapung\b/gi, "floating ramen stall"],
  [/\bkedai\b/gi, "shop"],
  [/\bperpustakaan kayu bertingkat\b/gi, "multi-story wooden library"],
  [/\bperpustakaan\b/gi, "library"],
  [/\bbatang pohon raksasa\b/gi, "giant tree trunk"],
  [/\bpasar terapung tradisional\b/gi, "traditional floating market"],
  [/\bpasar terapung\b/gi, "floating market"],
  [/\bsungai tenang\b/gi, "calm river"],
  [/\bsungai berbatu\b/gi, "rocky river"],
  [/\bsungai jernih\b/gi, "crystal clear river"],
  [/\bsungai tropis\b/gi, "tropical river"],
  [/\bsungai\b/gi, "river"],
  [/\bair terjun\b/gi, "waterfall"],
  [/\bdanau\b/gi, "lake"],
  [/\blaut\b/gi, "ocean"],
  [/\bpantai\b/gi, "beach"],
  [/\bhutan tropis\b/gi, "tropical jungle"],
  [/\bhutan lebat\b/gi, "dense forest"],
  [/\bhutan\b/gi, "forest"],
  [/\bsawah\b/gi, "rice terrace"],
  [/\bpegunungan berkabut\b/gi, "misty mountains"],
  [/\bpegunungan\b/gi, "mountains"],
  [/\bgunung\b/gi, "mountain"],
  [/\bperahu kayu penuh buah tropis\b/gi, "wooden boats filled with tropical fruits"],
  [/\bperahu kayu\b/gi, "wooden boat"],
  [/\bmercusuar tua\b/gi, "old lighthouse"],
  [/\bmercusuar\b/gi, "lighthouse"],
  [/\btebing batu\b/gi, "rocky cliff"],
  [/\bdi tengah ombak laut besar\b/gi, "amidst huge ocean waves"],
  [/\bstasiun kereta bawah tanah futuristik\b/gi, "futuristic subway station"],
  [/\bstasiun kereta bawah tanah\b/gi, "subway station"],
  [/\barsitektur beton minimalis\b/gi, "minimalist concrete architecture"],
  [/\btanaman hijau merambat\b/gi, "green climbing vines"],
  [/\blangit-langit kaca\b/gi, "glass ceiling"],
  [/\bkanal venesia\b/gi, "venice canal"],

  // Aktivitas & Posisi
  [/\bmandi di sungai\b/gi, "bathing and playing in a river, splashing water"],
  [/\bmandi air\b/gi, "bathing in water, splashing water"],
  [/\bmandi\b/gi, "bathing, taking a bath, splashing water"],
  [/\bbermain air\b/gi, "playing in water, splashing droplets"],
  [/\bberenang di sungai\b/gi, "swimming in a river"],
  [/\bberenang\b/gi, "swimming"],
  [/\bmenyelam\b/gi, "diving"],
  [/\bduduk santai\b/gi, "sitting relaxed"],
  [/\bduduk di\b/gi, "sitting at"],
  [/\bduduk\b/gi, "sitting"],
  [/\bberdiri di\b/gi, "standing on"],
  [/\bberdiri\b/gi, "standing"],
  [/\bberlari\b/gi, "running"],
  [/\bmelompat\b/gi, "jumping"],
  [/\btidur\b/gi, "sleeping"],
  [/\bmakan\b/gi, "eating"],
  [/\bminum\b/gi, "drinking"],
  [/\bmemasak mi panas\b/gi, "cooking hot noodles"],
  [/\bmemasak\b/gi, "cooking"],

  // Waktu, Cuaca & Pencahayaan
  [/\bsaat hujan malam hari\b/gi, "during a rainy night"],
  [/\bhujan malam hari\b/gi, "rainy night"],
  [/\bhujan lebat\b/gi, "heavy rain"],
  [/\bhujan gerimis\b/gi, "drizzle rain"],
  [/\bhujan\b/gi, "rain"],
  [/\bmalam hari\b/gi, "at night"],
  [/\bmalam\b/gi, "night"],
  [/\bsaat matahari terbit\b/gi, "at sunrise"],
  [/\bmatahari terbit\b/gi, "sunrise"],
  [/\bsaat senja merah vermilion\b/gi, "during a vermilion red sunset"],
  [/\bsenja\b/gi, "sunset, golden hour"],
  [/\bcahaya matahari pagi\b/gi, "morning sunlight"],
  [/\bpagi hari\b/gi, "in the morning"],
  [/\bpagi\b/gi, "morning"],
  [/\bpantulan lampu neon hangat\b/gi, "reflections of warm neon lights"],
  [/\blampu neon hangat\b/gi, "warm neon lights"],
  [/\blampu neon\b/gi, "neon lighting"],
  [/\blentera gantung bercahaya kuning hangat\b/gi, "hanging warm yellow glowing lanterns"],
  [/\blentera gantung\b/gi, "hanging lanterns"],
  [/\btangga melingkar\b/gi, "spiral staircase"],
  [/\blampion merah\b/gi, "red lanterns"],

  // Gaya & Nuansa Artistik
  [/\bgaya pixar\b/gi, "3D Disney Pixar animation style, cute character render, vibrant CGI"],
  [/\bgaya disney\b/gi, "classic Disney 3D animation style"],
  [/\bgaya upin ipin\b/gi, "cute 3D cartoon animation style, stylized CGI render, smooth textures"],
  [/\bgaya boboiboy\b/gi, "vibrant 3D action animation style, CGI render"],
  [/\bgaya lukisan cat minyak\b/gi, "oil painting style, rich textures"],
  [/\blukisan cat minyak\b/gi, "oil painting"],
  [/\bcat minyak\b/gi, "oil paint"],
  [/\bgaya ilustrasi buku cerita\b/gi, "storybook illustration style, whimsical"],
  [/\bbuku cerita\b/gi, "storybook"],
  [/\bfotografi sinematik\b/gi, "cinematic photography, 35mm lens, photorealistic"],
  [/\bsinematik\b/gi, "cinematic lighting"],
  [/\bgaya ilustrasi poster retro\b/gi, "retro poster illustration, vintage travel art"],
  [/\bposter retro\b/gi, "retro poster"],
  [/\bgaya digital art anime 4k\b/gi, "digital anime art style, 4K detailed, Makoto Shinkai style"],
  [/\bgaya ghibli\b/gi, "Studio Ghibli aesthetic, anime hand-drawn watercolor style, Hayao Miyazaki art"],
  [/\bgaya anime\b/gi, "anime art style, vibrant Makoto Shinkai aesthetic"],
  [/\bgaya kartun 3d\b/gi, "3D cartoon animated movie render, Pixar style"],
  [/\bgaya kartun\b/gi, "cute cartoon illustration"],
  [/\bkartun 3d\b/gi, "3D cartoon animation"],
  [/\bkartun\b/gi, "cartoon"],
  [/\bbernuansa cyberpunk\b/gi, "cyberpunk aesthetic"],
  [/\bgaya\b/gi, "in the style of"],
  [/\bdengan latar\b/gi, "with background of"],
  [/\bdengan\b/gi, "with"],
  [/\bdi atas\b/gi, "on top of"],
  [/\bdi dalam\b/gi, "inside"],
  [/\bdi\b/gi, "in"],
  [/\bsaat\b/gi, "during"],
  [/\bdan\b/gi, "and"],
];

export interface TranslatorCredentials {
  agnesApiKey?: string;
  accountId?: string;
  apiToken?: string;
}

export async function translatePromptToEnglish(
  prompt: string,
  credentials?: TranslatorCredentials
): Promise<string> {
  const trimmed = prompt.trim();
  if (!trimmed) return "";

  const systemInstruction =
    "You are an expert prompt translator and visual enhancer for AI image generators (such as Agnes AI, Flux, Midjourney, DALL-E). " +
    "Task: Translate and enhance Indonesian image prompts into rich, vivid English prompts. " +
    "Rules: " +
    "1. Accurately translate Indonesian words (e.g. 'monyet mandi di sungai' -> 'a cute monkey bathing and splashing water in a tropical river'). " +
    "2. If cartoon or animation styles are mentioned (e.g. 'gaya upin ipin', 'gaya pixar', 'gaya ghibli'), convert them into professional 3D or visual animation descriptors (e.g. '3D Disney Pixar animation style, vibrant CGI character render', or 'cute 3D cartoon animation style, smooth clay-like CGI render'). " +
    "3. Keep the prompt concise, evocative, and tailored for image synthesis. " +
    "4. Output ONLY the English prompt. Do NOT include quotes, explanations, or conversational filler.";

  // ============================================================
  // 1. Prioritas Utama: Agnes AI Chat Completion (jika ada Agnes API Key)
  // ============================================================
  if (credentials?.agnesApiKey?.trim()) {
    const agnesKey = credentials.agnesApiKey.trim();
    const agnesEndpoints = [
      "https://apihub.agnes-ai.com/v1/chat/completions",
      "https://api.agnes-ai.com/v1/chat/completions",
    ];
    const agnesChatModels = [
      "gpt-4o-mini",
      "gpt-3.5-turbo",
      "gemini-1.5-flash",
      "deepseek-chat",
    ];

    for (const endpoint of agnesEndpoints) {
      for (const model of agnesChatModels) {
        try {
          const res = await fetch(endpoint, {
            method: "POST",
            headers: {
              Authorization: `Bearer ${agnesKey}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              model,
              messages: [
                { role: "system", content: systemInstruction },
                { role: "user", content: trimmed },
              ],
              temperature: 0.3,
              max_tokens: 220,
            }),
          });

          if (res.ok) {
            const json = await res.json();
            const translated = json?.choices?.[0]?.message?.content?.trim();
            if (translated && translated.length > 5) {
              return translated.replace(/^["']|["']$/g, "");
            }
          }
        } catch {
          // Lanjut ke percobaan berikutnya
        }
      }
    }
  }

  // ============================================================
  // 2. Prioritas Kedua: Cloudflare Workers AI LLM (jika ada Cloudflare Token)
  // ============================================================
  if (credentials?.accountId?.trim() && credentials?.apiToken?.trim()) {
    const accountId = credentials.accountId.trim();
    const token = credentials.apiToken.trim();
    const cfLlmModels = [
      "@cf/meta/llama-3.1-8b-instruct",
      "@cf/meta/llama-3-8b-instruct",
      "@cf/mistral/mistral-7b-instruct-v0.2",
    ];

    for (const model of cfLlmModels) {
      try {
        const cfUrl = `https://api.cloudflare.com/client/v4/accounts/${accountId}/ai/run/${model}`;
        const res = await fetch(cfUrl, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            messages: [
              { role: "system", content: systemInstruction },
              { role: "user", content: trimmed },
            ],
            max_tokens: 200,
          }),
        });

        if (res.ok) {
          const json = await res.json();
          const translated =
            json?.result?.response?.trim() || json?.response?.trim();
          if (translated && translated.length > 5) {
            return translated.replace(/^["']|["']$/g, "");
          }
        }
      } catch {
        // Lanjut ke fallback
      }
    }
  }

  // ============================================================
  // 3. Fallback: Gemini API (jika kuota tersedia)
  // ============================================================
  const geminiApiKey =
    process.env.GEMINI_API_KEY || "AIzaSyApB8G8-ov7XG3Tbl10yKgMJyjEyi5k9To";
  if (geminiApiKey) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiApiKey}`;
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `${systemInstruction} Prompt to translate: "${trimmed}"`,
                },
              ],
            },
          ],
        }),
      });

      if (res.ok) {
        const json = await res.json();
        const translated =
          json?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
        if (translated && translated.length > 5) {
          return translated.replace(/^["']|["']$/g, "");
        }
      }
    } catch {
      // Fallback ke kamus leksikal lokal
    }
  }

  // ============================================================
  // 4. Fallback Terakhir: Kamus Leksikal Lokal Indonesia -> Inggris
  // ============================================================
  let result = trimmed;
  for (const [regex, replacement] of DICTIONARY) {
    result = result.replace(regex, replacement);
  }

  return result;
}
