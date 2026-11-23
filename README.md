# Whatsschat (versi baru, satu file)

Buka `index.html` di browser. Semua tampilan ada di satu file (HTML, CSS, JS).

## Isi
- Login akun (nama, tanggal lahir, kata sandi) dengan peringatan menjaga kata sandi
- Rel ikon kiri, daftar chat teman (lewat kode 8 karakter), Diarsipkan
- Chat teman: tanggal pemisah, kirim teks dan foto, info kontak
- Story (teks, foto, video maks. 20 detik, hilang 24 jam, daftar penonton)
- Storage kode (cek bahasa, foto pratinjau, bintang untuk menyalin) dan Berbintang
- Pengaturan: Profil, Akun, Privasi, Notifikasi, Bantuan dan masukan
- Chat AI (analisis data, kode web, kepribadian bisa diatur)

## Penting
- Fitur **AI** dan **DM antar pengguna** memakai kemampuan khusus claude.ai.
  Di luar claude.ai, AI menampilkan pesan "hanya aktif di claude.ai" dan chat teman
  berjalan di **mode demo** (tersimpan di browser saja).
- Untuk DM, foto, Story, dan Storage yang dibagi ke semua pengguna, sambungkan ke
  Firebase milikmu (Firestore dan Storage) dan atur `firestore.rules` agar hanya
  pengirim dan penerima yang bisa membaca percakapan.
- Login memakai penyimpanan browser (kata sandi di-hash dengan PBKDF2). Ini belum
  setara akun server. Pakai HTTPS atau localhost agar fitur enkripsi browser aktif.
