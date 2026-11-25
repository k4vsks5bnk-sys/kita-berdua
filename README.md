# Kita Berdua — PWA

Source frontend aplikasi Kita Berdua untuk dipindahkan dari ChatGPT Sites ke GitHub dan Vercel.

## Isi

- `index.html`: tampilan aplikasi, fitur, dan integrasi Supabase.
- `manifest.webmanifest`: konfigurasi pemasangan ke Home Screen.
- `icon.svg`: ikon aplikasi.
- `sw.js`: service worker PWA.
- `supabase-memory-setup.sql`: tabel galeri dan aturan akses Supabase.

## Mengaktifkan Galeri Kenangan

1. Di proyek Supabase yang **sudah digunakan website**, buka **SQL Editor**.
2. Tinjau dan jalankan `supabase-memory-setup.sql` satu kali. Skrip membuat tabel `memory_photos`, bucket publik `kenangan`, dan aturan RLS untuk anggota pasangan.
3. Pastikan hanya dua akun Aiya dan Denan yang terdaftar di `couple_members` untuk pasangan ini. Akun tambahan yang diberi keanggotaan juga mendapat izin upload/hapus.
4. Deploy `index.html` baru ke hosting aktif. Jangan mengganti URL/key Supabase.
5. Uji pengunjung tanpa login (hanya bisa melihat foto), lalu login masing-masing akun dan coba upload/hapus foto percobaan.

Foto **bersifat publik**: siapa pun yang memiliki URL foto dapat melihatnya. Data di tab Jadwal, Wishlist, Hadiah, dan cerita lama di `entries` tetap mengikuti kebijakan privat yang sudah ada. Jangan jalankan SQL ini jika foto semestinya hanya dapat dilihat pasangan.

## Cara memasang di Vercel

1. Buat repository **Private** baru di akun GitHub tujuan, misalnya `kita-berdua`.
2. Unggah ke **root repository** seluruh file dalam ZIP ini (bukan ZIP-nya).
3. Di Vercel pilih **Add New > Project > Import Git Repository**, lalu pilih repository tersebut.
4. Pilih framework **Other**. Tidak diperlukan build command; output directory dapat dibiarkan kosong/default (root).
5. Deploy dan buka URL `*.vercel.app` yang baru untuk pengujian.
6. Uji login Aiya dan Denan serta membaca/menambah/mengedit item. Keduanya tetap memakai proyek Supabase yang sama.
7. **Setelah tes berhasil**, barulah atur domain `kitaberdualovebb.my.id` di Vercel dan DNS Rumahweb. Lepaskan domain dari ChatGPT Sites jika disyaratkan untuk menghindari konflik.

## Keamanan dan catatan

- Jangan pernah mengunggah password akun, token login, atau `service_role` / secret key Supabase. Kunci `sb_publishable_...` yang sudah ada dalam frontend adalah kunci publik; pembatasan data harus ditegakkan oleh Supabase RLS.
- Pengalihan website **tidak** mengalihkan owner Supabase. Undang Gmail baru ke organisasi Supabase secara terpisah dan pastikan aksesnya diuji sebelum mencabut akun lama.
- Kepemilikan domain tetap di akun Rumahweb. Atur akses/pemilik akun domain secara terpisah, tanpa membagikan password.
- Jangan menghapus Site lama, database, record DNS, atau akun login sebelum deployment dan login di domain baru terbukti normal.
- Galeri foto publik memakai Supabase Storage dengan unggahan khusus akun anggota pasangan. Keamanan write bergantung pada policy Supabase, bukan pada tombol di frontend.

## Sumber

Paket ini dibuat dari arsip kode frontend Kita Berdua yang sudah ada di workspace. Arsip tidak menyertakan database, kredensial pengguna, atau konfigurasi hosting ChatGPT Sites lama.
