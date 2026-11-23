# Whatsschat

Chat bebas, kirim kode sepuasnya.

## Struktur
```
index.html        -> halaman
css/style.css     -> tampilan
css/ai.css        -> tampilan AI
js/script.js      -> logika aplikasi
js/ai.js          -> chat AI (tombol ✦ di pojok kanan bawah)
js/pwa.js         -> tombol "Pasang aplikasi"
api/ai.js         -> fungsi server AI (Vercel)
manifest.json, sw.js -> PWA (bisa dipasang, cache offline, notifikasi)
assets/           -> logo, ikon, latar
```

## Story
Menu **Story** (di bawah Storage): posting foto atau video (maks. 23 detik), bisa dilihat semua pengguna tanpa berteman, otomatis hilang 24 jam setelah diposting.

## Cara pakai
Buka `index.html` di browser, atau aktifkan **GitHub Pages**:
Settings → Pages → Branch `main` → folder `/ (root)` → Save.

## Perangkat tertaut
Buat kode 8 angka (menu ⋮ → Perangkat tertaut) untuk memindahkan akun ke HP baru. Data akun dienkripsi di perangkat sebelum disimpan ke database. Kalau lupa kode, verifikasi dengan nama lengkap + tanggal lahir.

## Berbintang
Ketuk pesan 2 kali, lalu tekan ⭐ di pojok atas pesan. Lihat semuanya di menu ⋮ → Berbintang.

## Menghubungkan server (wajib agar Tambah teman, chat bersama, Storage & Story jalan)
Aplikasi memakai Firebase Firestore (gratis).
1. Buka https://console.firebase.google.com → **Add project**.
2. Menu **Build → Firestore Database → Create database** (mode *production*, lokasi terdekat misal `asia-southeast2`).
3. Tab **Rules** → tempel isi `firestore.rules` → **Publish**.
4. **Project settings (ikon ⚙️) → General → Your apps → ikon Web `</>`** → daftarkan app → salin objek `firebaseConfig`.
5. Tempel nilainya ke `js/firebase-config.js`, lalu push ke GitHub/redeploy di Vercel.
Catatan: rules di atas terbuka untuk semua orang (cocok untuk demo). Untuk produksi, perketat rules.

## PWA (pasang ke layar utama)
Buka lewat HTTPS (GitHub Pages atau Vercel), lalu di Chrome HP ketuk ⋮ → **Instal aplikasi**, atau ketuk tombol **Pasang aplikasi** yang muncul di aplikasi. Kalau setelah update tampilan lama masih muncul, naikkan angka `V` di `sw.js` (misalnya `wsc-v3`).

## AI Whatsschat
Tombol **✦** di pojok kanan bawah membuka chat AI. Browser memanggil `api/ai.js`, yang menyimpan kunci API di server.
1. Deploy repo ini di **Vercel** (GitHub Pages tidak bisa menjalankan fungsi server).
2. Vercel → Project → Settings → **Environment Variables**, tambahkan `ANTHROPIC_API_KEY` (kunci dari https://console.anthropic.com).
3. Opsional: `ANTHROPIC_MODEL` (bawaan `claude-haiku-5-5`, murah dan cepat) dan `ALLOWED_ORIGIN` (alamat situsmu, misalnya `https://namamu.vercel.app`, agar situs lain tidak bisa memakai AI-mu).
4. **Redeploy**. Jangan taruh kunci API di file JS mana pun.
Batas bawaan: 20 pesan per 10 menit per IP, supaya biaya tidak jebol. Kalau situs di GitHub Pages dan fungsi AI di Vercel, isi `window.AI_ENDPOINT="https://proyekmu.vercel.app/api/ai"` sebelum `js/ai.js` dan atur `ALLOWED_ORIGIN`.
