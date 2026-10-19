export function renderCanvasImageFromPrompt(promptText: string): string {
  if (typeof window === "undefined") return "";

  const canvas = document.createElement("canvas");
  canvas.width = 960;
  canvas.height = 540;
  const ctx = canvas.getContext("2d");
  if (!ctx) return "";

  const lower = (promptText || "").toLowerCase();

  // Tentukan skema warna langit dan latar dari kata kunci prompt
  let skyTop = "#1D3557";
  let skyBottom = "#457B9D";
  let sunColor = "#E76F51";
  let groundColor = "#141413";
  let accentColor = "#F4A261";

  if (
    lower.includes("malam") ||
    lower.includes("neon") ||
    lower.includes("gelap") ||
    lower.includes("astronot") ||
    lower.includes("cyberpunk")
  ) {
    skyTop = "#0B132B";
    skyBottom = "#1C2541";
    sunColor = "#F4A261";
    groundColor = "#080B16";
    accentColor = "#E63946";
  } else if (
    lower.includes("hutan") ||
    lower.includes("pohon") ||
    lower.includes("alam") ||
    lower.includes("perpustakaan")
  ) {
    skyTop = "#1B4332";
    skyBottom = "#2D6A4F";
    sunColor = "#E9C46A";
    groundColor = "#081C15";
    accentColor = "#F4A261";
  } else if (
    lower.includes("senja") ||
    lower.includes("sore") ||
    lower.includes("terbit") ||
    lower.includes("merah")
  ) {
    skyTop = "#3D1E38";
    skyBottom = "#B83214";
    sunColor = "#F4A261";
    groundColor = "#1B1918";
    accentColor = "#E9C46A";
  }

  // Latar langit gradien halus
  const grad = ctx.createLinearGradient(0, 0, 0, 540);
  grad.addColorStop(0, skyTop);
  grad.addColorStop(0.75, skyBottom);
  grad.addColorStop(1, groundColor);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 960, 540);

  // Bintang jika suasana malam
  if (
    lower.includes("malam") ||
    lower.includes("astronot") ||
    lower.includes("bintang") ||
    lower.includes("cyberpunk")
  ) {
    ctx.fillStyle = "#F4F1EA";
    for (let i = 0; i < 55; i++) {
      const sx = (i * 197) % 940;
      const sy = (i * 89) % 260;
      ctx.fillRect(sx, sy, (i % 3) + 1, (i % 3) + 1);
    }
  }

  // Matahari / Bulan / Sumber cahaya utama
  ctx.beginPath();
  ctx.arc(480, 210, 95, 0, Math.PI * 2);
  ctx.fillStyle = sunColor;
  ctx.fill();

  // Siluet gunung atau gedung sesuai konteks prompt
  if (
    lower.includes("kota") ||
    lower.includes("warung") ||
    lower.includes("stasiun") ||
    lower.includes("gedung") ||
    lower.includes("cyberpunk") ||
    lower.includes("kedai")
  ) {
    ctx.fillStyle = "#141413";
    const buildings = [
      [70, 220, 110, 200],
      [195, 175, 130, 245],
      [340, 240, 145, 180],
      [510, 190, 125, 230],
      [655, 160, 140, 260],
      [810, 230, 95, 190],
    ];
    buildings.forEach(([x, y, w, h]) => {
      ctx.fillRect(x, y, w, h);
      // Jendela bercahaya
      ctx.fillStyle = accentColor;
      for (let wy = y + 20; wy < y + h - 30; wy += 28) {
        for (let wx = x + 16; wx < x + w - 20; wx += 26) {
          ctx.fillRect(wx, wy, 12, 14);
        }
      }
      ctx.fillStyle = "#141413";
    });
  } else {
    // Siluet pegunungan berlapis
    ctx.fillStyle = "#252523";
    ctx.beginPath();
    ctx.moveTo(0, 410);
    ctx.lineTo(240, 195);
    ctx.lineTo(490, 410);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = "#141413";
    ctx.beginPath();
    ctx.moveTo(310, 410);
    ctx.lineTo(640, 165);
    ctx.lineTo(960, 410);
    ctx.closePath();
    ctx.fill();
  }

  // Permukaan tanah atau air dengan refleksi
  ctx.fillStyle = groundColor;
  ctx.fillRect(0, 400, 960, 140);

  ctx.strokeStyle = accentColor;
  ctx.lineWidth = 3;
  for (let r = 0; r < 5; r++) {
    const y = 425 + r * 20;
    const span = 160 - r * 22;
    ctx.beginPath();
    ctx.moveTo(480 - span, y);
    ctx.lineTo(480 + span, y);
    ctx.stroke();
  }

  // Efek hujan jika prompt menyebutkan hujan
  if (lower.includes("hujan") || lower.includes("badai")) {
    ctx.strokeStyle = "rgba(244, 241, 234, 0.35)";
    ctx.lineWidth = 1.5;
    for (let d = 0; d < 65; d++) {
      const rx = (d * 151) % 950;
      const ry = (d * 73) % 500;
      ctx.beginPath();
      ctx.moveTo(rx, ry);
      ctx.lineTo(rx - 8, ry + 22);
      ctx.stroke();
    }
  }

  return canvas.toDataURL("image/png");
}
