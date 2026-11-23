# Whatsschat

Chat pakai kode teman, story, Storage kode, dan AI. Bisa dipasang sebagai aplikasi (PWA).

## Struktur
```
index.html            -> halaman
css/style.css         -> tampilan
js/script.js          -> logika aplikasi
api/ai.js             -> fungsi server AI (Vercel)
manifest.webmanifest  -> PWA
sw.js                 -> service worker (cache offline)
assets/               -> ikon
```

## Deploy
Pakai **Vercel** (GitHub Pages tidak bisa menjalankan `api/ai.js`):
1. Push semua file ke GitHub, lalu import repo di vercel.com.
2. Project → Settings → **Environment Variables**: tambahkan `ANTHROPIC_API_KEY` (dari https://console.anthropic.com).
3. Opsional: `ANTHROPIC_MODEL` (bawaan `claude-haiku-5-5`) dan `ALLOWED_ORIGIN` (alamat situsmu, mis. `https://namamu.vercel.app`).
4. **Redeploy**. Jangan taruh kunci API di file JS.

Batas bawaan AI: 20 pesan per 10 menit per IP.
Kalau situs di GitHub Pages dan fungsi AI di Vercel, isi `window.AI_ENDPOINT="https://proyekmu.vercel.app/api/ai"` sebelum `js/script.js` di `index.html`, dan atur `ALLOWED_ORIGIN`.
Di claude.ai (dibuka sebagai artifact), AI memakai koneksi claude.ai dan tidak butuh server.

## PWA
Buka lewat HTTPS, lalu Chrome HP: ⋮ → **Instal aplikasi**. Setelah update, naikkan nama cache `V` di `sw.js`.
