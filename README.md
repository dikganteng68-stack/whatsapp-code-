# Whatsschat (versi baru, satu file)

Buka `index.html` di browser. Semua tampilan ada di satu file (HTML, CSS, JS).

## Isi
- Login akun (nama, tanggal lahir, kata sandi) dengan peringatan menjaga kata sandi
- Rel ikon kiri, daftar chat teman (lewat kode 8 karakter), Diarsipkan
- Chat teman: tanggal pemisah, kirim teks dan foto, info kontak, hapus pesan (klik kanan di PC, tekan lama di HP)
- Story (teks, foto, video maks. 20 detik, hilang 24 jam, daftar penonton)
- Storage kode (cek bahasa, foto pratinjau, bintang untuk menyalin) dan Berbintang
- Pengaturan: Profil, Akun, Privasi, Notifikasi, Bantuan dan masukan
- Chat AI (analisis data, kode web, kepribadian bisa diatur)

## Penting
- **Chat AI** jalan lewat Vercel (lihat bagian bawah) atau di claude.ai.
- **DM antar pengguna** butuh Firebase Firestore. Tanpa Firebase, chat teman berjalan di **mode demo**:
  pesan hanya tersimpan di browser dan tidak sampai ke teman.
- Login memakai penyimpanan browser (kata sandi di-hash dengan PBKDF2). Ini belum
  setara akun server. Pakai HTTPS atau localhost agar fitur enkripsi browser aktif.

## Menyambungkan Firebase (DM antar pengguna)
1. Firebase Console -> Build -> Firestore Database -> Create database.
2. Tab Rules: tempel isi `firestore.rules`, lalu Publish.
3. Project settings -> General -> Your apps -> tambah Web app -> salin `firebaseConfig`.
4. Isi nilainya di `firebase-config.js`, deploy ulang.
Batasan: aplikasi belum memakai Firebase Auth. Pesan disandikan dengan kunci dari kode penerima,
jadi siapa pun yang tahu kodemu bisa membaca kotak masukmu. Untuk privasi yang kuat perlu Firebase Auth.

## Mengaktifkan AI di Vercel (Groq, ada kuota gratis)
1. Buat kunci di https://console.groq.com/keys (Buat Kunci API). Salin kuncinya saat muncul, karena hanya tampil sekali.
2. Deploy seluruh folder ini (termasuk folder `api/`) ke Vercel.
3. Di Vercel: Project → Settings → Environment Variables, tambahkan `GROQ_API_KEY` berisi kunci tadi.
   Opsional: `GROQ_MODEL` untuk mengganti model (bawaannya `openai/gpt-oss-120b`; cek daftar terbaru di console.groq.com/docs/models).
4. Redeploy. Chat AI sekarang memakai `/api/chat`.
Jangan menaruh kunci API di `index.html` atau membagikannya ke orang lain.
Kuota gratis dibatasi per menit dan per hari; cek angka terbarunya di console.groq.com.
