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
  04-wishlist-done.sql  kolom untuk mencentang wishlist yang sudah dilakukan
  05-letters.sql        surat untuk dibuka nanti (dikunci oleh database)
```

Nama dan warna pasangan diatur di satu tempat: konstanta `PEOPLE` di bagian atas `app.js`. Warna dasar ada di bagian `:root` di `style.css` (`--aiya`, `--denan`, `--kita`).

## Tampilan

Konsep "dua warna yang bertemu": Aiya rose, Denan biru malam, dan titik temunya plum. Menu ada di bawah dengan 5 tab: Kalender (beranda, hitungan hari bersama dan acara berikutnya), Rencana, Kenangan, Hadiah, dan Kita. Semua form tambah/ubah muncul sebagai panel dari bawah; ketuk item untuk mengubah atau menghapusnya. Font: Plus Jakarta Sans dan Young Serif dari Google Fonts.

## Menjalankan SQL (sekali saja)

Di Supabase → SQL Editor, jalankan berurutan: `01` sampai `05`. Semua skrip aman dijalankan ulang, jadi yang sudah pernah dijalankan boleh dilewati.

- `01` sama dengan `supabase-memory-setup.sql` versi lama. Lewati jika sudah pernah dijalankan.
- `02` membuat/merapikan tabel `profile_photos` dan bucket `profil`.
- `03` memindahkan hobi dari tabel `entries` ke tabel `member_hobbies`. Aplikasi tetap jalan dengan cara lama selama `03` belum dijalankan.

Tabel dasar (`couples`, `couple_members`, `entries`) belum ada di repo ini. Sebaiknya ekspor skemanya agar database bisa dibangun ulang, misalnya lewat Supabase CLI: `supabase db dump --schema public > supabase/00-base-schema.sql`.

## Deploy di Vercel

1. Import repository ini di Vercel, framework **Other**, tanpa build command, output directory default (root).
2. Uji di URL `*.vercel.app`: lihat galeri tanpa login, lalu login sebagai Aiya dan Denan, tambah/ubah/hapus item, ganti foto profil.
3. Setelah normal, pasang domain `kitaberdualovebb.my.id`.

Setiap kali `style.css` atau `app.js` berubah, naikkan `VERSION` di `sw.js` agar HP mengambil versi baru.

## Fitur

- **Hari ini, dulu**: foto dan cerita dari tanggal yang sama di tahun-tahun sebelumnya muncul di beranda.
- **Perayaan**: setiap kelipatan 100 hari bersama dan di hari anniversary, beranda menampilkan ucapan dan animasi hati.
- **Kalender HP**: buka rencana atau tanggal penting, lalu pilih "Kalender HP" (file .ics) atau "Google Calendar". Tanggal penting otomatis berulang tiap tahun.
- **Wishlist → kenangan**: centang wishlist yang sudah dilakukan, lalu langsung upload foto atau tulis ceritanya.
- **Surat untuk nanti** (tab Kita): isi surat dikunci database sampai tanggal bukanya (WIB). Pasangan hanya melihat amplopnya.
- **Rekap tahunan**: muncul di beranda mulai 1 Desember sampai 15 Januari, dan bisa dibuka kapan saja dari tab Kita.

## Ganti foto profil

Ketuk ikon kamera di foto (tab Tentang Kita) → pilih foto → geser dan zoom (bisa cubit dua jari) → Simpan. Foto dipotong bulat di HP, dikompres jadi JPEG 720×720, lalu diunggah, jadi selalu pas di lingkaran dan hemat kuota.

## Keamanan

- Jangan pernah menaruh password, token login, atau `service_role` key Supabase di repo. Kunci `sb_publishable_...` di `app.js` memang publik; pembatasan data ditegakkan oleh RLS.
- Foto galeri dan foto profil **publik** (siapa pun yang punya URL bisa melihat). Jadwal, wishlist, hadiah, hobi, dan cerita tetap privat.
- Repo ini sebaiknya **Private** (Settings → General → Danger Zone → Change visibility).
