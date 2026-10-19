# Rekonstruksi Prompt — Next.js & Cloudflare Workers AI

Aplikasi permainan tebak instruksi/prompt gambar antar tim yang dikonversi dari file `studio_tebak_prompt.html` ke arsitektur modern **Next.js 15 (App Router, TypeScript, Tailwind CSS)** dengan **Image Generator berbasis Cloudflare Workers AI**.

---

## 🚀 Fitur Utama

1. **Setup Tim & Sesi Fleksibel**:
   - Mode 1 Tim (Solo Practice: sistem membuat prompt dan gambar rahasia secara otomatis).
   - Mode Multi-Tim (Relay 2 s/d 8 tim bergantian membuat soal & menebak).
   - Preset cepat (1, 2, 3, 4 tim) dan kustomisasi jumlah ronde (2, 3, 4, 6 ronde).

2. **Image Generator via Cloudflare Workers AI**:
   - Menggunakan model ultra cepat & detail tinggi seperti `@cf/black-forest-labs/flux-1-schnell` dan `@cf/stabilityai/stable-diffusion-xl-base-1.0`.
   - Fleksibel: dapat menggunakan URL Cloudflare Worker mandiri atau kredensial direct REST API Cloudflare.
   - Built-in Fallback Artistik: jika worker belum aktif atau offline, sistem otomatis beralih ke generator kanvas lokal tanpa menghentikan jalannya permainan.

3. **Mekanisme Permainan Berputar**:
   - **Tahap 1 (Pembuat Soal)**: Input prompt rahasia, auto-detect gaya visual, suasana, & model, pembuatan gambar, serta penguncian soal.
   - **Tahap 2 (Penebak)**: Tampilan visual terkunci, antrean penebak 1-per-1, tebakan prompt disembunyikan segera setelah dikirim.
   - **Tahap 3 (Evaluasi Skor)**: Kunci jawaban terbuka, rincian skor 3 dimensi (Subjek 40 poin, Gaya 35 poin, Komposisi 25 poin), kata kunci tepat (token match), koreksi juri (+/- 5 poin).
   - **Tahap 4 (Klasemen Akhir)**: Rekapitulasi perolehan poin, rata-rata akurasi, dan arsip riwayat seluruh ronde.

---

## 🛠️ Menjalankan Aplikasi Next.js

1. Install dependensi:
   ```bash
   pnpm install
   ```

2. Jalankan server development:
   ```bash
   pnpm dev
   ```

3. Buka browser di [http://localhost:3000](http://localhost:3000).

---

## ☁️ Menghubungkan ke Cloudflare Worker

Tersedia folder siap deploy `cloudflare-worker/`:

1. Masuk ke folder worker:
   ```bash
   cd cloudflare-worker
   ```

2. Deploy ke Cloudflare:
   ```bash
   npx wrangler login
   npx wrangler deploy
   ```

3. Salin URL Worker yang dihasilkan (misal `https://mpi-gambar-worker.<user>.workers.dev`).
4. Buka aplikasi di browser, klik tombol **Set Worker** di kanan atas, lalu tempel URL dan klik **Simpan Pengaturan**.
