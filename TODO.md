# TODO - Web "Our Journey" 💙

## Langkah Dasar
- [x] Baca file index.html, style.css, script.js
- [x] Rencana disetujui pengguna
- [x] Tema biru muda menyeluruh (index.html, style.css)
- [x] Perbaiki bug (JS, gambar, music player, popup)
- [x] Section "Harapan & Rencana Kita" + firebase.js (simpan & tampil harapan)

## Fitur Baru: ✨ Wishlist Masa Depan Kita ✨
- [x] Tambah markup wishlist di index.html (button #toggle-harapan-btn, #wishlist-section, #harapan-stats, #harapan-list)
- [x] Tombol "📜 Lihat Semua Harapan" toggle buka/tutup dengan animasi fade-in & slide-up + scroll otomatis
- [x] Statistik: Total, Belum tercapai, Sedang direncanakan, Sudah tercapai
- [x] Kartu harapan dengan nama, isi, waktu, dan dropdown status
- [x] Status default "🌟 Belum tercapai" + dropdown (Belum / Direncanakan / Selesai)
- [x] Perubahan status langsung tersimpan ke Firestore (updateDoc)
- [x] Animasi: glow tombol, hover kartu, kartu muncul satu per satu, pop 0,5 dtk untuk kartu baru
- [x] Kondisi kosong dengan pesan manis
- [x] Glassmorphism, sudut melengkung, bayangan lembut, responsif
- [x] Update firebase.js (urutkan data terbaru, tanpa React/Bootstrap)

## Meningkatkan Quiz (Feedback User)
- [x] Ubah quiz jadi SATU kotak soal per halaman (hemat ruang di mobile)
- [x] Tambah tombol "Lanjut →" untuk pindah soal, dan "Lihat Hasil 🏁" di soal terakhir
- [x] Tambah progress bar & penanda "Soal X dari Y"
- [x] Animasi slide saat ganti soal
- [x] Hasil + tombol "Ulangi Quiz" ditampilkan setelah menjawab semua soal

## Tema Siang & Malam di SEMUA Section (Feedback User)
- [x] Perluas tema malam ke seluruh section: Timeline, Galeri (foto + video), Kotak Kenangan, Quiz, Harapan/Wishlist, dan Pesan
- [x] Background section berubah ke navy gelap (#0f2138 / #0d1b33) saat malam
- [x] Kartu, form, quiz, wishlist memakai glassmorphism gelap saat malam
- [x] Semua teks, judul, caption, placeholder disesuaikan agar tetap terbaca di mode malam
- [x] Transisi halus saat berganti tema


