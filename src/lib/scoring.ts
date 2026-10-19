import { INDONESIAN_STOPWORDS } from "./constants";
import {
  DetectedMeta,
  ScoreData,
  PromptEngineeringEvaluation,
  PromptEngineeringCriterion,
} from "./types";

export function countWords(str: string): number {
  const cleaned = (str || "").trim();
  if (!cleaned) return 0;
  return cleaned.split(/\s+/).length;
}

export function detectPromptCharacteristics(promptText: string): DetectedMeta {
  const lower = (promptText || "").toLowerCase();

  let style = "Ilustrasi Visual";
  if (
    lower.includes("foto") ||
    lower.includes("kamera") ||
    lower.includes("sinematik") ||
    lower.includes("realistis")
  ) {
    style = "Fotografi / Sinematik";
  } else if (
    lower.includes("cat minyak") ||
    lower.includes("lukisan") ||
    lower.includes("kanvas") ||
    lower.includes("akrilik") ||
    lower.includes("cat air")
  ) {
    style = "Lukisan Kanvas";
  } else if (
    lower.includes("3d") ||
    lower.includes("isometrik") ||
    lower.includes("render")
  ) {
    style = "Render 3D";
  } else if (
    lower.includes("piksel") ||
    lower.includes("pixel") ||
    lower.includes("retro") ||
    lower.includes("poster")
  ) {
    style = "Poster / Seni Retro";
  } else if (
    lower.includes("sketsa") ||
    lower.includes("pensil") ||
    lower.includes("hitam putih") ||
    lower.includes("tinta")
  ) {
    style = "Sketsa & Tinta";
  } else if (
    lower.includes("anime") ||
    lower.includes("komik") ||
    lower.includes("buku cerita")
  ) {
    style = "Ilustrasi Naratif";
  }

  let mood = "Cahaya Alami";
  if (
    lower.includes("malam") ||
    lower.includes("neon") ||
    lower.includes("gelap")
  ) {
    mood = "Malam & Cahaya Kontras";
  } else if (
    lower.includes("senja") ||
    lower.includes("sore") ||
    lower.includes("terbenam") ||
    lower.includes("terbit") ||
    lower.includes("hangat")
  ) {
    mood = "Senja / Cahaya Hangat";
  } else if (
    lower.includes("hujan") ||
    lower.includes("kabut") ||
    lower.includes("badai") ||
    lower.includes("mendung")
  ) {
    mood = "Atmosfer Berkabut / Hujan";
  } else if (
    lower.includes("cerah") ||
    lower.includes("pagi") ||
    lower.includes("siang")
  ) {
    mood = "Siang Cerah";
  }

  const needsTextFidelity =
    lower.includes("tulisan") ||
    lower.includes("teks") ||
    lower.includes("poster") ||
    lower.includes("bertuliskan") ||
    lower.includes("papan nama") ||
    lower.includes("infografis") ||
    lower.includes("label");

  return {
    style,
    mood,
    needsTextFidelity,
    modelLabel: needsTextFidelity
      ? "AI Image Engine (Presisi Tinggi)"
      : "AI Image Engine (Otomatis)",
  };
}

export function tokenizeClean(text: string): string[] {
  return (text || "")
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .split(/\s+/)
    .filter((w) => w.length > 2 && !INDONESIAN_STOPWORDS.has(w));
}

/**
 * Evaluasi format Prompt Engineering berdasarkan 5 pilar standar generative image:
 * 1. Subjek & Objek Utama (25 poin)
 * 2. Latar & Lingkungan (20 poin)
 * 3. Pencahayaan & Suasana (20 poin)
 * 4. Gaya Visual & Medium (20 poin)
 * 5. Komposisi & Detail Teknis (15 poin)
 * Total: 100 poin
 */
export function evaluatePromptEngineering(
  promptText: string
): PromptEngineeringEvaluation {
  const text = (promptText || "").toLowerCase().trim();
  const wordCount = countWords(text);

  // 1. Subjek & Karakter/Objek (25 poin)
  const subjectKeywords = [
    "kucing", "anjing", "harimau", "burung", "elang", "serigala", "singa", "ikan",
    "paus", "naga", "kelinci", "rusa", "kuda", "gajah", "panda", "rubah", "orang",
    "pria", "wanita", "kakek", "nenek", "anak", "gadis", "bocah", "pemuda", "astronot",
    "ksatria", "prajurit", "ilmuwan", "penyihir", "pendekar", "guru", "koki", "dokter",
    "musisi", "robot", "cyborg", "android", "mecha", "mobil", "motor", "pesawat",
    "kapal", "kereta", "kastil", "gedung", "rumah", "jembatan", "kuil", "patung",
    "pohon", "bunga", "jam", "cat", "dog", "tiger", "dragon", "astronaut", "knight",
    "warrior", "robot", "man", "woman"
  ];
  const subjectAttrKeywords = [
    "merah", "biru", "hijau", "emas", "perak", "hitam", "putih", "oranye", "kuning",
    "ungu", "cokelat", "abu-abu", "berjaket", "memakai", "jubah", "baju", "topi",
    "kacamata", "helm", "syal", "armor", "pedang", "mahkota", "kostum", "seragam",
    "berbulu", "red", "blue", "gold", "golden", "wearing", "jacket", "suit", "armor"
  ];
  const subjectActionKeywords = [
    "sedang", "duduk", "berdiri", "berlari", "terbang", "melayang", "berjalan",
    "tidur", "menatap", "tersenyum", "memegang", "membawa", "memperbaiki", "membaca",
    "memasak", "melompat", "bermain", "menari", "sitting", "standing",
    "flying", "looking", "holding", "running", "walking"
  ];

  const foundSubjects = subjectKeywords.filter((k) => text.includes(k));
  const foundAttrs = subjectAttrKeywords.filter((k) => text.includes(k));
  const foundActions = subjectActionKeywords.filter((k) => text.includes(k));

  let subjectScore = 0;
  if (foundSubjects.length > 0 || wordCount >= 3) {
    subjectScore += 15;
  }
  if (foundAttrs.length > 0) {
    subjectScore += 5;
  }
  if (foundActions.length > 0) {
    subjectScore += 5;
  }
  subjectScore = Math.min(25, subjectScore);

  const subjectElements = [
    ...foundSubjects,
    ...foundAttrs,
    ...foundActions,
  ].slice(0, 5);

  const subjectCriterion: PromptEngineeringCriterion = {
    id: "subject",
    label: "Subjek & Karakter/Objek Utama",
    maxScore: 25,
    score: subjectScore,
    found: subjectScore >= 15,
    detectedElements: subjectElements,
    feedback:
      subjectScore >= 20
        ? "Subjek sangat jelas dengan atribut deskriptif dan aksi yang hidup."
        : subjectScore >= 15
        ? "Subjek utama teridentifikasi, namun masih bisa diperkaya dengan warna, pakaian, atau pose aksi."
        : "Subjek utama belum spesifik atau terlalu ringkas.",
  };

  // 2. Latar Tempat & Lingkungan (20 poin)
  const envLocations = [
    "taman", "hutan", "gunung", "pantai", "laut", "samudra", "danau", "sungai",
    "lembah", "gurun", "padang rumput", "savana", "luar angkasa", "angkasa", "galaksi",
    "planet", "nebula", "kota", "jalanan", "gang", "pasar", "desa", "kafe", "warung",
    "kedai", "perpustakaan", "laboratorium", "stasiun", "bandara", "bengkel", "kamar",
    "ruangan", "ruang tamu", "dapur", "studio", "kuil", "istana", "kastil", "museum",
    "pabrik", "forest", "mountain", "beach", "ocean", "space", "galaxy", "city",
    "street", "library", "room", "laboratory"
  ];
  const envSpatial = [
    "di dalam", "di luar", "di tengah", "di atas", "di bawah", "di belakang",
    "berlatar", "latar belakang", "di depan", "di samping", "dikelilingi", "menghadap",
    "pepohonan", "reruntuhan", "awan", "langit", "bintang", "background", "surrounded",
    "inside", "outside", "overlooking", "sky", "stars"
  ];

  const foundLocations = envLocations.filter((k) => text.includes(k));
  const foundSpatial = envSpatial.filter((k) => text.includes(k));

  let envScore = 0;
  if (foundLocations.length > 0) envScore += 12;
  if (foundSpatial.length > 0) envScore += 8;
  envScore = Math.min(20, envScore);

  const envElements = [...foundLocations, ...foundSpatial].slice(0, 5);

  const environmentCriterion: PromptEngineeringCriterion = {
    id: "environment",
    label: "Latar Tempat & Lingkungan",
    maxScore: 20,
    score: envScore,
    found: envScore >= 12,
    detectedElements: envElements,
    feedback:
      envScore >= 18
        ? "Setting lingkungan dan konteks spasial tempat digambarkan secara detail."
        : envScore >= 12
        ? "Lokasi tempat sudah ada, dapat ditambahkan relasi spasial atau detail lingkungan sekitar."
        : "Latar tempat belum dicantumkan secara spesifik (objek berpotensi melayang tanpa dunia latar).",
  };

  // 3. Pencahayaan & Suasana / Mood (20 poin)
  const lightingKeywords = [
    "cahaya", "sinar", "lampu", "pencahayaan", "golden hour", "blue hour",
    "sinar matahari", "terbit", "terbenam", "senja", "pagi", "siang", "malam",
    "remang", "neon", "glowing", "bersinar", "siluet", "bayangan", "kontras",
    "rim light", "backlight", "volumetrik", "god rays", "studio lighting", "ambient",
    "sunlight", "glow", "shadow", "dramatic lighting"
  ];
  const moodKeywords = [
    "hangat", "sejuk", "dingin", "misterius", "magis", "ajaib", "damai", "tenang",
    "hening", "mencekam", "horor", "suram", "gelap", "terang", "ceria", "gembira",
    "melankolis", "futuristik", "nostalgis", "berkabut", "kabut", "hujan", "badai",
    "salju", "berawan", "mendung", "cerah", "mistis", "warm", "cool", "mysterious",
    "peaceful", "foggy", "rainy", "stormy"
  ];

  const foundLighting = lightingKeywords.filter((k) => text.includes(k));
  const foundMood = moodKeywords.filter((k) => text.includes(k));

  let lightScore = 0;
  if (foundLighting.length > 0) lightScore += 10;
  if (foundMood.length > 0) lightScore += 10;
  lightScore = Math.min(20, lightScore);

  const lightElements = [...foundLighting, ...foundMood].slice(0, 5);

  const lightingCriterion: PromptEngineeringCriterion = {
    id: "lighting",
    label: "Pencahayaan & Suasana (Lighting & Mood)",
    maxScore: 20,
    score: lightScore,
    found: lightScore >= 10,
    detectedElements: lightElements,
    feedback:
      lightScore >= 18
        ? "Pencahayaan terdefinisi kuat serta suasana psikologis/atmosfer terbangun baik."
        : lightScore >= 10
        ? "Pencahayaan atau mood sudah disebutkan, lengkapi keduanya untuk kedalaman visual maksimal."
        : "Belum mencantumkan instruksi pencahayaan maupun suasana atmosfer gambar.",
  };

  // 4. Gaya Visual & Medium Artistik (20 poin)
  const mediumKeywords = [
    "fotografi", "foto", "kamera", "sinematik", "analog", "realistis", "hiperrealistis",
    "render 3d", "isometrik", "blender", "unreal engine", "cgi", "lukisan", "cat minyak",
    "cat air", "akrilik", "kanvas", "sketsa", "pensil", "tinta", "ilustrasi", "anime",
    "manga", "komik", "poster", "retro", "vintage", "pixel art", "vektor", "cyberpunk",
    "steampunk", "pop art", "photography", "cinematic", "realistic", "3d render",
    "oil painting", "watercolor", "sketch", "illustration"
  ];
  const styleNuanceKeywords = [
    "gaya", "tekstur", "makro", "low poly", "impasto", "ukiyo-e", "studio ghibli",
    "disney", "noir", "art nouveau", "baroque", "surrealis", "minimalis", "monokrom",
    "vibrant", "pastel", "flat design", "konsep seni", "concept art"
  ];

  const foundMedium = mediumKeywords.filter((k) => text.includes(k));
  const foundNuance = styleNuanceKeywords.filter((k) => text.includes(k));

  let styleScore = 0;
  if (foundMedium.length > 0) styleScore += 12;
  if (foundNuance.length > 0) styleScore += 8;
  styleScore = Math.min(20, styleScore);

  const styleElements = [...foundMedium, ...foundNuance].slice(0, 5);

  const styleCriterion: PromptEngineeringCriterion = {
    id: "style",
    label: "Gaya Visual & Medium Artistik",
    maxScore: 20,
    score: styleScore,
    found: styleScore >= 12,
    detectedElements: styleElements,
    feedback:
      styleScore >= 18
        ? "Medium visual dan gaya artistik dipilih secara tegas dan spesifik."
        : styleScore >= 12
        ? "Medium visual sudah jelas, dapat ditambahkan nuansa gaya seni atau referensi teknik."
        : "Gaya visual belum ditentukan (AI akan memilih gaya visual default acak).",
  };

  // 5. Komposisi Kamera & Detail Teknis (15 poin)
  const cameraShotKeywords = [
    "close-up", "close up", "medium shot", "wide shot", "wide angle", "full body",
    "bird eye view", "bird's eye", "high angle", "low angle", "eye level", "dutch angle",
    "sudut pandang", "tampak atas", "tampak depan", "tampak samping", "makro shot",
    "panoramic", "overhead shot"
  ];
  const opticsKeywords = [
    "depth of field", "dof", "bokeh", "fokus tajam", "sharp focus", "lensa", "50mm",
    "35mm", "85mm", "simetris", "rule of thirds", "terpusat", "centered", "framing",
    "blur latar", "lensa lebar"
  ];
  const technicalKeywords = [
    "ultra detail", "detail tinggi", "tekstur tajam", "8k", "4k", "resolusi tinggi",
    "halus", "intricate", "detailed"
  ];

  const foundShots = cameraShotKeywords.filter((k) => text.includes(k));
  const foundOptics = opticsKeywords.filter((k) => text.includes(k));
  const foundTech = technicalKeywords.filter((k) => text.includes(k));

  let compScore = 0;
  if (foundShots.length > 0) compScore += 6;
  if (foundOptics.length > 0) compScore += 5;
  if (foundTech.length > 0 || wordCount >= 8) compScore += 4;
  compScore = Math.min(15, compScore);

  const compElements = [...foundShots, ...foundOptics, ...foundTech].slice(0, 5);

  const compositionCriterion: PromptEngineeringCriterion = {
    id: "composition",
    label: "Komposisi Kamera & Detail Teknis",
    maxScore: 15,
    score: compScore,
    found: compScore >= 8,
    detectedElements: compElements,
    feedback:
      compScore >= 13
        ? "Komposisi sudut kamera, fokus optik, dan detail teknis terdefinisi presisi."
        : compScore >= 8
        ? "Sudut pandang atau komposisi sudah dicantumkan, dapat dipertegas dengan framing optik."
        : "Belum mencantumkan sudut pengambilan kamera (close-up/wide) atau efek kedalaman bidang.",
  };

  const totalScore = Math.min(
    100,
    subjectScore + envScore + lightScore + styleScore + compScore
  );

  let level: "Pemula" | "Menengah" | "Mahir" | "Ahli Prompt" = "Pemula";
  if (totalScore >= 85) level = "Ahli Prompt";
  else if (totalScore >= 70) level = "Mahir";
  else if (totalScore >= 50) level = "Menengah";
  else level = "Pemula";

  // Suggestions
  const suggestions: string[] = [];
  if (subjectScore < 20) {
    suggestions.push(
      "Tambahkan detail subjek (atribut pakaian, warna spesifik, atau aktivitas konkret)."
    );
  }
  if (envScore < 15) {
    suggestions.push(
      "Sertakan latar tempat dan relasi spasial (misal: 'di dalam perpustakaan tua', 'berlatar pegunungan berkabut')."
    );
  }
  if (lightScore < 15) {
    suggestions.push(
      "Tentukan pencahayaan & mood (misal: 'cahaya hangat senja golden hour', 'sinar neon biru futuristik')."
    );
  }
  if (styleScore < 15) {
    suggestions.push(
      "Tentukan medium seni secara eksplisit (misal: 'fotografi sinematik 35mm', 'render 3D isometrik', 'lukisan cat minyak')."
    );
  }
  if (compScore < 10) {
    suggestions.push(
      "Sebutkan sudut pandang kamera dan komposisi (misal: 'close-up shot dengan depth of field bokeh')."
    );
  }

  let summary = "";
  if (totalScore >= 85) {
    summary =
      "Prompt berstandar industri dengan struktur 5 pilar lengkap: subjek hidup, latar spesifik, pencahayaan jelas, gaya visual tegas, dan komposisi teknis terarah.";
  } else if (totalScore >= 70) {
    summary =
      "Prompt solid dan terarah. Gambar yang dihasilkan memiliki karakter kuat, dengan sedikit ruang untuk memperkaya sudut kamera atau suasana.";
  } else if (totalScore >= 50) {
    summary =
      "Struktur prompt standar. Objek dan konteks visual sudah dapat dipahami, namun belum memandu AI untuk menghasilkan visual yang konsisten dan kaya detail.";
  } else {
    summary =
      "Format prompt masih singkat (di bawah standar prompt engineering). Tanpa instruksi latar, cahaya, dan gaya artistik, AI akan menebak secara acak.";
  }

  return {
    totalScore,
    level,
    summary,
    criteria: {
      subject: subjectCriterion,
      environment: environmentCriterion,
      lighting: lightingCriterion,
      style: styleCriterion,
      composition: compositionCriterion,
    },
    suggestions,
  };
}

/**
 * Komparasi kualitas Prompt Engineering antara Prompt Asli dan Prompt Tim
 */
export function comparePromptEvaluations(
  secretPE: PromptEngineeringEvaluation,
  teamPE: PromptEngineeringEvaluation
): {
  scoreDiff: number;
  comparisonSummary: string;
  strongerCriteria: string[];
  weakerCriteria: string[];
} {
  const scoreDiff = teamPE.totalScore - secretPE.totalScore;
  const weaker: string[] = [];
  const stronger: string[] = [];

  const keys = [
    "subject",
    "environment",
    "lighting",
    "style",
    "composition",
  ] as const;

  keys.forEach((k) => {
    const sCrit = secretPE.criteria[k];
    const tCrit = teamPE.criteria[k];
    if (tCrit.score < sCrit.score) {
      weaker.push(tCrit.label);
    } else if (tCrit.score > sCrit.score) {
      stronger.push(tCrit.label);
    }
  });

  let comparisonSummary = "";
  if (scoreDiff >= 10) {
    comparisonSummary =
      "Prompt tim dirumuskan lebih lengkap dibanding prompt asli (+ " +
      scoreDiff +
      " poin), terutama pada aspek " +
      (stronger.length > 0 ? stronger.join(", ") : "detail visual") +
      ".";
  } else if (scoreDiff >= -5 && scoreDiff <= 9) {
    comparisonSummary =
      "Format prompt tim sangat seimbang dan memiliki kelengkapan kaidah prompting yang setara dengan prompt acuan asli.";
  } else {
    comparisonSummary =
      `Prompt tim mendapat nilai kualitas ${Math.abs(scoreDiff)} poin lebih rendah dari prompt asli karena format belum lengkap, terutama pada aspek ` +
      (weaker.length > 0 ? weaker.join(", ") : "detail visual & komposisi") +
      ".";
  }

  return {
    scoreDiff,
    comparisonSummary,
    strongerCriteria: stronger,
    weakerCriteria: weaker,
  };
}

export function computeLocalScore(
  secretPrompt: string,
  guessedPrompt: string
): ScoreData {
  const secretTokens = tokenizeClean(secretPrompt);
  const guessTokens = tokenizeClean(guessedPrompt);

  const secretSet = new Set(secretTokens);
  const matchedTokens: string[] = [];

  guessTokens.forEach((t) => {
    if (secretSet.has(t)) {
      if (!matchedTokens.includes(t)) matchedTokens.push(t);
    } else {
      for (const s of secretSet) {
        if (
          t.length >= 5 &&
          s.length >= 5 &&
          t.slice(0, 5) === s.slice(0, 5)
        ) {
          if (!matchedTokens.includes(t)) matchedTokens.push(t);
          break;
        }
      }
    }
  });

  const overlapRatio =
    secretSet.size > 0 ? matchedTokens.length / secretSet.size : 0;

  // 1. Subjek & Objek Utama (0-40 poin)
  const topicScore = Math.min(
    40,
    Math.round(overlapRatio * 34) + (matchedTokens.length > 0 ? 8 : 4)
  );

  // 2. Gaya Visual & Suasana (0-35 poin)
  const styleKeywords = [
    "gaya", "lukisan", "cat", "minyak", "air", "foto", "fotografi", "sinematik",
    "ilustrasi", "3d", "retro", "poster", "malam", "senja", "pagi", "hujan",
    "kabut", "neon", "hangat", "gelap", "terang", "warna",
  ];
  let styleMatches = 0;
  styleKeywords.forEach((kw) => {
    if (
      secretPrompt.toLowerCase().includes(kw) &&
      guessedPrompt.toLowerCase().includes(kw)
    ) {
      styleMatches += 1;
    }
  });
  const styleScore = Math.min(
    35,
    Math.round(overlapRatio * 22) + styleMatches * 5 + 5
  );

  // 3. Komposisi & Detail Spesifik (0-25 poin)
  const secretLen = countWords(secretPrompt);
  const guessLen = countWords(guessedPrompt);
  const lenRatio =
    secretLen > 0
      ? Math.min(secretLen, guessLen) / Math.max(secretLen, guessLen)
      : 0.5;
  const constraintScore = Math.min(
    25,
    Math.round(lenRatio * 18) + (matchedTokens.length >= 2 ? 7 : 3)
  );

  // Nilai 1: Kemiripan Rekonstruksi (0 - 100)
  const similarityScore = Math.min(100, topicScore + styleScore + constraintScore);

  // Nilai 2: Kualitas Prompt Engineering (0 - 100)
  const peData = evaluatePromptEngineering(guessedPrompt);
  const peScore = peData.totalScore;

  // Skor Akhir Ronde: Kombinasi Bobot (50% Kemiripan + 50% Prompt Engineering)
  const totalScore = Math.round(similarityScore * 0.5 + peScore * 0.5);

  let feedback =
    "Tebakan menangkap sebagian objek pada gambar, namun gaya visual dan detail pencahayaan belum tercantum lengkap.";
  if (similarityScore >= 80) {
    feedback =
      "Rekonstruksi prompt gambar sangat akurat; objek utama, suasana pencahayaan, dan gaya visual berhasil diidentifikasi.";
  } else if (similarityScore >= 55) {
    feedback =
      "Subjek utama dan latar tempat pada gambar sudah tepat, hanya berbeda pada istilah gaya artistik atau detail tambahan.";
  }

  if (peScore < 50) {
    feedback += ` Catatan Prompt Engineering: Total perolehan ronde ini terkoreksi lebih rendah (${totalScore} poin) karena format prompt tim belum lengkap sesuai kaidah prompt engineering (${peScore}/100).`;
  }

  return {
    totalScore,
    similarityScore,
    topicScore,
    styleScore,
    constraintScore,
    matchedTokens,
    feedback,
    peScore,
    promptEngineering: peData,
  };
}
