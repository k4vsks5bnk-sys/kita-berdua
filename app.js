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

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
const MB = 1024 * 1024;
const IMAGE_EXT = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp", "image/gif": "gif" };
const MEMORY_MAX_BYTES = 8 * MB;
const MEMORY_MAX_FILES = 3;
const AVATAR_SOURCE_MAX_BYTES = 25 * MB;
const AVATAR_OUTPUT_PX = 720;
const ZOOM_MAX = 4;

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
  Object.assign(state, { couple: null, members: [], entries: [], hobbies: {} });
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
};

/* ==========================================================
   Memuat data
   ========================================================== */

async function loadPhotos() {
  try {
    state.photos = await api(
      "/rest/v1/memory_photos?select=id,couple_id,title,caption,taken_on,storage_path,created_at&order=created_at.desc",
    );
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
  if (state.couple) await Promise.all([loadProfilePhotos(), loadHobbies()]);
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
  }
  return items.sort((a, b) => a.days - b.days);
}

function heroView() {
  const next = upcomingItems()[0];
  const anniversary = state.couple?.anniversary_date;
  return `<section class="hero">
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

/* ---------- Rencana ---------- */

function pageHead(title, sub) {
  return `<header class="page-head"><div><h1>${title}</h1><p>${sub}</p></div>${venn("sm")}</header>`;
}

function plansView() {
  const rows = entriesOf("wishlist").map((x) => entryRow(x, { lead: markIcon("pin") })).join("");
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
      ${rows ? `<div class="list">${rows}</div>` : emptyState("Wishlist masih kosong. Tulis satu tempat impian kalian.", "wishlist", "Tambah wishlist")}
    </section>`;
}

/* ---------- Kenangan ---------- */

const canManagePhoto = (photo) =>
  !!state.session && state.members.some((m) => m.user_id === state.session.user.id && m.couple_id === photo.couple_id);

function polaroids() {
  if (state.photoError) return `<div class="notice">${esc(state.photoError)}</div>`;
  if (!state.photos.length) return "";
  return `<div class="polaroids">${state.photos
    .map(
      (p) => `<button type="button" class="polaroid" data-action="view-photo" data-id="${esc(p.id)}" aria-label="Lihat foto ${esc(p.title)}">
        <img src="${esc(storage.publicUrl("kenangan", p.storage_path))}" alt="" loading="lazy" decoding="async">
        <span class="polaroid__caption"><span class="polaroid__title">${esc(p.title)}</span>
        ${p.taken_on ? `<span class="polaroid__date">${esc(formatDate(p.taken_on))}</span>` : ""}</span>
      </button>`,
    )
    .join("")}</div>`;
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

function giftsView() {
  const rows = entriesOf("gift").map((x) => entryRow(x, { lead: markIcon("gift") })).join("");
  return `${pageHead("Hadiah", "Catat ide hadiah sebelum lupa")}
    <section class="section">
      <div class="section-head"><h2>Daftar ide</h2>${addButton("gift")}</div>
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
    <div class="account"><span>Masuk sebagai ${esc(state.session?.user?.email)}</span>
      <button type="button" class="btn btn--sm btn--ghost" data-action="logout">Keluar</button></div>`;
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

function openEntrySheet({ kind, id }) {
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
      <div data-entry-fields>${entryFields(category, editing || {})}</div>
      <div class="sheet__actions">
        ${editing ? `<button type="button" class="btn btn--danger" data-action="delete-entry" data-id="${esc(editing.id)}">Hapus</button>` : ""}
        <button type="submit" class="btn">${editing ? "Simpan perubahan" : "Simpan"}</button>
      </div>
    </form>`,
  );
}

function switchEntryCategory(radio) {
  const form = radio.form;
  const values = Object.fromEntries(ENTRY_FIELDS.map((k) => [k, formValue(form, k)]));
  $("[data-entry-fields]", form).innerHTML = entryFields(radio.value, values);
}

function openPhotoSheet() {
  openSheet(
    "Tambah foto kenangan",
    `<form data-form="photos">
      <label class="drop">${icon("upload")}<span><strong>Pilih foto</strong> dari galeri HP</span>
        <small>Maksimal ${MEMORY_MAX_FILES} foto, masing-masing 8 MB</small>
        <input type="file" accept="${Object.keys(IMAGE_EXT).join(",")}" multiple data-photo-input></label>
      <div class="thumbs" data-thumbs>${thumbsMarkup()}</div>
      ${field("p-title", "Judul kenangan", '<input id="p-title" name="title" maxlength="140" required placeholder="Hari paling bahagia…">')}
      ${field("p-date", "Tanggal (opsional)", '<input id="p-date" name="taken_on" type="date">')}
      ${field("p-caption", "Cerita singkat (opsional)", '<textarea id="p-caption" name="caption" maxlength="1500" placeholder="Ceritakan momen ini…"></textarea>')}
      <p class="help">Foto di galeri bisa dilihat pengunjung tanpa login.</p>
      <div class="sheet__actions"><button type="submit" class="btn">Upload foto</button></div>
    </form>`,
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
    else if (file.size > MEMORY_MAX_BYTES) skipped.push(`${file.name}: lebih dari 8 MB`);
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
  let saved = 0;
  try {
    while (state.pendingPhotos.length) {
      const { file, url } = state.pendingPhotos[0];
      const path = `${state.couple.id}/${crypto.randomUUID()}.${IMAGE_EXT[file.type]}`;
      await storage.upload("kenangan", path, file);
      try {
        await api("/rest/v1/memory_photos", {
          method: "POST",
          headers: { Prefer: "return=minimal" },
          body: JSON.stringify({ couple_id: state.couple.id, storage_path: path, ...meta }),
        });
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
  if (!confirm("Hapus foto kenangan ini secara permanen?")) return;
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
  const photo = state.photos.find((p) => p.id === id);
  if (!photo) return;
  viewerOpener = document.activeElement;
  viewerEl = document.createElement("div");
  viewerEl.className = "viewer";
  viewerEl.dataset.viewer = "";
  viewerEl.setAttribute("role", "dialog");
  viewerEl.setAttribute("aria-modal", "true");
  viewerEl.setAttribute("aria-label", photo.title);
  viewerEl.innerHTML = `<button type="button" class="icon-btn viewer__close" data-action="close-viewer" aria-label="Tutup">×</button>
    <img src="${esc(storage.publicUrl("kenangan", photo.storage_path))}" alt="${esc(photo.title)}">
    <div class="viewer__text"><h2>${esc(photo.title)}</h2>
      ${photo.taken_on ? `<small>${esc(formatDate(photo.taken_on))}</small>` : ""}
      ${photo.caption ? `<p>${esc(photo.caption)}</p>` : ""}
    </div>
    ${canManagePhoto(photo) ? `<button type="button" class="btn btn--sm btn--danger" data-action="delete-photo" data-id="${esc(photo.id)}">Hapus foto</button>` : ""}`;
  document.body.append(viewerEl);
  document.body.classList.add("no-scroll");
  $(".viewer__close", viewerEl).focus();
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

init();
