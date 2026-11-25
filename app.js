"use strict";

/* ==========================================================
   Konfigurasi
   ========================================================== */

const SUPABASE_URL = "https://qazejhlwfxfbxxrpbvcf.supabase.co";
// Kunci publik (publishable). Keamanan data ditegakkan oleh RLS di Supabase.
const SUPABASE_KEY = "sb_publishable_JkmNx4pmhhVayYOQx2gRlw_4hExgxfs";
const SESSION_KEY = "kb_session";

// Satu-satunya tempat nama & warna pasangan diatur. `slot` = nama foto profil.
const PEOPLE = [
  { name: "Aiya", slot: "aiya", color: "var(--aiya)" },
  { name: "Denan", slot: "denan", color: "var(--denan)" },
];

const ICONS = {
  calendar: '<path d="M7 3v3M17 3v3M4 9h16M5 5h14a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1z"/>',
  spark: '<path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z"/><path d="M19 15l.7 2.3L22 18l-2.3.7L19 21l-.7-2.3L16 18l2.3-.7z"/>',
  photo: '<rect x="3" y="5" width="18" height="15" rx="2"/><circle cx="9" cy="11" r="2"/><path d="M21 17l-5-5-9 8"/>',
  gift: '<rect x="3" y="9" width="18" height="12" rx="1"/><path d="M3 13h18M12 9v12M12 9c-1.5-3-5-4-5-1.5S10 9 12 9zm0 0c1.5-3 5-4 5-1.5S14 9 12 9z"/>',
  heart: '<path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  camera: '<path d="M4 8h3l2-3h6l2 3h3v11H4z"/><circle cx="12" cy="13" r="3.5"/>',
  pin: '<path d="M12 21s-6-5.3-6-11a6 6 0 0 1 12 0c0 5.7-6 11-6 11z"/><circle cx="12" cy="10" r="2"/>',
  upload: '<path d="M12 16V4M7 9l5-5 5 5M4 16v3a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-3"/>',
  check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
  mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3.5 6.5L12 13l8.5-6.5"/>',
  lock: '<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>',
  pen: '<path d="M4 20l4-1 11-11-3-3L5 16z"/><path d="M14 6l3 3"/>',
  chart: '<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>',
  ticket: '<path d="M3 8a2 2 0 0 0 2-2h14a2 2 0 0 0 2 2v2a2 2 0 0 0 0 4v2a2 2 0 0 0-2 2H5a2 2 0 0 0-2-2v-2a2 2 0 0 0 0-4z"/><path d="M14 6v12" stroke-dasharray="2 2.5"/>',
  chat: '<path d="M4 5h16v11H9l-5 4z"/>',
  left: '<path d="M15 5l-7 7 7 7"/>',
  right: '<path d="M9 5l7 7-7 7"/>',
};
const icon = (name, fill = false) =>
  `<svg viewBox="0 0 24 24" fill="${fill ? "currentColor" : "none"}" stroke="currentColor" stroke-width="${fill ? 0 : 1.9}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[name]}</svg>`;

const TABS = [
  { id: "calendar", name: "Kalender", icon: "calendar" },
  { id: "plans", name: "Rencana", icon: "spark" },
  { id: "memories", name: "Kenangan", icon: "photo" },
  { id: "gifts", name: "Hadiah", icon: "gift" },
  { id: "us", name: "Kita", icon: "heart" },
];

// Kategori di tabel `entries` (tidak diubah, data lama tetap terbaca).
const ENTRY_TYPES = {
  schedule: { label: "Kegiatan", title: "Mau ngapain?", placeholder: "Nonton bareng, makan malam…", desc: "Catatan (opsional)", date: true, time: true, location: true },
  important_date: { label: "Tanggal penting", title: "Nama momen", placeholder: "Ulang tahun Aiya…", desc: "Catatan (opsional)", date: true, dateRequired: true },
  wishlist: { label: "Wishlist", title: "Tempat atau kegiatan", placeholder: "Naik kereta ke Jogja…", desc: "Catatan (opsional)", location: true },
  gift: { label: "Ide hadiah", title: "Ide hadiah", placeholder: "Buku resep, jam tangan…", desc: "Catatan hadiah" },
  memory: { label: "Cerita", title: "Judul cerita", placeholder: "Pertama kali ketemu…", desc: "Ceritanya", date: true },
};
const ENTRY_FIELDS = ["title", "description", "event_date", "event_time", "location"];

const DATE_IDEAS = [
  "Ke kafe baru yang belum pernah didatangi",
  "Ke toko buku, saling pilihkan buku",
  "Piknik sore sambil lihat matahari terbenam",
  "Masak menu baru berdua",
  "Photo booth dengan pose paling konyol",
  "Jalan pagi dan sarapan bareng",
  "Movie night dengan camilan favorit",
  "Tulis surat untuk dibuka tahun depan",
  "Main ke pasar malam dan coba jajanan aneh",
  "Bikin playlist untuk satu sama lain",
];

// Pertanyaan harian: urutannya sama untuk kalian berdua, berganti setiap hari (WIB).
const DAILY_QUESTIONS = [
  "Momen kecil apa minggu ini yang bikin kamu senyum?",
  "Lagu apa yang paling mengingatkanmu pada kita?",
  "Kalau besok kita libur seharian, mau ngapain?",
  "Apa kebiasaan kecilku yang diam-diam kamu suka?",
  "Makanan apa yang paling pengin kamu makan bareng aku sekarang?",
  "Kapan pertama kali kamu merasa nyaman banget sama aku?",
  "Satu hal yang ingin kamu coba bareng aku tahun ini?",
  "Apa yang paling bikin kamu capek akhir-akhir ini?",
  "Tempat mana yang pengin kamu datangi lagi berdua?",
  "Apa yang bisa aku lakukan supaya harimu besok lebih ringan?",
  "Film atau series apa yang pengin kamu tonton bareng?",
  "Apa kenangan masa kecil yang paling kamu suka?",
  "Kalau kita punya rumah sendiri, ruangan mana yang paling penting buatmu?",
  "Apa yang paling kamu syukuri dari hubungan kita?",
  "Hadiah sederhana apa yang paling berkesan buatmu?",
  "Kalau bisa teleport sekarang, mau ke mana?",
  "Apa satu hal yang belum pernah kamu ceritakan ke aku?",
  "Bagaimana caramu tahu aku lagi sedih?",
  "Apa julukan buatku yang paling cocok menurutmu?",
  "Apa mimpi besarmu lima tahun lagi?",
  "Kegiatan apa yang bikin kamu lupa waktu?",
  "Kalau hari ini diberi judul, judulnya apa?",
  "Apa yang paling kamu kangen dari aku kalau kita lagi jauh?",
  "Makanan apa yang pengin kamu ajarin aku masak?",
  "Apa sifatmu yang pengin kamu perbaiki?",
  "Momen paling lucu yang pernah kita alami?",
  "Apa definisi kencan sempurna menurutmu?",
  "Apa yang bikin kamu merasa dihargai?",
  "Kalau kita bikin tradisi tahunan, tradisinya apa?",
  "Apa ketakutan kecil yang kamu punya?",
  "Siapa orang yang paling berpengaruh dalam hidupmu?",
  "Apa yang pertama kali kamu pikirkan waktu bangun pagi ini?",
  "Hal kecil apa yang bikin kamu merasa disayang?",
  "Kalau kita punya hewan peliharaan, mau namain apa?",
  "Apa pelajaran terbesar yang kamu dapat tahun ini?",
  "Kalau harus makan satu menu seumur hidup, pilih apa?",
  "Apa yang paling pengin kamu dengar dari aku hari ini?",
  "Musim atau cuaca favoritmu, dan kenapa?",
  "Apa yang bikin kamu jatuh cinta sama aku?",
  "Kalau bisa mengulang satu hari bersama, hari yang mana?",
  "Apa yang ingin kamu lakukan lebih sering bareng aku?",
  "Hobi baru apa yang pengin kita coba berdua?",
  "Apa satu kata yang menggambarkan kita?",
  "Kalau kamu nulis surat ke dirimu 10 tahun lalu, isinya apa?",
  "Hal apa yang bikin kamu bangga sama aku?",
  "Apa rencana kecil kita untuk akhir pekan ini?",
  "Kebiasaan pagi apa yang paling kamu suka?",
  "Apa lagu yang pengin kamu nyanyiin bareng aku?",
  "Kalau kita menang undian, uangnya mau dipakai untuk apa dulu?",
  "Apa yang paling kamu suka dari cara kita berbaikan?",
  "Satu hal yang pengin kamu bilang ke aku tapi suka lupa?",
  "Apa yang membuatmu merasa paling jadi diri sendiri?",
  "Kalau hidup kita jadi film, genrenya apa?",
  "Apa momen yang bikin kamu yakin sama kita?",
];

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
const MB = 1024 * 1024;
const IMAGE_EXT = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp", "image/gif": "gif" };
const MEMORY_MAX_BYTES = 25 * MB; // foto dikompres di HP sebelum diupload
const MEMORY_OUTPUT_PX = 1600;
const SNAP_OUTPUT_PX = 1080;
const SNAP_CAPTION_MAX = 120;
const MEMORY_MAX_FILES = 3;
const AVATAR_SOURCE_MAX_BYTES = 25 * MB;
const AVATAR_OUTPUT_PX = 720;
const ZOOM_MAX = 4;
const MILESTONE_STEP = 100; // dirayakan setiap kelipatan 100 hari bersama
const MONTHS_LONG = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];

/* ==========================================================
   State
   ========================================================== */

const state = {
  session: null,
  couple: null,
  members: [],
  entries: [],
  photos: [],
  profilePhotos: [],
  hobbies: {},
  hobbiesTable: false,
  photoError: "",
  loginError: "",
  showLogin: false,
  tab: "calendar",
  ideaIndex: Math.floor(Math.random() * DATE_IDEAS.length),
  introPlayed: false,
  pendingPhotos: [], // [{ file, url }]
  letters: [],
  lettersReady: false, // false = tabel surat belum dibuat (SQL 05)
  answers: [],
  answersReady: false, // SQL 06
  coupons: [],
  couponsReady: false, // SQL 07
  snaps: [],
  snapsReady: false, // SQL 09
  snapUrls: {}, // storage_path -> signed URL
  pendingSnap: null, // { blob, url }
  albumsSupported: true, // false jika kolom album_id belum ada (SQL 08)
  celebrated: false,
};

/* ==========================================================
   Utilitas
   ========================================================== */

const $ = (selector, root = document) => root.querySelector(selector);
const ESC_MAP = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };
const esc = (value) => String(value ?? "").replace(/[&<>"']/g, (c) => ESC_MAP[c]);
const encodePath = (path) => path.split("/").map(encodeURIComponent).join("/");
const eq = (value) => "eq." + encodeURIComponent(value);
const nowSeconds = () => Math.floor(Date.now() / 1000);
const prefersReducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const pad = (n) => String(n).padStart(2, "0");
const coupleNames = (sep = " & ") => PEOPLE.map((p) => p.name).join(sep);

function formValue(form, name) {
  const el = form.elements.namedItem(name);
  return el?.value?.trim() || null;
}

function field(id, label, control) {
  return `<div class="field"><label for="${id}">${label}</label>${control}</div>`;
}

async function withBusy(button, busyText, task) {
  const original = button?.innerHTML;
  if (button) {
    button.disabled = true;
    button.textContent = busyText;
  }
  try {
    return await task();
  } finally {
    if (button?.isConnected) {
      button.disabled = false;
      button.innerHTML = original;
    }
  }
}

let toastTimer;
function toast(message, bad = false) {
  const el = $("#toast");
  el.textContent = message;
  el.classList.toggle("toast--bad", bad);
  el.classList.add("is-visible");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove("is-visible"), 4500);
}

/* ---------- Tanggal ---------- */

function todayISO() {
  const d = new Date();
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}
const isoToDay = (iso) => {
  const [y, m, d] = iso.split("-").map(Number);
  return Date.UTC(y, m - 1, d) / 86400000;
};
const daysUntil = (iso) => isoToDay(iso) - isoToDay(todayISO());

function formatDate(iso, withYear = true) {
  if (!iso) return "";
  return new Date(iso + "T12:00:00").toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    ...(withYear ? { year: "numeric" } : {}),
  });
}

// Kemunculan berikutnya untuk tanggal yang berulang tiap tahun.
function nextYearly(iso) {
  const [y, m, d] = iso.split("-").map(Number);
  const today = todayISO();
  let year = Number(today.slice(0, 4));
  let next = `${year}-${pad(m)}-${pad(d)}`;
  if (next < today) next = `${++year}-${pad(m)}-${pad(d)}`;
  return { iso: next, days: daysUntil(next), years: year - y };
}

function whenLabel(days) {
  if (days === 0) return "Hari ini";
  if (days === 1) return "Besok";
  if (days < 0) return `${-days} hari lalu`;
  return `${days} hari lagi`;
}

// Tanggal hari ini menurut WIB, sama dengan yang dipakai database.
function wibToday() {
  return new Date(Date.now() + 7 * 3600000).toISOString().slice(0, 10);
}
function questionFor(day) {
  return DAILY_QUESTIONS[((isoToDay(day) % DAILY_QUESTIONS.length) + DAILY_QUESTIONS.length) % DAILY_QUESTIONS.length];
}

function addDaysISO(iso, n) {
  const d = new Date((isoToDay(iso) + n) * 86400000);
  return d.toISOString().slice(0, 10);
}
const sameMonthDay = (iso, ref) => iso && iso.slice(5, 10) === ref.slice(5, 10);

function daysTogether() {
  const start = state.couple?.anniversary_date;
  return start ? Math.max(0, -daysUntil(start)) : 0;
}

/* ==========================================================
   Sesi login
   ========================================================== */

function saveSession(session) {
  state.session = session;
  if (session) localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  else localStorage.removeItem(SESSION_KEY);
}

function readStoredSession() {
  try {
    return JSON.parse(localStorage.getItem(SESSION_KEY) || "null");
  } catch {
    return null;
  }
}

function clearCoupleData() {
  Object.assign(state, {
    couple: null, members: [], entries: [], hobbies: {},
    letters: [], lettersReady: false, answers: [], answersReady: false, coupons: [], couponsReady: false,
  });
}

let refreshPromise = null;
function refreshSession() {
  if (!state.session?.refresh_token) return Promise.reject(new Error("Sesi berakhir. Silakan masuk lagi."));
  if (!refreshPromise) {
    refreshPromise = (async () => {
      const res = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=refresh_token`, {
        method: "POST",
        headers: { apikey: SUPABASE_KEY, "Content-Type": "application/json" },
        body: JSON.stringify({ refresh_token: state.session.refresh_token }),
      });
      if (!res.ok) {
        saveSession(null);
        clearCoupleData();
        closeSheet();
        render();
        throw new Error("Sesi berakhir. Silakan masuk lagi.");
      }
      const session = await res.json();
      saveSession(session);
      return session;
    })().finally(() => {
      refreshPromise = null;
    });
  }
  return refreshPromise;
}

/* ==========================================================
   HTTP ke Supabase
   ========================================================== */

async function readError(res) {
  const text = await res.text().catch(() => "");
  let data = null;
  try {
    data = JSON.parse(text);
  } catch {}
  return data?.msg || data?.error_description || data?.message || data?.error || `Kesalahan server (${res.status})`;
}

async function request(path, options = {}, isRetry = false) {
  if (!isRetry && state.session?.expires_at && state.session.expires_at - nowSeconds() < 60) {
    await refreshSession();
  }
  const headers = { apikey: SUPABASE_KEY, ...options.headers };
  if (state.session?.access_token) headers.Authorization = "Bearer " + state.session.access_token;

  const res = await fetch(SUPABASE_URL + path, { ...options, headers });
  if (res.ok) return res;

  const message = await readError(res);
  const expired = res.status === 401 || /jwt expired/i.test(message);
  if (expired && !isRetry && state.session?.refresh_token) {
    await refreshSession();
    return request(path, options, true);
  }
  throw new Error(message);
}

async function api(path, options = {}) {
  const res = await request(path, { ...options, headers: { "Content-Type": "application/json", ...options.headers } });
  const text = await res.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    throw new Error("Respons server tidak bisa dibaca.");
  }
}

const storage = {
  publicUrl: (bucket, path) => `${SUPABASE_URL}/storage/v1/object/public/${bucket}/${encodePath(path)}`,
  upload: (bucket, path, blob) =>
    request(`/storage/v1/object/${bucket}/${encodePath(path)}`, {
      method: "POST",
      headers: { "Content-Type": blob.type, "x-upsert": "false" },
      body: blob,
    }),
  remove: (bucket, path) => request(`/storage/v1/object/${bucket}/${encodePath(path)}`, { method: "DELETE" }),
  // URL sementara untuk bucket privat (dipakai PAP harian)
  async signedUrl(bucket, path, expiresIn = 3600) {
    const data = await api(`/storage/v1/object/sign/${bucket}/${encodePath(path)}`, { method: "POST", body: JSON.stringify({ expiresIn }) });
    return data?.signedURL ? `${SUPABASE_URL}/storage/v1${data.signedURL}` : "";
  },
};

/* ---------- Kompres foto di HP sebelum diupload ---------- */

async function loadImage(file) {
  if ("createImageBitmap" in window) {
    try {
      return await createImageBitmap(file, { imageOrientation: "from-image" });
    } catch {
      /* lanjut ke cara lama */
    }
  }
  const url = URL.createObjectURL(file);
  try {
    const img = new Image();
    img.src = url;
    await img.decode();
    return img;
  } finally {
    URL.revokeObjectURL(url);
  }
}

// Simpan pilihan mirror PAP per perangkat (kamera tiap HP beda perilaku)
const SNAP_MIRROR_KEY = "kb:snapMirror";
function snapMirrorPref() {
  try { return localStorage.getItem(SNAP_MIRROR_KEY) === "1"; } catch { return false; }
}
function saveSnapMirrorPref(v) {
  try { localStorage.setItem(SNAP_MIRROR_KEY, v ? "1" : "0"); } catch {}
}

async function compressImage(file, maxPx, quality = 0.85, { mirror = false } = {}) {
  const img = await loadImage(file).catch(() => {
    throw new Error("Foto tidak bisa dibaca. Coba foto lain.");
  });
  const scale = Math.min(1, maxPx / Math.max(img.width, img.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(img.width * scale);
  canvas.height = Math.round(img.height * scale);
  const ctx = canvas.getContext("2d");
  if (mirror) {
    // Balik horizontal (seperti cermin), biasanya untuk selfie kamera depan
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);
  }
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  img.close?.();
  return new Promise((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("Gagal memproses foto."))), "image/jpeg", quality),
  );
}

/* ==========================================================
   Memuat data
   ========================================================== */

async function loadPhotos() {
  try {
    // select=* supaya kolom album_id ikut terbaca bila sudah ada (SQL 08)
    state.photos = (await api("/rest/v1/memory_photos?select=*&order=created_at.desc")) || [];
    state.photoError = "";
  } catch {
    state.photos = [];
    state.photoError = "Galeri belum tersedia. Jalankan SQL galeri di Supabase terlebih dahulu.";
  }
}

async function loadProfilePhotos() {
  try {
    state.profilePhotos = (await api("/rest/v1/profile_photos?select=couple_id,slot,storage_path")) || [];
  } catch {
    state.profilePhotos = [];
  }
}

const legacyHobbyEntry = (name) =>
  state.entries.find((x) => x.category === "date_idea" && x.title === "hobbies:" + name);

async function loadHobbies() {
  try {
    const rows = await api(`/rest/v1/member_hobbies?select=person,hobbies&couple_id=${eq(state.couple.id)}`);
    state.hobbiesTable = true;
    state.hobbies = Object.fromEntries((rows || []).map((r) => [r.person, r.hobbies || ""]));
  } catch {
    state.hobbiesTable = false;
    state.hobbies = Object.fromEntries(PEOPLE.map((p) => [p.name, legacyHobbyEntry(p.name)?.description || ""]));
  }
}

async function loadLetters() {
  try {
    state.letters = (await api("/rest/v1/rpc/list_letters", { method: "POST", body: "{}" })) || [];
    state.lettersReady = true;
  } catch {
    state.letters = [];
    state.lettersReady = false;
  }
}

async function loadAnswers() {
  try {
    state.answers = (await api("/rest/v1/rpc/list_answers", { method: "POST", body: "{}" })) || [];
    state.answersReady = true;
  } catch {
    state.answers = [];
    state.answersReady = false;
  }
}

async function loadSnaps() {
  try {
    state.snaps = (await api("/rest/v1/rpc/list_snaps_today", { method: "POST", body: "{}" })) || [];
    state.snapsReady = true;
  } catch {
    state.snaps = [];
    state.snapsReady = false;
    return;
  }
  await Promise.all(
    state.snaps
      .filter((s) => s.storage_path && !state.snapUrls[s.storage_path])
      .map(async (s) => {
        state.snapUrls[s.storage_path] = await storage.signedUrl("pap", s.storage_path).catch(() => "");
      }),
  );
}

// PAP milikku dari hari-hari sebelumnya dihapus otomatis (PAP hanya berlaku sehari).
async function cleanupOldSnaps() {
  if (!state.snapsReady) return;
  const old = await api(`/rest/v1/daily_snaps?select=id,storage_path&author_id=${eq(myUserId())}&day=lt.${wibToday()}`).catch(() => []);
  for (const s of old || []) {
    await api(`/rest/v1/daily_snaps?id=${eq(s.id)}`, { method: "DELETE" }).catch(() => {});
    await storage.remove("pap", s.storage_path).catch(() => {});
  }
}

async function loadCoupons() {
  try {
    state.coupons = (await api(`/rest/v1/love_coupons?select=*&couple_id=${eq(state.couple.id)}&order=created_at.desc`)) || [];
    state.couponsReady = true;
  } catch {
    state.coupons = [];
    state.couponsReady = false;
  }
}

async function loadCouple() {
  const memberships = await api(`/rest/v1/couple_members?select=couple_id&user_id=${eq(state.session.user.id)}`);
  if (!memberships?.length) {
    clearCoupleData();
    return;
  }
  const id = memberships[0].couple_id;
  const [couples, members, entries] = await Promise.all([
    api(`/rest/v1/couples?select=*&id=${eq(id)}`),
    api(`/rest/v1/couple_members?select=couple_id,display_name,user_id&couple_id=${eq(id)}`),
    api(`/rest/v1/entries?select=*&couple_id=${eq(id)}&order=created_at.desc`),
  ]);
  state.couple = couples?.[0] || null;
  state.members = members || [];
  state.entries = entries || [];
  if (state.couple) await Promise.all([loadProfilePhotos(), loadHobbies(), loadLetters(), loadAnswers(), loadCoupons(), loadSnaps()]);
  cleanupOldSnaps();
}

async function reload() {
  await loadCouple();
  render();
}

/* ==========================================================
   Komponen tampilan
   ========================================================== */

function profileUrl(slot) {
  const photo = state.profilePhotos.find((p) => p.slot === slot && (!state.couple || p.couple_id === state.couple.id));
  return photo ? storage.publicUrl("profil", photo.storage_path) : "";
}

// Dua lingkaran yang saling bertemu: identitas visual aplikasi.
function venn(size = "lg") {
  const intro = size === "lg" && !state.introPlayed && !prefersReducedMotion();
  if (size === "lg") state.introPlayed = true;
  const circles = PEOPLE.map((p) => {
    const url = profileUrl(p.slot);
    const inner = url ? `<img src="${esc(url)}" alt="" decoding="async">` : esc(p.name.charAt(0));
    return `<div class="venn__circle" style="--c:${p.color}"><div class="venn__frame">${inner}</div></div>`;
  }).join("");
  return `<div class="venn venn--${size} ${intro ? "venn--intro" : ""}" role="img" aria-label="${esc(coupleNames(" dan "))}">
    ${circles}<span class="venn__heart">${icon("heart", true)}</span></div>`;
}

function avatar(slot, { label, color = "var(--kita)", size = "", couple = false, fallback = "" }) {
  const url = profileUrl(slot);
  const inner = url ? `<img src="${esc(url)}" alt="${esc(label)}" decoding="async">` : fallback;
  return `<div class="avatar ${size ? "avatar--" + size : ""} ${couple ? "avatar--couple" : ""}" style="--c:${color}">
    <div class="avatar__frame">${inner}</div>
    <button type="button" class="avatar__edit" data-action="pick-photo" data-slot="${esc(slot)}" data-label="${esc(label)}" aria-label="Ganti ${esc(label)}">${icon("camera")}</button>
  </div>`;
}

function addButton(kind, text = "Tambah") {
  return `<button type="button" class="add-btn" data-action="add" data-kind="${kind}">${icon("plus")}${text}</button>`;
}

function emptyState(text, kind, buttonText) {
  return `<div class="empty"><p>${text}</p>${kind ? addButton(kind, buttonText) : ""}</div>`;
}

function dateBlock(iso, variant = "") {
  if (!iso) return `<span class="date-block date-block--none"><span class="date-block__day">–</span><span class="date-block__mon">Kapan?</span></span>`;
  const [, m, d] = iso.split("-").map(Number);
  return `<span class="date-block ${variant}"><span class="date-block__day">${d}</span><span class="date-block__mon">${MONTHS[m - 1]}</span></span>`;
}

function entryRow(x, { lead, chip = "", chipClass = "", meta } = {}) {
  const metaText = meta ?? [x.event_time?.slice(0, 5), x.location].filter(Boolean).map(esc).join(" · ");
  return `<button type="button" class="row" data-action="edit" data-id="${esc(x.id)}">
    ${lead}
    <span class="row__body">
      <span class="row__title">${esc(x.title)}</span>
      ${metaText ? `<span class="row__meta">${metaText}</span>` : ""}
      ${x.description ? `<span class="row__desc">${esc(x.description)}</span>` : ""}
    </span>
    ${chip ? `<span class="chip ${chipClass}">${chip}</span>` : ""}
  </button>`;
}

function markIcon(name) {
  return `<span class="row__mark">${icon(name)}</span>`;
}

const entriesOf = (cat) => state.entries.filter((e) => e.category === cat);

/* ---------- Siapa aku, siapa pasangan ---------- */

const personByName = (name) => PEOPLE.find((p) => p.name.toLowerCase() === String(name || "").trim().toLowerCase());
const myUserId = () => state.session?.user?.id;
function myName() {
  const displayName = state.members.find((m) => m.user_id === myUserId())?.display_name;
  return personByName(displayName)?.name || displayName || PEOPLE[0].name;
}
const partnerName = () => PEOPLE.find((p) => p.name !== myName())?.name || "pasanganmu";
const colorOf = (name) => personByName(name)?.color || "var(--kita)";

/* ---------- Hari spesial ---------- */

function nextMilestone() {
  if (!state.couple?.anniversary_date) return null;
  const days = daysTogether();
  const target = (Math.floor(days / MILESTONE_STEP) + 1) * MILESTONE_STEP;
  return { target, days: target - days };
}

function todayCelebration() {
  const start = state.couple?.anniversary_date;
  if (!start) return null;
  const yearly = nextYearly(start);
  if (yearly.days === 0 && yearly.years > 0) {
    return { emoji: "💞", title: `Selamat anniversary ke-${yearly.years}!`, sub: `${yearly.years} tahun lalu, cerita ini dimulai.` };
  }
  const days = daysTogether();
  if (days > 0 && days % MILESTONE_STEP === 0) {
    return { emoji: "🎉", title: `Hari ke-${days.toLocaleString("id-ID")} bersama!`, sub: "Terima kasih sudah memilih satu sama lain setiap hari." };
  }
  return null;
}

function onThisDay() {
  const today = todayISO();
  const thisYear = today.slice(0, 4);
  const earlier = (iso) => sameMonthDay(iso, today) && iso.slice(0, 4) < thisYear;
  return {
    photos: state.photos.filter((p) => earlier(p.taken_on)),
    stories: state.entries.filter((e) => (e.category === "memory" || e.category === "schedule") && earlier(e.event_date)),
  };
}
const yearsAgo = (iso) => `${Number(todayISO().slice(0, 4)) - Number(iso.slice(0, 4))} tahun lalu`;

function recapYearInSeason() {
  const today = todayISO();
  const month = Number(today.slice(5, 7));
  const day = Number(today.slice(8, 10));
  if (month === 12) return Number(today.slice(0, 4));
  if (month === 1 && day <= 15) return Number(today.slice(0, 4)) - 1;
  return null;
}

/* ---------- Beranda: Kalender ---------- */

function upcomingItems() {
  const today = todayISO();
  const items = [];
  for (const x of entriesOf("schedule")) {
    if (x.event_date && x.event_date >= today) items.push({ icon: "📅", title: x.title, days: daysUntil(x.event_date) });
  }
  for (const x of entriesOf("important_date")) {
    if (x.event_date) items.push({ icon: "🎂", title: x.title, days: nextYearly(x.event_date).days });
  }
  if (state.couple?.anniversary_date) {
    const next = nextYearly(state.couple.anniversary_date);
    if (next.years > 0) items.push({ icon: "💞", title: `Anniversary ke-${next.years}`, days: next.days });
    const milestone = nextMilestone();
    items.push({ icon: "✨", title: `${milestone.target.toLocaleString("id-ID")} hari bersama`, days: milestone.days });
  }
  for (const letter of state.letters) {
    if (!letter.is_locked) continue;
    const mine = letter.author_id === myUserId();
    items.push({ icon: "💌", title: mine ? `Suratmu untuk ${partnerName()} terbuka` : `Surat dari ${letter.author_name} terbuka`, days: daysUntil(letter.unlock_on) });
  }
  return items.sort((a, b) => a.days - b.days);
}

function heroView() {
  const next = upcomingItems()[0];
  const anniversary = state.couple?.anniversary_date;
  const party = todayCelebration();
  const burst = party && !state.celebrated && !prefersReducedMotion();
  if (party) state.celebrated = true;
  return `<section class="hero ${party ? "hero--party" : ""}">
    ${burst ? `<div class="hearts" aria-hidden="true">${Array.from({ length: 14 }, (_, i) => `<span style="--i:${i}">♥</span>`).join("")}</div>` : ""}
    ${party ? `<p class="party"><span aria-hidden="true">${party.emoji}</span> ${esc(party.title)}<small>${esc(party.sub)}</small></p>` : ""}
    ${venn("lg")}
    <h1 class="hero__names">${esc(coupleNames())}</h1>
    ${
      anniversary
        ? `<p class="counter"><span class="counter__num">${daysTogether().toLocaleString("id-ID")}</span>
           <span class="counter__label">hari bersama sejak ${esc(formatDate(anniversary))}</span></p>`
        : `<button type="button" class="setup-hint" data-action="edit-anniversary">Atur tanggal jadian supaya hitungan hari kita muncul di sini ♡</button>`
    }
    ${
      next
        ? `<div class="next-up"><span class="next-up__icon" aria-hidden="true">${next.icon}</span>
           <span><small>Berikutnya</small><strong>${esc(next.title)}, ${esc(whenLabel(next.days).toLowerCase())}</strong></span></div>`
        : ""
    }
  </section>`;
}

function calendarView() {
  const today = todayISO();
  const schedule = entriesOf("schedule");
  const upcoming = schedule
    .filter((x) => x.event_date && x.event_date >= today)
    .sort((a, b) => (a.event_date + (a.event_time || "")).localeCompare(b.event_date + (b.event_time || "")));
  const undated = schedule.filter((x) => !x.event_date);
  const past = schedule.filter((x) => x.event_date && x.event_date < today).sort((a, b) => b.event_date.localeCompare(a.event_date));
  const special = entriesOf("important_date")
    .map((x) => ({ x, next: x.event_date ? nextYearly(x.event_date) : null }))
    .sort((a, b) => (a.next?.days ?? 9999) - (b.next?.days ?? 9999));

  const upcomingRows = [
    ...upcoming.map((x) => {
      const days = daysUntil(x.event_date);
      return entryRow(x, { lead: dateBlock(x.event_date), chip: whenLabel(days), chipClass: days === 0 ? "chip--today" : "" });
    }),
    ...undated.map((x) => entryRow(x, { lead: dateBlock(null) })),
  ].join("");

  const specialRows = special
    .map(({ x, next }) =>
      entryRow(x, {
        lead: dateBlock(x.event_date, "date-block--special"),
        chip: next ? whenLabel(next.days) : "",
        chipClass: next?.days === 0 ? "chip--today" : "chip--special",
        meta: x.event_date ? `Setiap ${esc(formatDate(x.event_date, false))}` : "",
      }),
    )
    .join("");

  return `${heroView()}
    ${snapCard()}
    ${dailyCard()}
    ${homeExtras()}
    <section class="section">
      <div class="section-head"><h2>Akan datang</h2>${addButton("calendar")}</div>
      ${upcomingRows ? `<div class="list">${upcomingRows}</div>` : emptyState("Belum ada rencana. Kencan berikutnya kapan, nih?", "calendar", "Tambah rencana")}
      ${
        past.length
          ? `<details class="past"><summary>Sudah lewat (${past.length})</summary>
             <div class="list">${past.map((x) => entryRow(x, { lead: dateBlock(x.event_date), meta: esc(formatDate(x.event_date)) })).join("")}</div></details>`
          : ""
      }
    </section>
    <section class="section">
      <div class="section-head"><div><h2>Tanggal penting</h2><p class="hint">Diingatkan setiap tahun</p></div>${addButton("special")}</div>
      ${specialRows ? `<div class="list">${specialRows}</div>` : emptyState("Ulang tahun, hari pertama ketemu, apa saja yang ingin diingat.", "special", "Tambah tanggal")}
    </section>`;
}

/* ---------- PAP harian ---------- */

function snapTile(snap, name) {
  const color = colorOf(name);
  if (!snap) {
    return `<figure class="snap snap--empty" style="--c:${color}"><div class="snap__frame"><span>Belum kirim</span></div>
      <figcaption><strong>${esc(name)}</strong></figcaption></figure>`;
  }
  const url = snap.storage_path ? state.snapUrls[snap.storage_path] : "";
  const time = new Date(snap.created_at).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", timeZone: "Asia/Jakarta" });
  const frame = snap.is_locked
    ? `<div class="snap__frame snap__frame--locked"><span>${icon("lock")} Kirim PAP-mu dulu</span></div>`
    : url
      ? `<button type="button" class="snap__frame" data-action="view-snap" data-id="${esc(snap.id)}" aria-label="Lihat PAP ${esc(name)}"><img src="${esc(url)}" alt="PAP ${esc(name)}" decoding="async"></button>`
      : `<div class="snap__frame"><span>Foto tidak bisa dimuat</span></div>`;
  return `<figure class="snap" style="--c:${color}">${frame}
    <figcaption><strong>${esc(name)}</strong> · ${esc(time)}${snap.caption ? `<span>${esc(snap.caption)}</span>` : ""}</figcaption></figure>`;
}

function snapCard() {
  if (!state.snapsReady) {
    return `<section class="daily"><p class="daily__label">${icon("camera")} PAP hari ini</p>
      <p class="notice" style="margin:8px 0 0">Fitur ini perlu SQL <code>09-daily-snaps.sql</code> dijalankan dulu di Supabase.</p></section>`;
  }
  const me = myName();
  const partner = partnerName();
  const mine = state.snaps.find((s) => s.author_id === myUserId());
  const theirs = state.snaps.find((s) => s.author_id !== myUserId());
  const status = mine
    ? theirs
      ? "PAP kalian hari ini ♡ Hilang besok."
      : `Menunggu PAP dari ${esc(partner)}…`
    : theirs
      ? `${esc(partner)} sudah kirim PAP! Kirim punyamu untuk membukanya.`
      : "Lagi ngapain? Kirim satu foto, tanpa filter.";
  return `<section class="daily snaps-card">
    <p class="daily__label">${icon("camera")} PAP hari ini</p>
    <p class="daily__status" style="margin-top:6px">${status}</p>
    <div class="snaps">${snapTile(mine, me)}${snapTile(theirs, partner)}</div>
    <button type="button" class="btn ${mine ? "btn--soft" : ""} btn--block" data-action="take-snap">${icon("camera")} ${mine ? "Ganti PAP-ku" : "Kirim PAP"}</button>
  </section>`;
}

const snapPicker = $("#snap-picker");

/* Kamera di dalam aplikasi: pratinjau & hasil sama-sama mirror untuk kamera depan,
   tidak tergantung setelan kamera bawaan HP. Input file tetap jadi cadangan. */
let snapCam = null; // { stream, facing }
let snapFacing = "user";

function stopSnapCamera() {
  snapCam?.stream.getTracks().forEach((t) => t.stop());
  snapCam = null;
}

async function startSnapCamera(facing) {
  stopSnapCamera();
  const stream = await navigator.mediaDevices.getUserMedia({
    video: { facingMode: facing, width: { ideal: 1920 }, height: { ideal: 1920 } },
    audio: false,
  });
  const video = document.querySelector(".snap-cam__video");
  if (!video) {
    // Sheet sudah ditutup selagi menunggu izin kamera
    stream.getTracks().forEach((t) => t.stop());
    return;
  }
  snapCam = { stream, facing };
  video.srcObject = stream;
  video.classList.toggle("is-mirrored", facing === "user");
  await video.play().catch(() => {});
}

async function takeSnap() {
  if (!navigator.mediaDevices?.getUserMedia) return takeSnapFromFile();
  openSheet(
    "Kirim PAP",
    `<div class="snap-cam">
      <video class="snap-cam__video" playsinline muted autoplay></video>
    </div>
    <div class="sheet__actions">
      <button type="button" class="btn btn--ghost" data-action="switch-snap-cam">Putar kamera</button>
      <button type="button" class="btn" data-action="shoot-snap">Jepret</button>
    </div>
    <p class="help"><button type="button" class="link-btn" data-action="take-snap-file">Kamera tidak muncul? Pakai kamera HP</button></p>`,
  );
  try {
    await startSnapCamera(snapFacing);
  } catch {
    toast("Kamera tidak bisa dibuka. Izinkan akses kamera, atau pakai kamera HP.", true);
  }
}

async function switchSnapCamera() {
  snapFacing = snapFacing === "user" ? "environment" : "user";
  try {
    await startSnapCamera(snapFacing);
  } catch {
    toast("Kamera ini tidak tersedia.", true);
  }
}

async function shootSnap() {
  const video = document.querySelector(".snap-cam__video");
  if (!snapCam || !video?.videoWidth) return;
  const scale = Math.min(1, SNAP_OUTPUT_PX / Math.max(video.videoWidth, video.videoHeight));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(video.videoWidth * scale);
  canvas.height = Math.round(video.videoHeight * scale);
  canvas.getContext("2d").drawImage(video, 0, 0, canvas.width, canvas.height);
  const raw = await new Promise((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("Gagal mengambil foto."))), "image/jpeg", 0.95),
  );
  // Kamera depan: hasil dibalik supaya sama persis dengan yang terlihat di layar
  await showSnapPreview(raw, snapCam.facing === "user");
}

function takeSnapFromFile() {
  snapPicker.value = "";
  snapPicker.click();
}

async function showSnapPreview(source, mirror) {
  const blob = await compressImage(source, SNAP_OUTPUT_PX, 0.82, { mirror });
  if (state.pendingSnap) URL.revokeObjectURL(state.pendingSnap.url);
  state.pendingSnap = { file: source, mirror, blob, url: URL.createObjectURL(blob) };
  openSheet(
    "Kirim PAP",
    `<form data-form="snap">
      <img class="snap-preview" src="${esc(state.pendingSnap.url)}" alt="Pratinjau PAP">
      ${field("s-caption", "Caption (opsional)", `<input id="s-caption" name="caption" maxlength="${SNAP_CAPTION_MAX}" placeholder="Lagi di mana, ngapain?">`)}
      <p class="help">${esc(partnerName())} baru bisa melihatnya setelah ikut kirim PAP hari ini. Besok PAP ini hilang.</p>
      <div class="sheet__actions">
        <button type="button" class="btn btn--ghost" data-action="take-snap">Foto ulang</button>
        <button type="button" class="btn btn--ghost" data-action="flip-snap">Balik</button>
        <button type="submit" class="btn">Kirim</button>
      </div>
    </form>`,
  );
}

snapPicker?.addEventListener("change", async () => {
  const file = snapPicker.files[0];
  if (!file) return;
  try {
    await showSnapPreview(file, snapMirrorPref());
  } catch (err) {
    toast(err.message, true);
  }
});

// Ganti mirror/tidak tanpa menutup sheet (caption yang sudah diketik tetap aman)
async function flipSnap() {
  const p = state.pendingSnap;
  if (!p?.file) return;
  const mirror = !p.mirror;
  saveSnapMirrorPref(mirror);
  const blob = await compressImage(p.file, SNAP_OUTPUT_PX, 0.82, { mirror });
  URL.revokeObjectURL(p.url);
  state.pendingSnap = { ...p, mirror, blob, url: URL.createObjectURL(blob) };
  const img = document.querySelector(".snap-preview");
  if (img) img.src = state.pendingSnap.url;
}

async function sendSnap(form) {
  if (!state.pendingSnap) throw new Error("Ambil foto dulu.");
  const old = state.snaps.find((s) => s.author_id === myUserId());
  const path = `${state.couple.id}/${myUserId()}/${crypto.randomUUID()}.jpg`;
  await storage.upload("pap", path, state.pendingSnap.blob);
  try {
    if (old) await api(`/rest/v1/daily_snaps?id=${eq(old.id)}`, { method: "DELETE" });
    await api("/rest/v1/daily_snaps", {
      method: "POST",
      headers: { Prefer: "return=minimal" },
      body: JSON.stringify({ couple_id: state.couple.id, author_name: myName(), storage_path: path, caption: formValue(form, "caption") || null }),
    });
  } catch (err) {
    await storage.remove("pap", path).catch(() => {});
    throw err;
  }
  if (old?.storage_path) storage.remove("pap", old.storage_path).catch(() => {});
  URL.revokeObjectURL(state.pendingSnap.url);
  state.pendingSnap = null;
  closeSheet();
  await loadSnaps();
  render();
  const theirs = state.snaps.find((s) => s.author_id !== myUserId());
  toast(theirs ? `Terbuka! Lihat PAP ${theirs.author_name} ♡` : "PAP terkirim ♡");
}

function viewSnap(id) {
  const snap = state.snaps.find((s) => s.id === id);
  const url = snap?.storage_path && state.snapUrls[snap.storage_path];
  if (!url) return;
  openSheet(
    `PAP ${esc(snap.author_name)}`,
    `<img class="snap-preview" src="${esc(url)}" alt="PAP ${esc(snap.author_name)}">
     ${snap.caption ? `<p class="snap-caption">${esc(snap.caption)}</p>` : ""}
     <p class="help">PAP hilang besok. Simpan ke Kenangan kalau mau diabadikan.</p>
     <div class="sheet__actions"><button type="button" class="btn" data-action="keep-snap" data-id="${esc(snap.id)}">${icon("heart")} Simpan ke Kenangan</button></div>`,
  );
}

async function keepSnap(id) {
  const snap = state.snaps.find((s) => s.id === id);
  const url = snap?.storage_path && state.snapUrls[snap.storage_path];
  if (!url) throw new Error("Foto tidak tersedia.");
  const res = await fetch(url);
  if (!res.ok) throw new Error("Gagal mengambil foto.");
  const blob = await res.blob();
  const path = `${state.couple.id}/${crypto.randomUUID()}.jpg`;
  await storage.upload("kenangan", path, new Blob([blob], { type: "image/jpeg" }));
  try {
    await api("/rest/v1/memory_photos", {
      method: "POST",
      headers: { Prefer: "return=minimal" },
      body: JSON.stringify({ couple_id: state.couple.id, storage_path: path, title: `PAP ${snap.author_name}`, taken_on: snap.day, caption: snap.caption || "" }),
    });
  } catch (err) {
    await storage.remove("kenangan", path).catch(() => {});
    throw err;
  }
  closeSheet();
  await loadPhotos();
  render();
  toast("Disimpan ke Kenangan ♡");
}

/* ---------- Pertanyaan harian ---------- */

function answerBubble(a, { hiddenText } = {}) {
  const name = a.author_name;
  return `<div class="answer" style="--c:${colorOf(name)}"><span class="answer__who">${esc(name)}</span>
    ${a.answer != null ? `<p>${esc(a.answer)}</p>` : `<p class="answer__hidden">${icon("lock")} ${esc(hiddenText || "Tersembunyi")}</p>`}</div>`;
}

function dailyCard() {
  if (!state.answersReady) {
    return `<section class="daily"><p class="daily__label">${icon("chat")} Pertanyaan hari ini</p>
      <p class="notice" style="margin:8px 0 0">Fitur ini perlu SQL <code>06-daily-questions.sql</code> dijalankan dulu di Supabase.</p></section>`;
  }
  const day = wibToday();
  const todays = state.answers.filter((a) => a.day === day);
  const mine = todays.find((a) => a.author_id === myUserId());
  const theirs = todays.find((a) => a.author_id !== myUserId());
  const question = mine?.question || theirs?.question || questionFor(day);
  const partner = partnerName();
  const pastDays = new Set(state.answers.filter((a) => a.day < day).map((a) => a.day)).size;

  let body;
  if (!mine) {
    body = `${theirs ? `<p class="daily__status">${esc(partner)} sudah menjawab. Jawab dulu untuk membuka jawabannya ♡</p>` : `<p class="daily__status">Belum ada yang menjawab. Kamu duluan?</p>`}
      <button type="button" class="btn" data-action="answer-daily">Jawab</button>`;
  } else {
    body = `<div class="answers">${answerBubble(mine)}${
      theirs ? answerBubble(theirs) : `<div class="answer answer--waiting" style="--c:${colorOf(partner)}"><span class="answer__who">${esc(partner)}</span><p class="answer__hidden">Belum menjawab…</p></div>`
    }</div>
      <button type="button" class="link-btn" data-action="answer-daily">Ubah jawabanku</button>`;
  }

  return `<section class="daily">
    <p class="daily__label">${icon("chat")} Pertanyaan hari ini</p>
    <h2 class="daily__q">${esc(question)}</h2>
    ${body}
    ${pastDays ? `<button type="button" class="link-btn daily__archive" data-action="answers-archive">Jawaban sebelumnya (${pastDays} hari)</button>` : ""}
  </section>`;
}

function openAnswerSheet() {
  const day = wibToday();
  const mine = state.answers.find((a) => a.day === day && a.author_id === myUserId());
  const question = mine?.question || state.answers.find((a) => a.day === day)?.question || questionFor(day);
  openSheet(
    "Pertanyaan hari ini",
    `<form data-form="answer" data-question="${esc(question)}" ${mine ? `data-editing="${esc(mine.id)}"` : ""}>
      <p class="sheet-question">${esc(question)}</p>
      ${field("d-answer", "Jawabanmu", `<textarea id="d-answer" name="answer" maxlength="2000" required placeholder="Tulis jujur saja…">${esc(mine?.answer)}</textarea>`)}
      <p class="help">${esc(partnerName())} baru bisa melihat jawabanmu setelah ikut menjawab, atau besok.</p>
      <div class="sheet__actions"><button type="submit" class="btn">Kirim jawaban</button></div>
    </form>`,
  );
}

async function saveAnswer(form) {
  if (!form.reportValidity()) return;
  const answer = formValue(form, "answer");
  if (form.dataset.editing) {
    await api(`/rest/v1/daily_answers?id=${eq(form.dataset.editing)}`, { method: "PATCH", body: JSON.stringify({ answer }) });
  } else {
    await api("/rest/v1/daily_answers", {
      method: "POST",
      headers: { Prefer: "return=minimal" },
      body: JSON.stringify({ couple_id: state.couple.id, author_name: myName(), day: wibToday(), question: form.dataset.question, answer }),
    });
  }
  closeSheet();
  await loadAnswers();
  render();
  const theirs = state.answers.find((a) => a.day === wibToday() && a.author_id !== myUserId());
  toast(theirs ? `Terbuka! Lihat jawaban ${theirs.author_name} ♡` : "Jawaban terkirim ♡");
}

function openAnswersArchive() {
  const today = wibToday();
  const byDay = new Map();
  for (const a of state.answers) {
    if (a.day >= today) continue;
    if (!byDay.has(a.day)) byDay.set(a.day, []);
    byDay.get(a.day).push(a);
  }
  const days = [...byDay.entries()]
    .map(
      ([day, list]) => `<article class="archive-day">
        <p class="archive-day__date">${esc(formatDate(day))}</p>
        <h3>${esc(list[0].question)}</h3>
        <div class="answers">${list.map((a) => answerBubble(a)).join("")}</div>
      </article>`,
    )
    .join("");
  openSheet("Jawaban sebelumnya", days || '<p class="muted">Belum ada.</p>');
}

function homeExtras() {
  const parts = [];
  const today = todayISO();

  // Surat yang baru saja terbuka untukku
  const fresh = state.letters.filter((l) => !l.is_locked && l.author_id !== myUserId() && l.unlock_on >= addDaysISO(today, -3));
  for (const l of fresh) {
    parts.push(`<button type="button" class="banner banner--letter" data-action="read-letter" data-id="${esc(l.id)}" style="--c:${colorOf(l.author_name)}">
      <span class="banner__icon">${icon("mail")}</span>
      <span><strong>Surat dari ${esc(l.author_name)} sudah bisa dibuka</strong><small>${esc(l.title)}</small></span></button>`);
  }

  // Rekap tahunan (Desember sampai pertengahan Januari)
  const recapYear = recapYearInSeason();
  if (recapYear) {
    parts.push(`<button type="button" class="banner banner--recap" data-action="open-recap" data-year="${recapYear}">
      <span class="banner__icon">${icon("chart")}</span>
      <span><strong>Rekap ${recapYear} kita sudah siap</strong><small>Lihat setahun kita dalam angka</small></span></button>`);
  }

  // Hari ini, di tahun-tahun sebelumnya
  const past = onThisDay();
  if (past.photos.length || past.stories.length) {
    parts.push(`<section class="section">
      <div class="section-head"><div><h2>Hari ini, dulu</h2><p class="hint">${esc(formatDate(today, false))} di tahun-tahun sebelumnya</p></div></div>
      ${past.photos.length ? `<div class="polaroids polaroids--small">${albumsOf(past.photos).map((a) => polaroidCard(a.photos[0], yearsAgo(a.photos[0].taken_on), a.photos.length)).join("")}</div>` : ""}
      ${past.stories.length ? `<div class="list" style="margin-top:12px">${past.stories.map((x) => entryRow(x, { lead: markIcon("heart"), chip: yearsAgo(x.event_date), meta: esc(formatDate(x.event_date)) })).join("")}</div>` : ""}
    </section>`);
  }
  return parts.length ? `<div class="home-extras">${parts.join("")}</div>` : "";
}

/* ---------- Rencana ---------- */

function pageHead(title, sub) {
  return `<header class="page-head"><div><h1>${title}</h1><p>${sub}</p></div>${venn("sm")}</header>`;
}

function wishRow(x) {
  const done = !!x.done_at;
  const meta = [done ? `Terwujud ${formatDate(x.done_at)}` : "", x.location].filter(Boolean).map(esc).join(" · ");
  return `<div class="row-wrap ${done ? "is-done" : ""}">
    <button type="button" class="check" data-action="toggle-done" data-id="${esc(x.id)}" aria-pressed="${done}" aria-label="${done ? "Tandai belum" : "Tandai sudah dilakukan"}: ${esc(x.title)}">${icon("check")}</button>
    ${entryRow(x, { lead: "", meta })}
  </div>`;
}

function plansView() {
  const wishes = entriesOf("wishlist");
  const rows = wishes.filter((x) => !x.done_at).map(wishRow).join("");
  const doneList = wishes.filter((x) => x.done_at).sort((a, b) => b.done_at.localeCompare(a.done_at));
  return `${pageHead("Rencana", "Tempat dan hal yang mau kita coba berdua")}
    <section class="idea" aria-live="polite">
      <small>Bingung mau ke mana?</small>
      <p class="idea__text">${esc(DATE_IDEAS[state.ideaIndex])}</p>
      <div class="actions">
        <button type="button" class="btn btn--sm" data-action="idea-save">Simpan ke wishlist</button>
        <button type="button" class="btn btn--sm btn--soft" data-action="idea-next">🎲 Ide lain</button>
      </div>
    </section>
    <section class="section">
      <div class="section-head"><h2>Wishlist</h2>${addButton("wishlist")}</div>
      ${rows ? `<div class="list">${rows}</div>` : emptyState(doneList.length ? "Semua wishlist sudah terwujud. Tulis impian berikutnya!" : "Wishlist masih kosong. Tulis satu tempat impian kalian.", "wishlist", "Tambah wishlist")}
      ${rows ? '<p class="hint" style="margin:10px 2px 0">Ketuk lingkaran kalau sudah kalian lakukan.</p>' : ""}
      ${
        doneList.length
          ? `<details class="past"><summary>Sudah terwujud (${doneList.length})</summary><div class="list">${doneList.map(wishRow).join("")}</div></details>`
          : ""
      }
    </section>`;
}

/* ---------- Kenangan ---------- */

const canManagePhoto = (photo) =>
  !!state.session && state.members.some((m) => m.user_id === state.session.user.id && m.couple_id === photo.couple_id);

function polaroids() {
  if (state.photoError) return `<div class="notice">${esc(state.photoError)}</div>`;
  if (!state.photos.length) return "";
  return `<div class="polaroids">${albumsOf(state.photos).map((a) => polaroidCard(a.photos[0], "", a.photos.length)).join("")}</div>`;
}

// Kelompokkan foto berdasarkan album_id; foto tanpa album jadi album berisi satu.
function albumsOf(photos) {
  const map = new Map();
  const albums = [];
  for (const p of photos) {
    const key = p.album_id || p.id;
    if (!map.has(key)) {
      const album = { key, photos: [] };
      map.set(key, album);
      albums.push(album);
    }
    map.get(key).photos.push(p);
  }
  for (const a of albums) a.photos.sort((x, y) => (x.created_at || "").localeCompare(y.created_at || ""));
  return albums;
}
const albumOfPhoto = (id) => albumsOf(state.photos).find((a) => a.photos.some((p) => p.id === id));

function polaroidCard(p, note, count = 1) {
  const sub = note || (p.taken_on ? formatDate(p.taken_on) : "");
  return `<button type="button" class="polaroid ${count > 1 ? "polaroid--stack" : ""}" data-action="view-photo" data-id="${esc(p.id)}" aria-label="Lihat ${count > 1 ? count + " foto" : "foto"} ${esc(p.title)}">
    <img src="${esc(storage.publicUrl("kenangan", p.storage_path))}" alt="" loading="lazy" decoding="async">
    ${count > 1 ? `<span class="polaroid__count">${icon("photo")}${count}</span>` : ""}
    <span class="polaroid__caption"><span class="polaroid__title">${esc(p.title)}</span>
    ${sub ? `<span class="polaroid__date">${esc(sub)}</span>` : ""}</span>
  </button>`;
}

function memoriesView() {
  const stories = entriesOf("memory")
    .sort((a, b) => (b.event_date || "").localeCompare(a.event_date || ""))
    .map((x) => entryRow(x, { lead: dateBlock(x.event_date), meta: x.event_date ? esc(formatDate(x.event_date)) : "" }))
    .join("");
  const gallery = polaroids();
  return `${pageHead("Kenangan", "Momen kecil yang ingin kita ingat selamanya")}
    <section class="section">
      <div class="section-head"><h2>Galeri</h2>${addButton("photos", "Foto")}</div>
      ${gallery || emptyState("Belum ada foto. Abadikan momen pertama kalian di sini.", "photos", "Tambah foto")}
    </section>
    <section class="section">
      <div class="section-head"><div><h2>Cerita kita</h2><p class="hint">Catatan tanpa foto</p></div>${addButton("memory", "Tulis")}</div>
      ${stories ? `<div class="list">${stories}</div>` : emptyState("Tulis cerita yang tidak sempat difoto.", "memory", "Tulis cerita")}
    </section>`;
}

/* ---------- Hadiah ---------- */

const COUPON_IDEAS = [
  "1x dipijat 15 menit",
  "Traktir boba",
  "Bebas pilih film malam ini",
  "Dimasakin menu favorit",
  "Dijemput ke mana saja",
  "Pelukan 1 menit penuh",
  "Bebas pilih tempat makan",
  "Satu hari tanpa ngambek",
];

const shortDate = (iso) => {
  const [y, m, d] = iso.slice(0, 10).split("-").map(Number);
  return `${d} ${MONTHS[m - 1]} ${y}`;
};

function couponCard(c) {
  const mine = c.from_id === myUserId();
  const redeemed = !!c.redeemed_at;
  let stub;
  if (redeemed) stub = `<span class="coupon__stamp">Ditukar<br>${esc(shortDate(c.redeemed_at))}</span>`;
  else if (!mine) stub = `<button type="button" class="btn btn--sm coupon__redeem" data-action="redeem-coupon" data-id="${esc(c.id)}">Tukar</button>`;
  else stub = `<span class="coupon__wait">Belum<br>ditukar</span>`;
  return `<article class="coupon ${redeemed ? "is-redeemed" : ""}" style="--c:${colorOf(c.from_name)}">
    <div class="coupon__main">
      <small>${mine ? `Darimu untuk ${esc(partnerName())}` : `Dari ${esc(c.from_name)} untukmu`}</small>
      <strong>${esc(c.title)}</strong>
      ${c.note ? `<p>${esc(c.note)}</p>` : ""}
      ${mine && !redeemed ? `<button type="button" class="link-btn coupon__del" data-action="delete-coupon" data-id="${esc(c.id)}">Hapus</button>` : ""}
    </div>
    <div class="coupon__stub">${stub}</div>
  </article>`;
}

function couponsSection() {
  const head = (action) => `<div class="section-head"><div><h2>Kupon cinta</h2><p class="hint">Bisa ditukar kapan saja oleh penerimanya</p></div>${action}</div>`;
  if (!state.couponsReady) {
    return `<section class="section">${head("")}<div class="notice">Fitur kupon perlu SQL <code>07-love-coupons.sql</code> dijalankan dulu di Supabase.</div></section>`;
  }
  const me = myUserId();
  const forMe = state.coupons.filter((c) => c.from_id !== me && !c.redeemed_at);
  const fromMe = state.coupons.filter((c) => c.from_id === me && !c.redeemed_at);
  const used = state.coupons.filter((c) => c.redeemed_at).sort((a, b) => b.redeemed_at.localeCompare(a.redeemed_at));
  const add = `<button type="button" class="add-btn" data-action="new-coupon">${icon("plus")}Buat</button>`;
  const group = (title, list) => (list.length ? `<h3 class="sub-head">${title}</h3><div class="coupons">${list.map(couponCard).join("")}</div>` : "");
  const content =
    forMe.length || fromMe.length
      ? group("Untukmu", forMe) + group(`Darimu untuk ${esc(partnerName())}`, fromMe)
      : `<div class="empty"><p>Belum ada kupon aktif. Buat kupon untuk ${esc(partnerName())}, misalnya “1x dipijat”.</p>
         <button type="button" class="add-btn" data-action="new-coupon">${icon("plus")}Buat kupon</button></div>`;
  return `<section class="section">${head(add)}${content}
    ${used.length ? `<details class="past"><summary>Sudah ditukar (${used.length})</summary><div class="coupons">${used.map(couponCard).join("")}</div></details>` : ""}
  </section>`;
}

function openCouponSheet() {
  openSheet(
    `Kupon untuk ${esc(partnerName())}`,
    `<form data-form="coupon">
      ${field("c-title", "Isi kupon", '<input id="c-title" name="title" maxlength="80" required placeholder="1x dipijat 15 menit">')}
      <div class="quick-dates">${COUPON_IDEAS.map((t) => `<button type="button" class="tag-btn" data-action="coupon-idea" data-title="${esc(t)}">${esc(t)}</button>`).join("")}</div>
      ${field("c-note", "Catatan (opsional)", '<textarea id="c-note" name="note" maxlength="500" placeholder="Berlaku sampai kamu bosan ♡"></textarea>')}
      <p class="help">${esc(partnerName())} bisa menukarnya kapan saja. Setelah dibuat, isinya tidak bisa diubah.</p>
      <div class="sheet__actions"><button type="submit" class="btn">Beri kupon 🎟️</button></div>
    </form>`,
  );
}

async function saveCoupon(form) {
  if (!form.reportValidity()) return;
  await api("/rest/v1/love_coupons", {
    method: "POST",
    headers: { Prefer: "return=minimal" },
    body: JSON.stringify({ couple_id: state.couple.id, from_name: myName(), title: formValue(form, "title"), note: formValue(form, "note") }),
  });
  closeSheet();
  await loadCoupons();
  render();
  toast(`Kupon terkirim untuk ${partnerName()} 🎟️`);
}

async function redeemCoupon(id) {
  const c = state.coupons.find((x) => x.id === id);
  if (!c) return;
  if (!confirm(`Tukar kupon “${c.title}” sekarang?`)) return;
  await api(`/rest/v1/love_coupons?id=${eq(id)}`, { method: "PATCH", body: JSON.stringify({ redeemed_at: new Date().toISOString() }) });
  await loadCoupons();
  render();
  toast(`Kupon ditukar! Tagih ke ${c.from_name} ya 😄`);
}

async function deleteCoupon(id) {
  if (!confirm("Hapus kupon ini?")) return;
  await api(`/rest/v1/love_coupons?id=${eq(id)}`, { method: "DELETE" });
  await loadCoupons();
  render();
  toast("Kupon dihapus.");
}

function giftsView() {
  const rows = entriesOf("gift").map((x) => entryRow(x, { lead: markIcon("gift") })).join("");
  return `${pageHead("Hadiah", "Kupon cinta dan ide hadiah untuk satu sama lain")}
    ${couponsSection()}
    <section class="section">
      <div class="section-head"><h2>Ide hadiah</h2>${addButton("gift")}</div>
      ${rows ? `<div class="list">${rows}</div>` : emptyState("Dengar dia menyebut barang yang diinginkan? Catat di sini.", "gift", "Tambah ide hadiah")}
    </section>`;
}

/* ---------- Kita ---------- */

function usView() {
  const anniversary = state.couple?.anniversary_date;
  const people = PEOPLE.map((p) => {
    const tags = (state.hobbies[p.name] || "")
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
    return `<article class="person" style="--c:${p.color}">
      ${avatar(p.slot, { label: "foto " + p.name, color: p.color, size: "md", fallback: esc(p.name.charAt(0)) })}
      <h3>${esc(p.name)}</h3>
      <p class="label">Hobi & favorit</p>
      ${tags.length ? `<div class="tags">${tags.map((t) => `<span class="tag">${esc(t)}</span>`).join("")}</div>` : '<p class="tags--empty">Belum diisi</p>'}
      <button type="button" class="link-btn" data-action="edit-hobbies" data-person="${esc(p.name)}">${tags.length ? "Ubah" : "Isi hobi"}</button>
    </article>`;
  }).join("");

  return `${pageHead("Kita", "Tentang kita berdua")}
    <section class="couple-card">
      <h2>Foto kita berdua</h2>
      ${avatar("couple", { label: "foto kita berdua", couple: true, fallback: icon("heart", true) })}
      <div class="setting-row">
        <div><small>Tanggal jadian</small><strong>${anniversary ? esc(formatDate(anniversary)) : "Belum diatur"}</strong></div>
        <button type="button" class="btn btn--sm btn--soft" data-action="edit-anniversary">${anniversary ? "Ubah" : "Atur"}</button>
      </div>
    </section>
    <div class="people">${people}</div>
    ${lettersSection()}
    <section class="section">
      <button type="button" class="banner banner--recap" data-action="open-recap" data-year="${recapYearInSeason() || Number(todayISO().slice(0, 4))}">
        <span class="banner__icon">${icon("chart")}</span>
        <span><strong>Rekap ${recapYearInSeason() || todayISO().slice(0, 4)} kita</strong><small>Setahun kita dalam angka</small></span></button>
    </section>
    <div class="account"><span>Masuk sebagai ${esc(state.session?.user?.email)}</span>
      <button type="button" class="btn btn--sm btn--ghost" data-action="logout">Keluar</button></div>`;
}

/* ---------- Surat untuk nanti ---------- */

function lettersSection() {
  const head = (action) => `<div class="section-head"><div><h2>Surat untuk nanti</h2><p class="hint">Isinya terkunci sampai tanggal yang dipilih</p></div>${action}</div>`;
  if (!state.lettersReady) {
    return `<section class="section">${head("")}<div class="notice">Fitur surat perlu SQL <code>05-letters.sql</code> dijalankan dulu di Supabase.</div></section>`;
  }
  const write = `<button type="button" class="add-btn" data-action="write-letter">${icon("plus")}Tulis</button>`;
  const cards = state.letters.map(letterCard).join("");
  return `<section class="section">${head(write)}
    ${cards ? `<div class="envelopes">${cards}</div>` : `<div class="empty"><p>Tulis surat untuk ${esc(partnerName())} yang baru bisa dibuka di hari spesial nanti.</p><button type="button" class="add-btn" data-action="write-letter">${icon("plus")}Tulis surat</button></div>`}
  </section>`;
}

function letterCard(l) {
  const mine = l.author_id === myUserId();
  const days = daysUntil(l.unlock_on);
  const from = mine ? `Darimu untuk ${partnerName()}` : `Dari ${l.author_name}`;
  const status = l.is_locked ? `Terbuka ${whenLabel(days).toLowerCase()}` : "Sudah bisa dibaca";
  return `<button type="button" class="envelope ${l.is_locked ? "is-locked" : ""}" data-action="read-letter" data-id="${esc(l.id)}" style="--c:${colorOf(mine ? myName() : l.author_name)}">
    <span class="envelope__seal">${icon(l.is_locked ? "lock" : "heart", !l.is_locked)}</span>
    <span class="envelope__body"><small>${esc(from)}</small><strong>${esc(l.title)}</strong><span class="envelope__status">${esc(status)}</span></span>
  </button>`;
}

function openWriteLetterSheet() {
  const today = todayISO();
  const quick = [];
  if (state.couple?.anniversary_date) {
    const next = nextYearly(state.couple.anniversary_date);
    // Surat harus dibuka setelah hari ini; kalau hari ini anniversary, pakai tahun depan.
    const when = next.days === 0 ? `${Number(next.iso.slice(0, 4)) + 1}${next.iso.slice(4)}` : next.iso;
    quick.push([when, "Anniversary berikutnya"]);
  }
  quick.push([addDaysISO(today, 30), "1 bulan lagi"], [addDaysISO(today, 365), "1 tahun lagi"]);
  openSheet(
    `Surat untuk ${esc(partnerName())}`,
    `<form data-form="letter">
      ${field("w-title", "Judul amplop (terlihat sebelum dibuka)", '<input id="w-title" name="title" maxlength="140" required placeholder="Untuk anniversary kita…">')}
      ${field("w-body", "Isi surat", '<textarea id="w-body" name="body" class="letter-input" maxlength="10000" required placeholder="Hai sayang…"></textarea>')}
      ${field("w-date", "Boleh dibuka mulai", `<input id="w-date" name="unlock_on" type="date" min="${addDaysISO(today, 1)}" required>`)}
      <div class="quick-dates">${quick.map(([iso, label]) => `<button type="button" class="tag-btn" data-action="letter-date" data-date="${iso}">${label}</button>`).join("")}</div>
      <p class="help">${esc(partnerName())} hanya bisa melihat amplopnya sampai tanggal itu. Surat yang sudah disegel tidak bisa diubah, hanya bisa dihapus olehmu.</p>
      <div class="sheet__actions"><button type="submit" class="btn">Segel surat 💌</button></div>
    </form>`,
  );
}

function openLetter(id) {
  const l = state.letters.find((x) => x.id === id);
  if (!l) return;
  const mine = l.author_id === myUserId();
  if (l.body == null) {
    const days = daysUntil(l.unlock_on);
    openSheet(
      "Masih tersegel",
      `<div class="locked-letter" style="--c:${colorOf(l.author_name)}">${icon("lock")}
        <p class="locked-letter__count">${esc(whenLabel(days))}</p>
        <p>Surat “${esc(l.title)}” dari ${esc(l.author_name)} bisa dibuka mulai ${esc(formatDate(l.unlock_on))}. Sabar ya ♡</p></div>`,
    );
    return;
  }
  const to = mine ? partnerName() : myName();
  openSheet(
    esc(l.title),
    `<article class="letter" style="--c:${colorOf(mine ? myName() : l.author_name)}">
      <p class="letter__meta">Dari ${esc(mine ? myName() : l.author_name)} untuk ${esc(to)} · ditulis ${esc(formatDate(l.created_at.slice(0, 10)))}</p>
      <div class="letter__body">${esc(l.body)}</div>
    </article>
    ${mine && l.is_locked ? `<p class="help" style="margin-top:14px">Hanya kamu yang bisa membaca ini sampai ${esc(formatDate(l.unlock_on))}.</p>` : ""}
    ${mine ? `<div class="sheet__actions"><button type="button" class="btn btn--danger" data-action="delete-letter" data-id="${esc(l.id)}">Hapus surat</button></div>` : ""}`,
  );
}

async function saveLetter(form) {
  if (!form.reportValidity()) return;
  await api("/rest/v1/letters", {
    method: "POST",
    headers: { Prefer: "return=minimal" },
    body: JSON.stringify({
      couple_id: state.couple.id,
      author_name: myName(),
      title: formValue(form, "title"),
      body: formValue(form, "body"),
      unlock_on: formValue(form, "unlock_on"),
    }),
  });
  closeSheet();
  await loadLetters();
  render();
  toast(`Surat tersegel. ${partnerName()} bisa membukanya nanti 💌`);
}

async function deleteLetter(id) {
  if (!confirm("Hapus surat ini? Tidak bisa dikembalikan.")) return;
  await api(`/rest/v1/letters?id=${eq(id)}`, { method: "DELETE" });
  closeSheet();
  await loadLetters();
  render();
  toast("Surat dihapus.");
}

/* ---------- Rekap tahunan ---------- */

function buildRecap(year) {
  const y = String(year);
  const today = todayISO();
  const inYear = (iso) => !!iso && iso.slice(0, 4) === y && iso <= today;
  const photoDate = (p) => p.taken_on || p.created_at?.slice(0, 10);

  const dates = entriesOf("schedule").filter((x) => inYear(x.event_date));
  const places = [...new Set(dates.map((x) => x.location?.trim()).filter(Boolean))];
  const photos = state.photos.filter((p) => inYear(photoDate(p)));
  const wishes = entriesOf("wishlist").filter((x) => inYear(x.done_at));
  const stories = entriesOf("memory").filter((x) => inYear(x.event_date));
  const letters = state.letters.filter((l) => inYear(l.created_at?.slice(0, 10)));
  const answerDays = new Set(state.answers.filter((a) => inYear(a.day)).map((a) => a.day)).size;

  const counts = Array(12).fill(0);
  [...dates.map((x) => x.event_date), ...photos.map(photoDate), ...wishes.map((x) => x.done_at), ...stories.map((x) => x.event_date)].forEach(
    (iso) => counts[Number(iso.slice(5, 7)) - 1]++,
  );
  const busiestCount = Math.max(...counts);
  return { year, dates, places, photos, wishes, stories, letters, answerDays, busiest: busiestCount > 0 ? counts.indexOf(busiestCount) : -1, busiestCount };
}

function recapSlides(r) {
  const slides = [
    {
      theme: "kita",
      html: `${venn("md")}<small>Rekap</small><p class="recap__big">${r.year}</p><p>Setahun cerita ${esc(coupleNames())}</p>`,
    },
  ];
  if (r.dates.length) {
    slides.push({
      theme: "aiya",
      html: `<small>Tahun ini kita punya</small><p class="recap__num">${r.dates.length}</p><h2>kencan & rencana</h2>
        ${r.places.length ? `<p>di ${r.places.length} tempat, termasuk ${esc(r.places.slice(0, 3).join(", "))}</p>` : ""}`,
    });
  }
  if (r.photos.length) {
    slides.push({
      theme: "denan",
      html: `<small>Momen yang kita abadikan</small><p class="recap__num">${r.photos.length}</p><h2>foto kenangan</h2>
        <div class="recap__photos">${r.photos
          .slice(0, 4)
          .map((p) => `<img src="${esc(storage.publicUrl("kenangan", p.storage_path))}" alt="${esc(p.title)}">`)
          .join("")}</div>`,
    });
  }
  if (r.wishes.length) {
    slides.push({
      theme: "butter",
      html: `<small>Impian yang terwujud</small><p class="recap__num">${r.wishes.length}</p><h2>wishlist jadi kenyataan</h2>
        <ul class="recap__list">${r.wishes.slice(0, 4).map((x) => `<li>${esc(x.title)}</li>`).join("")}</ul>`,
    });
  }
  if (r.busiest >= 0) {
    slides.push({
      theme: "aiya",
      html: `<small>Bulan paling seru</small><p class="recap__big">${MONTHS_LONG[r.busiest]}</p><p>${r.busiestCount} momen tercatat dalam sebulan</p>`,
    });
  }
  if (r.answerDays) {
    slides.push({
      theme: "butter",
      html: `<small>Ngobrol lewat pertanyaan harian</small><p class="recap__num">${r.answerDays}</p><h2>hari saling bertanya</h2><p>Satu pertanyaan kecil setiap hari.</p>`,
    });
  }
  if (r.stories.length + r.letters.length) {
    slides.push({
      theme: "denan",
      html: `<small>Kata-kata yang kita simpan</small><p class="recap__num">${r.stories.length + r.letters.length}</p><h2>cerita & surat</h2>`,
    });
  }
  if (slides.length === 1) {
    slides.push({ theme: "butter", html: `<small>Tahun ini</small><h2>Belum banyak yang tercatat</h2><p>Yuk isi rencana, foto, dan cerita supaya rekap tahun depan penuh ♡</p>` });
  }
  slides.push({
    theme: "ink",
    html: state.couple?.anniversary_date
      ? `<small>Sampai hari ini</small><p class="recap__num">${daysTogether().toLocaleString("id-ID")}</p><h2>hari bersama</h2><p>Sampai jumpa di cerita ${r.year + 1} ♡</p>`
      : `<small>Sampai jumpa</small><h2>di cerita ${r.year + 1} ♡</h2>`,
  });
  return slides;
}

let recapEl = null;
function openRecap(year) {
  const slides = recapSlides(buildRecap(year));
  let index = 0;
  const opener = document.activeElement;
  recapEl = document.createElement("div");
  recapEl.className = "recap";
  recapEl.setAttribute("role", "dialog");
  recapEl.setAttribute("aria-modal", "true");
  recapEl.setAttribute("aria-label", `Rekap ${year}`);

  const show = () => {
    const slide = slides[index];
    const last = index === slides.length - 1;
    recapEl.dataset.theme = slide.theme;
    recapEl.innerHTML = `<div class="recap__bars">${slides.map((_, i) => `<span class="${i <= index ? "is-on" : ""}"></span>`).join("")}</div>
      <button type="button" class="icon-btn recap__close" data-recap="close" aria-label="Tutup rekap">×</button>
      <div class="recap__slide" aria-live="polite">${slide.html}</div>
      <div class="recap__foot">
        ${index > 0 ? '<button type="button" class="btn btn--sm recap__btn--ghost" data-recap="prev">Sebelumnya</button>' : "<span></span>"}
        <button type="button" class="btn btn--sm recap__btn" data-recap="${last ? "close" : "next"}">${last ? "Selesai ♡" : "Lanjut"}</button>
      </div>`;
    $(`[data-recap="${last ? "close" : "next"}"]`, recapEl).focus({ preventScroll: true });
  };
  const close = () => {
    document.removeEventListener("keydown", onKey, true);
    recapEl.remove();
    recapEl = null;
    document.body.classList.remove("no-scroll");
    if (opener?.isConnected) opener.focus({ preventScroll: true });
  };
  const go = (step) => {
    const next = index + step;
    if (next < 0) return;
    if (next >= slides.length) return close();
    index = next;
    show();
  };
  const onKey = (e) => {
    if (e.key === "Escape") close();
    else if (e.key === "ArrowRight") go(1);
    else if (e.key === "ArrowLeft") go(-1);
    else return;
    e.stopPropagation();
    e.preventDefault();
  };
  recapEl.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-recap]");
    if (btn) {
      const action = btn.dataset.recap;
      if (action === "close") close();
      else go(action === "next" ? 1 : -1);
      return;
    }
    // Ketuk sisi kanan layar = lanjut, sisi kiri = kembali (seperti story)
    go(e.clientX > window.innerWidth / 3 ? 1 : -1);
  });
  document.addEventListener("keydown", onKey, true);
  document.body.append(recapEl);
  document.body.classList.add("no-scroll");
  show();
}

/* ---------- Halaman publik & login ---------- */

function publicView() {
  return `<main class="shell shell--public">
    <div class="public-top"><button type="button" class="btn btn--sm btn--soft" data-action="go-login">Masuk</button></div>
    <section class="hero">${venn("lg")}<h1 class="hero__names">${esc(coupleNames())}</h1>
      <p class="hero__sub">Cerita yang kita simpan</p></section>
    <section class="section">
      <div class="section-head"><h2>Galeri kenangan</h2></div>
      ${polaroids() || '<div class="empty"><p>Belum ada foto di galeri.</p></div>'}
    </section>
  </main>`;
}

function loginView() {
  return `<main class="login">
    <section class="hero">${venn("lg")}<h1 class="hero__names">${esc(coupleNames())}</h1>
      <p class="hero__sub">Ruang kecil untuk cerita kita</p></section>
    <section class="login-card">
      <form data-form="login" novalidate>
        ${state.loginError ? `<div class="form-error" role="alert">${esc(state.loginError)}</div>` : ""}
        ${field("l-email", "Email", '<input id="l-email" name="email" type="email" autocomplete="username" required placeholder="Email kamu">')}
        ${field("l-pass", "Password", '<input id="l-pass" name="password" type="password" autocomplete="current-password" required placeholder="Password">')}
        <button class="btn btn--block" type="submit">Masuk</button>
      </form>
    </section>
    <p class="back"><button type="button" class="link-btn" data-action="back-public">Kembali ke galeri</button></p>
  </main>`;
}

function notLinkedView() {
  return `${pageHead("Hampir siap", "Akun belum terhubung")}
    <div class="empty" style="margin-top:22px"><p>Login berhasil, tetapi akun ini belum tercatat di <code>couple_members</code>.
    Periksa SQL penghubung ${esc(coupleNames())}.</p>
    <button type="button" class="btn btn--sm btn--soft" data-action="logout">Keluar</button></div>`;
}

function tabbar() {
  return `<nav class="tabbar" aria-label="Menu utama">${TABS.map(
    (t) => `<button type="button" data-action="tab" data-tab="${t.id}" ${state.tab === t.id ? 'aria-current="page"' : ""}>${icon(t.icon)}<span>${t.name}</span></button>`,
  ).join("")}</nav>`;
}

const VIEWS = { calendar: calendarView, plans: plansView, memories: memoriesView, gifts: giftsView, us: usView };

function render() {
  const app = $("#app");
  if (!state.session) {
    app.innerHTML = state.showLogin ? loginView() : publicView();
    return;
  }
  if (!state.couple) {
    app.innerHTML = `<main class="shell">${notLinkedView()}</main>`;
    return;
  }
  app.innerHTML = `<main class="shell">${(VIEWS[state.tab] || calendarView)()}</main>${tabbar()}`;
}

/* ==========================================================
   Sheet: panel yang muncul dari bawah untuk semua form
   ========================================================== */

let sheetEl = null;
let sheetOpener = null;

function openSheet(title, body) {
  closeSheet(false);
  sheetOpener = document.activeElement;
  sheetEl = document.createElement("div");
  sheetEl.className = "sheet-backdrop";
  sheetEl.dataset.sheetBackdrop = "";
  sheetEl.innerHTML = `<div class="sheet" role="dialog" aria-modal="true" aria-labelledby="sheet-title">
    <div class="sheet__grip" aria-hidden="true"></div>
    <header class="sheet__head"><h2 id="sheet-title">${title}</h2>
      <button type="button" class="icon-btn" data-action="close-sheet" aria-label="Tutup">×</button></header>
    ${body}</div>`;
  document.body.append(sheetEl);
  document.body.classList.add("no-scroll");
  const first = sheetEl.querySelector("input:not([type=radio]):not([type=file]), textarea, select");
  (first || sheetEl.querySelector(".icon-btn")).focus({ preventScroll: true });
}

function closeSheet(restoreFocus = true) {
  stopSnapCamera();
  if (!sheetEl) return;
  sheetEl.remove();
  sheetEl = null;
  document.body.classList.remove("no-scroll");
  if (restoreFocus && sheetOpener?.isConnected) sheetOpener.focus({ preventScroll: true });
  sheetOpener = null;
}

function entryFields(cat, values = {}) {
  const t = ENTRY_TYPES[cat];
  const v = (k) => esc(k === "event_time" ? values.event_time?.slice(0, 5) : values[k]);
  const dateRow = t.date
    ? `<div class="${t.time ? "grid-2" : ""}">
        ${field("f-date", "Tanggal", `<input id="f-date" name="event_date" type="date" value="${v("event_date")}" ${t.dateRequired ? "required" : ""}>`)}
        ${t.time ? field("f-time", "Jam (opsional)", `<input id="f-time" name="event_time" type="time" value="${v("event_time")}">`) : ""}
      </div>`
    : "";
  return `${field("f-title", t.title, `<input id="f-title" name="title" maxlength="140" required placeholder="${t.placeholder}" value="${v("title")}">`)}
    ${dateRow}
    ${t.location ? field("f-loc", "Lokasi (opsional)", `<input id="f-loc" name="location" maxlength="140" placeholder="Di mana?" value="${v("location")}">`) : ""}
    ${field("f-desc", t.desc, `<textarea id="f-desc" name="description" placeholder="Tulis sesuatu…">${v("description")}</textarea>`)}`;
}

const KIND_TO_CATEGORY = { calendar: "schedule", special: "important_date", wishlist: "wishlist", gift: "gift", memory: "memory" };

function openEntrySheet({ kind, id, prefill = {} }) {
  const editing = id ? state.entries.find((e) => e.id === id) : null;
  if (id && !editing) return;
  const category = editing ? editing.category : KIND_TO_CATEGORY[kind];
  const chooser = !editing && (category === "schedule" || category === "important_date");

  const typeControl = chooser
    ? `<div class="segmented" role="radiogroup" aria-label="Jenis">
        ${["schedule", "important_date"]
          .map((c) => `<label><input type="radio" name="category" value="${c}" ${c === category ? "checked" : ""} data-category-switch>${ENTRY_TYPES[c].label}</label>`)
          .join("")}
      </div>`
    : `<input type="hidden" name="category" value="${category}">`;

  const title = editing ? `Ubah ${ENTRY_TYPES[category].label.toLowerCase()}` : chooser ? "Tambah ke kalender" : `Tambah ${ENTRY_TYPES[category].label.toLowerCase()}`;

  openSheet(
    title,
    `<form data-form="entry" ${editing ? `data-editing="${esc(editing.id)}"` : ""}>
      ${typeControl}
      <div data-entry-fields>${entryFields(category, editing || prefill)}</div>
      ${editing ? calendarExport(editing) : ""}
      <div class="sheet__actions">
        ${editing ? `<button type="button" class="btn btn--danger" data-action="delete-entry" data-id="${esc(editing.id)}">Hapus</button>` : ""}
        <button type="submit" class="btn">${editing ? "Simpan perubahan" : "Simpan"}</button>
      </div>
    </form>`,
  );
}

/* ---------- Simpan ke kalender HP / Google Calendar ---------- */

const compactDate = (iso) => iso.replace(/-/g, "");

function calendarExport(x) {
  if (!x.event_date || (x.category !== "schedule" && x.category !== "important_date")) return "";
  return `<div class="export"><span>${icon("calendar")} Ingatkan lewat kalender HP</span>
    <div class="export__buttons">
      <button type="button" class="btn btn--sm btn--soft" data-action="ics" data-id="${esc(x.id)}">Kalender HP</button>
      <a class="btn btn--sm btn--soft" href="${esc(googleCalendarUrl(x))}" target="_blank" rel="noopener">Google Calendar</a>
    </div></div>`;
}

function eventTimes(x) {
  const yearly = x.category === "important_date";
  const time = !yearly && x.event_time ? x.event_time.slice(0, 5).replace(":", "") : null;
  if (time) {
    const [h, m] = [Number(time.slice(0, 2)), Number(time.slice(2))];
    const endH = h + 2;
    const endDate = endH >= 24 ? addDaysISO(x.event_date, 1) : x.event_date;
    return { yearly, start: `${compactDate(x.event_date)}T${time}00`, end: `${compactDate(endDate)}T${pad(endH % 24)}${pad(m)}00`, allDay: false };
  }
  return { yearly, start: compactDate(x.event_date), end: compactDate(addDaysISO(x.event_date, 1)), allDay: true };
}

function googleCalendarUrl(x) {
  const t = eventTimes(x);
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: x.title,
    dates: `${t.start}/${t.end}`,
    details: x.description || "Dari aplikasi Kita Berdua ♡",
  });
  if (!t.allDay) params.set("ctz", "Asia/Jakarta");
  if (x.location) params.set("location", x.location);
  if (t.yearly) params.set("recur", "RRULE:FREQ=YEARLY");
  return "https://calendar.google.com/calendar/render?" + params.toString();
}

function downloadIcs(x) {
  const t = eventTimes(x);
  const text = (v) => String(v || "").replace(/\\/g, "\\\\").replace(/[;,]/g, (c) => "\\" + c).replace(/\r?\n/g, "\\n");
  const stamp = new Date().toISOString().replace(/[-:]/g, "").slice(0, 15) + "Z";
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Kita Berdua//ID",
    "CALSCALE:GREGORIAN",
    "BEGIN:VEVENT",
    `UID:${x.id}@kita-berdua`,
    `DTSTAMP:${stamp}`,
    t.allDay ? `DTSTART;VALUE=DATE:${t.start}` : `DTSTART;TZID=Asia/Jakarta:${t.start}`,
    t.allDay ? `DTEND;VALUE=DATE:${t.end}` : `DTEND;TZID=Asia/Jakarta:${t.end}`,
    ...(t.yearly ? ["RRULE:FREQ=YEARLY"] : []),
    `SUMMARY:${text(x.title)}`,
    ...(x.location ? [`LOCATION:${text(x.location)}`] : []),
    `DESCRIPTION:${text(x.description || "Dari aplikasi Kita Berdua")}`,
    "BEGIN:VALARM",
    "ACTION:DISPLAY",
    `DESCRIPTION:${text(x.title)}`,
    t.allDay ? "TRIGGER:-PT15H" : "TRIGGER:-PT1H", // H-1 jam 09.00 untuk acara seharian
    "END:VALARM",
    "END:VEVENT",
    "END:VCALENDAR",
  ];
  const blob = new Blob([lines.join("\r\n")], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = (x.title.replace(/[^\w\s-]/g, "").trim().slice(0, 40) || "kita-berdua") + ".ics";
  document.body.append(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 10000);
}

function switchEntryCategory(radio) {
  const form = radio.form;
  const values = Object.fromEntries(ENTRY_FIELDS.map((k) => [k, formValue(form, k)]));
  $("[data-entry-fields]", form).innerHTML = entryFields(radio.value, values);
}

function openPhotoSheet(prefill = {}) {
  openSheet(
    "Tambah foto kenangan",
    `<form data-form="photos">
      <label class="drop">${icon("upload")}<span><strong>Pilih foto</strong> dari galeri HP</span>
        <small>Maksimal ${MEMORY_MAX_FILES} foto, masing-masing 8 MB</small>
        <input type="file" accept="${Object.keys(IMAGE_EXT).join(",")}" multiple data-photo-input></label>
      <div class="thumbs" data-thumbs>${thumbsMarkup()}</div>
      ${field("p-title", "Judul kenangan", `<input id="p-title" name="title" maxlength="140" required placeholder="Hari paling bahagia…" value="${esc(prefill.title)}">`)}
      ${field("p-date", "Tanggal (opsional)", `<input id="p-date" name="taken_on" type="date" value="${esc(prefill.taken_on)}">`)}
      ${field("p-caption", "Cerita singkat (opsional)", '<textarea id="p-caption" name="caption" maxlength="1500" placeholder="Ceritakan momen ini…"></textarea>')}
      <p class="help">Foto di galeri bisa dilihat pengunjung tanpa login.</p>
      <div class="sheet__actions"><button type="submit" class="btn">Upload foto</button></div>
    </form>`,
  );
}

function openDoneSheet(x) {
  openSheet(
    "Yeay, terwujud! 🎉",
    `<p class="lead">“${esc(x.title)}” sudah kalian lakukan. Simpan momennya jadi kenangan?</p>
    <div class="choice">
      <button type="button" class="choice__btn" data-action="wish-photo" data-id="${esc(x.id)}">${icon("photo")}<span><strong>Upload foto</strong><small>Masuk ke galeri polaroid</small></span></button>
      <button type="button" class="choice__btn" data-action="wish-story" data-id="${esc(x.id)}">${icon("pen")}<span><strong>Tulis cerita</strong><small>Tanpa foto juga boleh</small></span></button>
    </div>
    <div class="sheet__actions"><button type="button" class="btn btn--ghost btn--block" data-action="close-sheet">Nanti saja</button></div>`,
  );
}

function openAnniversarySheet() {
  openSheet(
    "Tanggal jadian",
    `<form data-form="anniversary">
      ${field("a-date", "Kapan kita jadian?", `<input id="a-date" name="anniversary_date" type="date" value="${esc(state.couple?.anniversary_date)}">`)}
      <p class="help">Dipakai untuk hitungan hari bersama dan pengingat anniversary.</p>
      <div class="sheet__actions"><button type="submit" class="btn">Simpan</button></div>
    </form>`,
  );
}

function openHobbiesSheet(person) {
  openSheet(
    `Hobi ${esc(person)}`,
    `<form data-form="hobbies" data-person="${esc(person)}">
      ${field("h-hobbies", "Pisahkan dengan koma", `<textarea id="h-hobbies" name="hobbies" maxlength="1000" placeholder="Makan, kucing, jalan-jalan">${esc(state.hobbies[person])}</textarea>`)}
      <div class="sheet__actions"><button type="submit" class="btn">Simpan</button></div>
    </form>`,
  );
}

/* ==========================================================
   Aksi data
   ========================================================== */

async function login(form) {
  const email = formValue(form, "email");
  const password = formValue(form, "password");
  if (!email || !password) {
    state.loginError = "Isi email dan password dulu.";
    render();
    return;
  }
  try {
    const session = await api("/auth/v1/token?grant_type=password", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    saveSession(session);
    Object.assign(state, { loginError: "", showLogin: false, tab: "calendar" });
    await reload();
  } catch (err) {
    state.loginError = /invalid login/i.test(err.message) ? "Email atau password salah." : err.message;
    render();
  }
}

async function logout() {
  const token = state.session?.access_token;
  saveSession(null);
  clearCoupleData();
  state.showLogin = false;
  render();
  window.scrollTo(0, 0);
  if (token) {
    fetch(`${SUPABASE_URL}/auth/v1/logout`, {
      method: "POST",
      headers: { apikey: SUPABASE_KEY, Authorization: "Bearer " + token },
    }).catch(() => {});
  }
}

const insertEntry = (data) =>
  api("/rest/v1/entries", {
    method: "POST",
    headers: { Prefer: "return=minimal" },
    body: JSON.stringify({ couple_id: state.couple.id, ...data }),
  });

async function saveEntry(form) {
  if (!form.reportValidity()) return;
  const data = Object.fromEntries(ENTRY_FIELDS.map((k) => [k, formValue(form, k)]));
  const editingId = form.dataset.editing;
  if (editingId) {
    await api(`/rest/v1/entries?id=${eq(editingId)}`, { method: "PATCH", body: JSON.stringify(data) });
  } else {
    await insertEntry({ ...data, category: formValue(form, "category") });
  }
  closeSheet();
  await reload();
  toast(editingId ? "Perubahan disimpan ♡" : "Tersimpan untuk kita berdua ♡");
}

async function deleteEntry(id) {
  if (!confirm("Hapus item ini?")) return;
  await api(`/rest/v1/entries?id=${eq(id)}`, { method: "DELETE" });
  closeSheet();
  await reload();
  toast("Item dihapus.");
}

async function toggleDone(id) {
  const x = state.entries.find((e) => e.id === id);
  if (!x) return;
  const doneAt = x.done_at ? null : todayISO();
  try {
    await api(`/rest/v1/entries?id=${eq(id)}`, { method: "PATCH", body: JSON.stringify({ done_at: doneAt }) });
  } catch (err) {
    if (/done_at/i.test(err.message)) throw new Error("Fitur centang perlu SQL 04-wishlist-done dijalankan dulu di Supabase.");
    throw err;
  }
  await reload();
  if (doneAt) openDoneSheet(x);
  else toast("Dikembalikan ke wishlist.");
}

async function saveAnniversary(form) {
  const value = formValue(form, "anniversary_date");
  await api(`/rest/v1/couples?id=${eq(state.couple.id)}`, {
    method: "PATCH",
    body: JSON.stringify({ anniversary_date: value }),
  });
  state.couple.anniversary_date = value;
  closeSheet();
  render();
  toast("Tanggal jadian disimpan ♡");
}

async function saveHobbies(form) {
  const person = form.dataset.person;
  const hobbies = formValue(form, "hobbies");
  if (state.hobbiesTable) {
    await api("/rest/v1/member_hobbies?on_conflict=couple_id,person", {
      method: "POST",
      headers: { Prefer: "resolution=merge-duplicates,return=minimal" },
      body: JSON.stringify({ couple_id: state.couple.id, person, hobbies }),
    });
  } else {
    const current = legacyHobbyEntry(person);
    if (current) {
      await api(`/rest/v1/entries?id=${eq(current.id)}`, { method: "PATCH", body: JSON.stringify({ description: hobbies }) });
    } else {
      await insertEntry({ category: "date_idea", title: "hobbies:" + person, description: hobbies });
    }
  }
  closeSheet();
  await reload();
  toast("Hobi tersimpan ♡");
}

/* ---------- Foto kenangan ---------- */

function thumbsMarkup() {
  return state.pendingPhotos
    .map(
      (p, i) => `<div class="thumb"><img src="${esc(p.url)}" alt="Foto ${i + 1}">
        <button type="button" class="thumb__remove" data-action="remove-pending" data-index="${i}" aria-label="Batalkan foto ${i + 1}">×</button></div>`,
    )
    .join("");
}

function refreshThumbs() {
  const box = $("[data-thumbs]");
  if (box) box.innerHTML = thumbsMarkup();
}

function addPendingPhotos(fileList) {
  const skipped = [];
  for (const file of fileList) {
    if (state.pendingPhotos.length >= MEMORY_MAX_FILES) {
      skipped.push(`maksimal ${MEMORY_MAX_FILES} foto sekali upload`);
      break;
    }
    if (!IMAGE_EXT[file.type]) skipped.push(`${file.name}: format tidak didukung`);
    else if (file.size > MEMORY_MAX_BYTES) skipped.push(`${file.name}: lebih dari 25 MB`);
    else state.pendingPhotos.push({ file, url: URL.createObjectURL(file) });
  }
  refreshThumbs();
  if (skipped.length) toast("Sebagian foto dilewati: " + skipped.join("; "), true);
}

function removePending(index) {
  const [removed] = state.pendingPhotos.splice(index, 1);
  if (removed) URL.revokeObjectURL(removed.url);
  refreshThumbs();
}

async function uploadMemoryPhotos(form) {
  if (!state.pendingPhotos.length) throw new Error("Pilih minimal satu foto dulu.");
  if (!form.reportValidity()) return;
  const meta = {
    title: formValue(form, "title"),
    taken_on: formValue(form, "taken_on"),
    caption: formValue(form, "caption"),
  };

  const total = state.pendingPhotos.length;
  const albumId = total > 1 ? crypto.randomUUID() : null;
  const insertRow = async (row) => {
    const send = (body) => api("/rest/v1/memory_photos", { method: "POST", headers: { Prefer: "return=minimal" }, body: JSON.stringify(body) });
    if (!albumId || !state.albumsSupported) return send(row);
    try {
      await send({ ...row, album_id: albumId });
    } catch (err) {
      if (!/album_id/i.test(err.message)) throw err;
      state.albumsSupported = false; // SQL 08 belum dijalankan: simpan sebagai foto terpisah
      await send(row);
    }
  };
  let saved = 0;
  try {
    while (state.pendingPhotos.length) {
      const { file, url } = state.pendingPhotos[0];
      // GIF dibiarkan apa adanya (supaya animasinya tetap), selain itu dikompres jadi JPEG
      const blob = file.type === "image/gif" ? file : await compressImage(file, MEMORY_OUTPUT_PX);
      const path = `${state.couple.id}/${crypto.randomUUID()}.${IMAGE_EXT[blob.type]}`;
      await storage.upload("kenangan", path, blob);
      try {
        await insertRow({ couple_id: state.couple.id, storage_path: path, ...meta });
      } catch (err) {
        await storage.remove("kenangan", path).catch(() => {});
        throw err;
      }
      URL.revokeObjectURL(url);
      state.pendingPhotos.shift();
      saved++;
    }
  } catch (err) {
    refreshThumbs(); // sisa foto yang gagal tetap di form
    throw new Error(saved ? `${saved} dari ${total} foto berhasil. Sisanya gagal: ${err.message}` : err.message);
  } finally {
    await loadPhotos();
    render();
  }
  closeSheet();
  toast(saved > 1 ? `${saved} foto kenangan ditambahkan ♡` : "Foto kenangan ditambahkan ♡");
}

async function deletePhoto(id) {
  const photo = state.photos.find((p) => p.id === id);
  if (!photo || !canManagePhoto(photo)) return;
  if (!confirm("Hapus foto ini secara permanen?")) return;
  // Hapus baris database dulu agar galeri tidak pernah menampilkan foto rusak.
  await api(`/rest/v1/memory_photos?id=${eq(id)}`, { method: "DELETE" });
  await storage.remove("kenangan", photo.storage_path).catch(() => {});
  closeViewer();
  await loadPhotos();
  render();
  toast("Foto dihapus.");
}

let viewerEl = null;
let viewerOpener = null;
function openViewer(id) {
  const album = albumOfPhoto(id);
  if (!album) return;
  const photos = album.photos;
  const first = photos[0];
  const many = photos.length > 1;
  const manage = canManagePhoto(first);
  viewerOpener = document.activeElement;
  viewerEl = document.createElement("div");
  viewerEl.className = "viewer";
  viewerEl.dataset.viewer = "";
  viewerEl.setAttribute("role", "dialog");
  viewerEl.setAttribute("aria-modal", "true");
  viewerEl.setAttribute("aria-label", first.title);
  viewerEl.innerHTML = `<button type="button" class="icon-btn viewer__close" data-action="close-viewer" aria-label="Tutup">×</button>
    <div class="viewer__stage">
      <div class="viewer__track" tabindex="0" aria-label="${many ? `${photos.length} foto, geser untuk melihat` : "Foto"}">
        ${photos.map((p, i) => `<figure class="viewer__slide"><img src="${esc(storage.publicUrl("kenangan", p.storage_path))}" alt="${esc(first.title)}${many ? `, foto ${i + 1}` : ""}"></figure>`).join("")}
      </div>
      ${many ? `<button type="button" class="icon-btn viewer__arrow viewer__arrow--prev" data-action="viewer-step" data-step="-1" aria-label="Foto sebelumnya">${icon("left")}</button>
               <button type="button" class="icon-btn viewer__arrow viewer__arrow--next" data-action="viewer-step" data-step="1" aria-label="Foto berikutnya">${icon("right")}</button>` : ""}
    </div>
    ${many ? `<div class="viewer__dots" aria-hidden="true">${photos.map((_, i) => `<span class="${i === 0 ? "is-on" : ""}"></span>`).join("")}</div>` : ""}
    <div class="viewer__text"><h2>${esc(first.title)}</h2>
      ${first.taken_on ? `<small>${esc(formatDate(first.taken_on))}</small>` : ""}
      ${first.caption ? `<p>${esc(first.caption)}</p>` : ""}
    </div>
    ${manage ? `<button type="button" class="btn btn--sm btn--danger" data-action="delete-photo" data-id="${esc(first.id)}">${many ? "Hapus foto ini" : "Hapus foto"}</button>` : ""}`;
  document.body.append(viewerEl);
  document.body.classList.add("no-scroll");

  const track = $(".viewer__track", viewerEl);
  const update = () => {
    const index = Math.round(track.scrollLeft / Math.max(1, track.clientWidth));
    viewerEl.querySelectorAll(".viewer__dots span").forEach((d, i) => d.classList.toggle("is-on", i === index));
    const del = $('[data-action="delete-photo"]', viewerEl);
    if (del && photos[index]) del.dataset.id = photos[index].id;
    const prev = $(".viewer__arrow--prev", viewerEl);
    const next = $(".viewer__arrow--next", viewerEl);
    if (prev) prev.disabled = index === 0;
    if (next) next.disabled = index === photos.length - 1;
  };
  track.addEventListener("scroll", () => requestAnimationFrame(update), { passive: true });
  update();
  $(".viewer__close", viewerEl).focus();
}

function viewerStep(step) {
  const track = viewerEl && $(".viewer__track", viewerEl);
  if (track) track.scrollBy({ left: step * track.clientWidth, behavior: prefersReducedMotion() ? "auto" : "smooth" });
}

function closeViewer() {
  if (!viewerEl) return;
  viewerEl.remove();
  viewerEl = null;
  if (!sheetEl) document.body.classList.remove("no-scroll");
  if (viewerOpener?.isConnected) viewerOpener.focus({ preventScroll: true });
}

/* ==========================================================
   Foto profil: pilih → atur posisi & zoom → simpan
   ========================================================== */

const picker = $("#photo-picker");
let pickTarget = null;

function pickProfilePhoto(slot, label) {
  pickTarget = { slot, label: label || "foto" };
  picker.value = "";
  picker.click();
}

picker.addEventListener("change", () => {
  const file = picker.files[0];
  if (file && pickTarget) openCropper(file, pickTarget).catch((err) => toast(err.message, true));
});

async function saveProfilePhoto(slot, blob) {
  if (!state.session || !state.couple) throw new Error("Silakan masuk terlebih dahulu.");
  const old = state.profilePhotos.find((p) => p.couple_id === state.couple.id && p.slot === slot);
  const path = `${state.couple.id}/${slot}/${crypto.randomUUID()}.jpg`;

  await storage.upload("profil", path, blob);
  try {
    await api("/rest/v1/profile_photos?on_conflict=couple_id,slot", {
      method: "POST",
      headers: { Prefer: "resolution=merge-duplicates,return=minimal" },
      body: JSON.stringify({ couple_id: state.couple.id, slot, storage_path: path }),
    });
  } catch (err) {
    await storage.remove("profil", path).catch(() => {});
    throw err;
  }
  await loadProfilePhotos();
  if (old && old.storage_path !== path) storage.remove("profil", old.storage_path).catch(() => {});
}

async function openCropper(file, target) {
  if (!file.type.startsWith("image/")) throw new Error("File ini bukan foto.");
  if (file.size > AVATAR_SOURCE_MAX_BYTES) throw new Error("Foto terlalu besar. Maksimal 25 MB.");

  const sourceUrl = URL.createObjectURL(file);
  const source = new Image();
  source.src = sourceUrl;
  try {
    await source.decode();
  } catch {
    URL.revokeObjectURL(sourceUrl);
    throw new Error("Foto tidak bisa dibuka. Coba pakai JPG atau PNG.");
  }

  const opener = document.activeElement;
  const root = document.createElement("div");
  root.className = "sheet-backdrop";
  root.innerHTML = `<div class="sheet" role="dialog" aria-modal="true" aria-labelledby="crop-title">
      <div class="sheet__grip" aria-hidden="true"></div>
      <header class="sheet__head"><h2 id="crop-title">Atur ${esc(target.label)}</h2></header>
      <div class="crop" tabindex="0" aria-label="Area atur posisi. Gunakan tombol panah untuk menggeser, plus dan minus untuk zoom.">
        <img class="crop__img" alt="" draggable="false">
        <div class="crop__mask" aria-hidden="true"></div>
      </div>
      <div class="zoom"><span aria-hidden="true">−</span><input type="range" min="1" max="${ZOOM_MAX}" step="0.01" value="1" aria-label="Zoom foto"><span aria-hidden="true">+</span></div>
      <p class="help" style="margin:10px 0 0">Geser foto dengan jari, cubit untuk zoom. Bagian dalam lingkaran yang dipakai.</p>
      <div class="sheet__actions" style="margin-top:16px">
        <button type="button" class="btn btn--ghost" data-crop="cancel">Batal</button>
        <button type="button" class="btn" data-crop="save">Simpan foto</button>
      </div>
    </div>`;
  document.body.append(root);
  document.body.classList.add("no-scroll");

  const stage = $(".crop", root);
  const view = $(".crop__img", root);
  const zoomInput = $('input[type="range"]', root);
  view.src = sourceUrl;

  const W = source.naturalWidth;
  const H = source.naturalHeight;
  let S = stage.clientWidth;
  let zoom = 1;
  let x = 0;
  let y = 0;
  let saving = false;

  const scale = () => (S / Math.min(W, H)) * zoom;

  function paint() {
    const s = scale();
    x = Math.min(0, Math.max(S - W * s, x));
    y = Math.min(0, Math.max(S - H * s, y));
    view.style.width = W * s + "px";
    view.style.height = H * s + "px";
    view.style.transform = `translate3d(${x}px, ${y}px, 0)`;
  }

  function setZoom(next, cx = S / 2, cy = S / 2) {
    next = Math.min(ZOOM_MAX, Math.max(1, next));
    const before = scale();
    const px = (cx - x) / before;
    const py = (cy - y) / before;
    zoom = next;
    const after = scale();
    x = cx - px * after;
    y = cy - py * after;
    zoomInput.value = String(zoom);
    paint();
  }

  x = (S - W * scale()) / 2;
  y = (S - H * scale()) / 2;
  paint();

  const pointers = new Map();
  let pinch = null;
  stage.addEventListener("pointerdown", (e) => {
    stage.setPointerCapture(e.pointerId);
    pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pointers.size === 2) {
      const [a, b] = [...pointers.values()];
      pinch = { dist: Math.hypot(a.x - b.x, a.y - b.y), zoom };
    }
  });
  stage.addEventListener("pointermove", (e) => {
    const prev = pointers.get(e.pointerId);
    if (!prev) return;
    const cur = { x: e.clientX, y: e.clientY };
    pointers.set(e.pointerId, cur);
    if (pointers.size === 1) {
      x += cur.x - prev.x;
      y += cur.y - prev.y;
      paint();
    } else if (pointers.size === 2 && pinch) {
      const [a, b] = [...pointers.values()];
      const rect = stage.getBoundingClientRect();
      const dist = Math.hypot(a.x - b.x, a.y - b.y);
      setZoom((pinch.zoom * dist) / pinch.dist, (a.x + b.x) / 2 - rect.left, (a.y + b.y) / 2 - rect.top);
    }
  });
  const release = (e) => {
    pointers.delete(e.pointerId);
    if (pointers.size < 2) pinch = null;
  };
  stage.addEventListener("pointerup", release);
  stage.addEventListener("pointercancel", release);
  stage.addEventListener(
    "wheel",
    (e) => {
      e.preventDefault();
      const rect = stage.getBoundingClientRect();
      setZoom(zoom * (e.deltaY < 0 ? 1.08 : 1 / 1.08), e.clientX - rect.left, e.clientY - rect.top);
    },
    { passive: false },
  );
  stage.addEventListener("keydown", (e) => {
    const step = e.shiftKey ? 40 : 10;
    const moves = { ArrowLeft: [-step, 0], ArrowRight: [step, 0], ArrowUp: [0, -step], ArrowDown: [0, step] };
    if (moves[e.key]) {
      e.preventDefault();
      x += moves[e.key][0];
      y += moves[e.key][1];
      paint();
    } else if (e.key === "+" || e.key === "=") setZoom(zoom * 1.1);
    else if (e.key === "-") setZoom(zoom / 1.1);
  });
  zoomInput.addEventListener("input", () => setZoom(Number(zoomInput.value)));

  const onResize = () => {
    const next = stage.clientWidth;
    if (!next || next === S) return;
    x *= next / S;
    y *= next / S;
    S = next;
    paint();
  };
  const onKey = (e) => {
    if (e.key === "Escape" && !saving) {
      e.stopPropagation();
      close();
    }
  };
  window.addEventListener("resize", onResize);
  document.addEventListener("keydown", onKey, true);

  function close() {
    window.removeEventListener("resize", onResize);
    document.removeEventListener("keydown", onKey, true);
    root.remove();
    document.body.classList.remove("no-scroll");
    URL.revokeObjectURL(sourceUrl);
    opener?.focus?.({ preventScroll: true });
  }

  function exportCrop() {
    const s = scale();
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = AVATAR_OUTPUT_PX;
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, AVATAR_OUTPUT_PX, AVATAR_OUTPUT_PX);
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(source, -x / s, -y / s, S / s, S / s, 0, 0, AVATAR_OUTPUT_PX, AVATAR_OUTPUT_PX);
    return new Promise((resolve, reject) =>
      canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("Gagal memproses foto."))), "image/jpeg", 0.9),
    );
  }

  root.addEventListener("click", async (e) => {
    if (saving) return;
    if (e.target === root) return close();
    const button = e.target.closest("[data-crop]");
    if (!button) return;
    if (button.dataset.crop === "cancel") return close();

    saving = true;
    $('[data-crop="cancel"]', root).disabled = true;
    try {
      await withBusy(button, "Menyimpan…", async () => saveProfilePhoto(target.slot, await exportCrop()));
      close();
      render();
      toast("Foto berhasil diganti ♡");
    } catch (err) {
      toast(err.message, true);
      saving = false;
      $('[data-crop="cancel"]', root).disabled = false;
    }
  });

  stage.focus();
}

/* ==========================================================
   Event (didelegasikan sekali untuk seluruh halaman)
   ========================================================== */

document.addEventListener("click", async (e) => {
  if (e.target.matches("[data-sheet-backdrop]")) return closeSheet();
  if (e.target.matches("[data-viewer]")) return closeViewer();

  const el = e.target.closest("[data-action]");
  if (!el) return;
  const { action } = el.dataset;
  try {
    switch (action) {
      case "tab":
        if (state.tab !== el.dataset.tab) {
          state.tab = el.dataset.tab;
          render();
          window.scrollTo(0, 0);
        }
        break;
      case "go-login":
        state.showLogin = true;
        render();
        $("#l-email")?.focus();
        break;
      case "back-public":
        Object.assign(state, { showLogin: false, loginError: "" });
        render();
        break;
      case "logout":
        await logout();
        break;
      case "add":
        if (el.dataset.kind === "photos") openPhotoSheet();
        else openEntrySheet({ kind: el.dataset.kind });
        break;
      case "edit":
        openEntrySheet({ id: el.dataset.id });
        break;
      case "close-sheet":
        closeSheet();
        break;
      case "delete-entry":
        await withBusy(el, "Menghapus…", () => deleteEntry(el.dataset.id));
        break;
      case "edit-anniversary":
        openAnniversarySheet();
        break;
      case "edit-hobbies":
        openHobbiesSheet(el.dataset.person);
        break;
      case "idea-next":
        state.ideaIndex = (state.ideaIndex + 1 + Math.floor(Math.random() * (DATE_IDEAS.length - 1))) % DATE_IDEAS.length;
        $(".idea__text").textContent = DATE_IDEAS[state.ideaIndex];
        break;
      case "idea-save":
        await withBusy(el, "Menyimpan…", async () => {
          await insertEntry({ category: "wishlist", title: DATE_IDEAS[state.ideaIndex] });
          await reload();
        });
        toast("Ide masuk ke wishlist ♡");
        break;
      case "view-photo":
        openViewer(el.dataset.id);
        break;
      case "close-viewer":
        closeViewer();
        break;
      case "delete-photo":
        await withBusy(el, "Menghapus…", () => deletePhoto(el.dataset.id));
        break;
      case "pick-photo":
        pickProfilePhoto(el.dataset.slot, el.dataset.label);
        break;
      case "remove-pending":
        removePending(Number(el.dataset.index));
        break;
      case "toggle-done":
        await withBusy(el, "…", () => toggleDone(el.dataset.id));
        break;
      case "wish-photo": {
        const x = state.entries.find((e) => e.id === el.dataset.id);
        openPhotoSheet({ title: x?.title, taken_on: x?.done_at });
        break;
      }
      case "wish-story": {
        const x = state.entries.find((e) => e.id === el.dataset.id);
        openEntrySheet({ kind: "memory", prefill: { title: x?.title, event_date: x?.done_at, description: x?.description } });
        break;
      }
      case "ics": {
        const x = state.entries.find((e) => e.id === el.dataset.id);
        if (x) downloadIcs(x);
        break;
      }
      case "write-letter":
        openWriteLetterSheet();
        break;
      case "letter-date": {
        const input = $("#w-date");
        if (input) input.value = el.dataset.date;
        break;
      }
      case "read-letter":
        openLetter(el.dataset.id);
        break;
      case "delete-letter":
        await withBusy(el, "Menghapus…", () => deleteLetter(el.dataset.id));
        break;
      case "open-recap":
        openRecap(Number(el.dataset.year));
        break;
      case "answer-daily":
        openAnswerSheet();
        break;
      case "answers-archive":
        openAnswersArchive();
        break;
      case "new-coupon":
        openCouponSheet();
        break;
      case "coupon-idea": {
        const input = $("#c-title");
        if (input) {
          input.value = el.dataset.title;
          input.focus();
        }
        break;
      }
      case "redeem-coupon":
        await withBusy(el, "…", () => redeemCoupon(el.dataset.id));
        break;
      case "delete-coupon":
        await deleteCoupon(el.dataset.id);
        break;
      case "take-snap":
        takeSnap();
        break;
      case "take-snap-file":
        takeSnapFromFile();
        break;
      case "switch-snap-cam":
        await switchSnapCamera();
        break;
      case "shoot-snap":
        await shootSnap();
        break;
      case "flip-snap":
        await flipSnap();
        break;
      case "view-snap":
        viewSnap(el.dataset.id);
        break;
      case "keep-snap":
        await withBusy(el, "Menyimpan…", () => keepSnap(el.dataset.id));
        break;
      case "viewer-step":
        viewerStep(Number(el.dataset.step));
        break;
    }
  } catch (err) {
    toast(err.message, true);
  }
});

document.addEventListener("submit", async (e) => {
  const form = e.target;
  const kind = form.dataset.form;
  if (!kind) return;
  e.preventDefault();
  const button = form.querySelector('button[type="submit"]');
  const handlers = {
    login: () => withBusy(button, "Masuk…", () => login(form)),
    entry: () => withBusy(button, "Menyimpan…", () => saveEntry(form)),
    anniversary: () => withBusy(button, "Menyimpan…", () => saveAnniversary(form)),
    hobbies: () => withBusy(button, "Menyimpan…", () => saveHobbies(form)),
    photos: () => withBusy(button, "Mengunggah…", () => uploadMemoryPhotos(form)),
    letter: () => withBusy(button, "Menyegel…", () => saveLetter(form)),
    answer: () => withBusy(button, "Mengirim…", () => saveAnswer(form)),
    coupon: () => withBusy(button, "Mengirim…", () => saveCoupon(form)),
    snap: () => withBusy(button, "Mengirim…", () => sendSnap(form)),
  };
  try {
    await handlers[kind]?.();
  } catch (err) {
    toast(err.message, true);
  }
});

document.addEventListener("change", (e) => {
  if (e.target.matches("[data-photo-input]")) {
    addPendingPhotos([...e.target.files]);
    e.target.value = "";
  } else if (e.target.matches("[data-category-switch]")) {
    switchEntryCategory(e.target);
  }
});

document.addEventListener("keydown", (e) => {
  if (viewerEl && (e.key === "ArrowLeft" || e.key === "ArrowRight")) {
    e.preventDefault();
    return viewerStep(e.key === "ArrowLeft" ? -1 : 1);
  }
  if (e.key !== "Escape") return;
  if (viewerEl) closeViewer();
  else if (sheetEl) closeSheet();
});

/* ==========================================================
   Mulai
   ========================================================== */

async function init() {
  state.session = readStoredSession();
  await Promise.all([loadPhotos(), loadProfilePhotos()]);
  if (state.session) {
    try {
      await loadCouple();
    } catch (err) {
      toast(err.message, true);
    }
  }
  render();
  if ("serviceWorker" in navigator) navigator.serviceWorker.register("/sw.js").catch(() => {});
}

// Saat aplikasi dibuka lagi (mis. dari home screen), ambil data terbaru
// supaya jawaban & PAP pasangan langsung kelihatan tanpa reload manual.
let hiddenAt = 0;
document.addEventListener("visibilitychange", async () => {
  if (document.hidden) {
    hiddenAt = Date.now();
    return;
  }
  if (!state.session || !state.couple || Date.now() - hiddenAt < 30000 || sheetEl || viewerEl) return;
  try {
    await loadCouple();
    render();
  } catch {
    /* diam saja; data lama tetap tampil */
  }
});

init();
