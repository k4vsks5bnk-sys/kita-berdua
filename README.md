# Kita Berdua — PWA

Source frontend aplikasi Kita Berdua untuk dipindahkan dari ChatGPT Sites ke GitHub dan Vercel.

## Isi

- `index.html`: tampilan aplikasi, fitur, dan integrasi Supabase.
- `manifest.webmanifest`: konfigurasi pemasangan ke Home Screen.
- `icon.svg`: ikon aplikasi.
- `sw.js`: service worker PWA.

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
- Aplikasi saat ini belum mencakup upload foto privat ke Supabase Storage. Fitur itu memerlukan pengembangan lanjutan.

## Sumber

Paket ini dibuat dari arsip kode frontend Kita Berdua yang sudah ada di workspace. Arsip tidak menyertakan database, kredensial pengguna, atau konfigurasi hosting ChatGPT Sites lama.
