# Kita Berdua — PWA

Aplikasi kecil untuk Aiya & Denan: jadwal, wishlist, tanggal penting, ide kencan, hadiah, dan galeri kenangan. Frontend statis (tanpa build) yang terhubung ke Supabase.

## Struktur

```
index.html              kerangka halaman
style.css               semua tampilan
app.js                  logika aplikasi (Supabase, render, foto)
sw.js                   service worker (offline sederhana)
manifest.webmanifest    pengaturan "Add to Home Screen"
icon.svg, *.png         ikon aplikasi (PNG untuk iOS/Android)
supabase/
  01-memory-photos.sql  tabel + bucket galeri kenangan (publik)
  02-profile-photos.sql tabel + bucket foto profil
  03-member-hobbies.sql tabel hobi (privat) + migrasi data lama
```

Nama pasangan diatur di satu tempat: konstanta `PEOPLE` di bagian atas `app.js`.

## Menjalankan SQL (sekali saja)

Di Supabase → SQL Editor, jalankan berurutan: `01`, `02`, `03`. Semua skrip aman dijalankan ulang.

- `01` sama dengan `supabase-memory-setup.sql` versi lama. Lewati jika sudah pernah dijalankan.
- `02` membuat/merapikan tabel `profile_photos` dan bucket `profil`.
- `03` memindahkan hobi dari tabel `entries` ke tabel `member_hobbies`. Aplikasi tetap jalan dengan cara lama selama `03` belum dijalankan.

Tabel dasar (`couples`, `couple_members`, `entries`) belum ada di repo ini. Sebaiknya ekspor skemanya agar database bisa dibangun ulang, misalnya lewat Supabase CLI: `supabase db dump --schema public > supabase/00-base-schema.sql`.

## Deploy di Vercel

1. Import repository ini di Vercel, framework **Other**, tanpa build command, output directory default (root).
2. Uji di URL `*.vercel.app`: lihat galeri tanpa login, lalu login sebagai Aiya dan Denan, tambah/ubah/hapus item, ganti foto profil.
3. Setelah normal, pasang domain `kitaberdualovebb.my.id`.

Setiap kali `style.css` atau `app.js` berubah, naikkan `VERSION` di `sw.js` agar HP mengambil versi baru.

## Ganti foto profil

Ketuk ikon kamera di foto (tab Tentang Kita) → pilih foto → geser dan zoom (bisa cubit dua jari) → Simpan. Foto dipotong bulat di HP, dikompres jadi JPEG 720×720, lalu diunggah, jadi selalu pas di lingkaran dan hemat kuota.

## Keamanan

- Jangan pernah menaruh password, token login, atau `service_role` key Supabase di repo. Kunci `sb_publishable_...` di `app.js` memang publik; pembatasan data ditegakkan oleh RLS.
- Foto galeri dan foto profil **publik** (siapa pun yang punya URL bisa melihat). Jadwal, wishlist, hadiah, hobi, dan cerita tetap privat.
- Repo ini sebaiknya **Private** (Settings → General → Danger Zone → Change visibility).
