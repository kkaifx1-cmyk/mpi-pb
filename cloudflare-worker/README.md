# Cloudflare Worker — Image Generator AI (Rekonstruksi Prompt)

Worker ini menggunakan **Cloudflare Workers AI** dengan model canggih seperti:
- `@cf/black-forest-labs/flux-1-schnell` (Sangat cepat & tajam)
- `@cf/stabilityai/stable-diffusion-xl-base-1.0` (Cadangan)
- `@cf/bytedance/stable-diffusion-xl-lightning` (Cadangan)

## Cara Deploy ke Cloudflare:

1. Masuk ke folder worker:
   ```bash
   cd cloudflare-worker
   ```

2. Login ke akun Cloudflare (jika belum):
   ```bash
   npx wrangler login
   ```

3. Deploy langsung:
   ```bash
   npx wrangler deploy
   ```

4. Setelah deploy berhasil, Anda akan mendapatkan URL seperti:
   `https://mpi-gambar-worker.<username>.workers.dev`

5. Salin URL tersebut dan masukkan ke:
   - File `.env.local` di root Next.js:
     ```env
     CLOUDFLARE_WORKER_URL="https://mpi-gambar-worker.<username>.workers.dev"
     ```
   - ATAU langsung masukkan ke menu **Pengaturan API** di UI website permainan!
