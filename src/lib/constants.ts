export const CURATED_CHALLENGES = [
  {
    prompt:
      "Seekor kucing oranye memakai helm astronot duduk di warung kopi pinggir jalan saat hujan malam hari dengan pantulan lampu neon hangat, gaya lukisan cat minyak.",
  },
  {
    prompt:
      "Perpustakaan kayu bertingkat di dalam batang pohon raksasa dengan lentera gantung bercahaya kuning hangat dan tangga melingkar, gaya ilustrasi buku cerita.",
  },
  {
    prompt:
      "Pasar terapung tradisional di atas sungai tenang saat matahari terbit dengan latar pegunungan berkabut dan perahu kayu penuh buah tropis, fotografi sinematik.",
  },
  {
    prompt:
      "Robot penjaga mercusuar tua berdiri di tebing batu di tengah ombak laut besar saat senja merah vermilion, gaya ilustrasi poster retro.",
  },
  {
    prompt:
      "Stasiun kereta bawah tanah futuristik bergaya arsitektur beton minimalis dengan tanaman hijau merambat di langit-langit kaca dan cahaya matahari pagi.",
  },
  {
    prompt:
      "Sebuah kedai ramen terapung di kanal Venesia bernuansa cyberpunk lampion merah dengan koki panda memasak mi panas, gaya digital art anime 4K.",
  },
];

export const INDONESIAN_STOPWORDS = new Set([
  "yang",
  "dan",
  "di",
  "ke",
  "dari",
  "untuk",
  "dengan",
  "pada",
  "dalam",
  "ini",
  "itu",
  "atau",
  "adalah",
  "sebagai",
  "oleh",
  "secara",
  "buat",
  "buatkan",
  "tolong",
  "saya",
  "sebuah",
  "satu",
  "tentang",
  "gambar",
]);

export const DEFAULT_TEAMS = [
  { id: "t1", name: "Tim Alfa", score: 0, guessesCount: 0, totalAccuracy: 0 },
  { id: "t2", name: "Tim Bravo", score: 0, guessesCount: 0, totalAccuracy: 0 },
  { id: "t3", name: "Tim Delta", score: 0, guessesCount: 0, totalAccuracy: 0 },
];

export const PRESET_TEAM_NAMES = [
  "Tim Alfa",
  "Tim Bravo",
  "Tim Delta",
  "Tim Echo",
  "Tim Foxtrot",
  "Tim Sigma",
  "Tim Garuda",
  "Tim Elang",
];

export const AVAILABLE_MODELS = [
  // Agnes AI
  {
    id: "agnes-image-2.5-flash",
    name: "Agnes Image 2.5 Flash",
    provider: "Agnes AI",
    description:
      "Model generasi terbaru Agnes AI: ultra-cepat, resolusi tinggi, dan pemahaman prompt kompleks.",
    tag: "Terbaru v2.5",
  },
  {
    id: "agnes-image-2.1-flash",
    name: "Agnes Image 2.1 Flash",
    provider: "Agnes AI",
    description:
      "Visual kaya, detail komposisi tinggi, dan multi-scene rendering.",
    tag: "Stabil v2.1",
  },
  {
    id: "agnes-image-2.0-flash",
    name: "Agnes Image 2.0 Flash",
    provider: "Agnes AI",
    description:
      "Model cepat dari Agnes AI untuk asset visual kreatif & dinamis.",
    tag: "Ringan v2.0",
  },
  // Cloudflare Workers AI
  {
    id: "@cf/black-forest-labs/flux-1-schnell",
    name: "Flux-1 Schnell",
    provider: "Cloudflare",
    description: "Kualitas fotorealistis & detail tinggi (4-step generation).",
    tag: "Cloudflare Top",
  },
  {
    id: "@cf/bytedance/stable-diffusion-xl-lightning",
    name: "SDXL Lightning",
    provider: "Cloudflare",
    description: "Super cepat (1–2 detik) & hemat kuota neuron gratis harian.",
    tag: "Paling Cepat",
  },
  {
    id: "@cf/stabilityai/stable-diffusion-xl-base-1.0",
    name: "SDXL Base 1.0",
    provider: "Cloudflare",
    description: "Model standar klasik dari Stability AI.",
    tag: "Stabil",
  },
  {
    id: "@cf/lykon/dreamshaper-8-lcm",
    name: "Dreamshaper 8 LCM",
    provider: "Cloudflare",
    description: "Gaya seni ilustrasi naratif, fantasi, dan anime.",
    tag: "Artistik",
  },
];
