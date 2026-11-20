# RedCode Chat

Chat bebas, kirim kode sepuasnya.

## Struktur
```
index.html      -> halaman
css/style.css   -> tampilan
js/script.js    -> logika aplikasi
assets/logo.jpg -> logo & favicon
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
