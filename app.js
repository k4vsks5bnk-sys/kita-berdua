"use strict";

/* ==========================================================
   Konfigurasi
   ========================================================== */

const SUPABASE_URL = "https://qazejhlwfxfbxxrpbvcf.supabase.co";
// Kunci publik (publishable). Keamanan data ditegakkan oleh RLS di Supabase.
const SUPABASE_KEY = "sb_publishable_JkmNx4pmhhVayYOQx2gRlw_4hExgxfs";
const SESSION_KEY = "kb_session";

// Satu-satunya tempat nama pasangan ditulis. `slot` dipakai untuk foto profil.
const PEOPLE = [
  { name: "Aiya", slot: "aiya" },
  { name: "Denan", slot: "denan" },
];

const TABS = [
  { id: "schedule", icon: "📅", name: "Jadwal" },
  { id: "about", icon: "🌸", name: "Tentang Kita" },
  { id: "wishlist", icon: "✨", name: "Wishlist" },
  { id: "important_date", icon: "🎂", name: "Tanggal Penting" },
  { id: "date_idea", icon: "🎲", name: "Ide Kencan" },
  { id: "gift", icon: "🎁", name: "Hadiah" },
  { id: "memory", icon: "📸", name: "Kenangan" },
];

const ENTRY_TYPES = {
  schedule: { title: "Kegiatan", form: "Tambah rencana", list: "Rencana kita", desc: "Catatan (opsional)", date: true, time: true, location: true },
  wishlist: { title: "Tempat atau kegiatan", form: "Mau kita datangi / lakukan", list: "Wishlist kita", desc: "Catatan (opsional)", location: true },
  important_date: { title: "Nama momen", form: "Tambah tanggal spesial", list: "Tanggal penting kita", desc: "Catatan (opsional)", date: true },
  gift: { title: "Ide hadiah", form: "Tambah ide hadiah", list: "Daftar hadiah", desc: "Catatan hadiah" },
  memory: { title: "Judul kenangan", form: "Tambah cerita tanpa foto", list: "Linimasa kita", desc: "Cerita kita", date: true },
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
];

const MB = 1024 * 1024;
const IMAGE_EXT = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp", "image/gif": "gif" };
const MEMORY_MAX_BYTES = 8 * MB;
const MEMORY_MAX_FILES = 3;
const AVATAR_SOURCE_MAX_BYTES = 25 * MB; // sebelum dipotong & dikompres
const AVATAR_OUTPUT_PX = 720; // hasil akhir foto profil: 720×720 JPEG
const ZOOM_MAX = 4;

const ICON_CAMERA =
  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 8h3l2-3h6l2 3h3v11H4z"/><circle cx="12" cy="13" r="3.5"/></svg>';

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
  hobbiesTable: false, // true jika tabel member_hobbies sudah dibuat
  photoError: "",
  loginError: "",
  showLogin: false,
  tab: "schedule",
  person: PEOPLE[0].name,
  ideaIndex: 0,
  editingId: null,
  pendingPhotos: [], // [{ file, url }]
  photoDraft: {}, // isian form upload, dipertahankan bila upload gagal
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

function formatDate(isoDate) {
  if (!isoDate) return "";
  return new Date(isoDate + "T12:00:00").toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
}

function formValue(form, name) {
  return form.elements.namedItem(name)?.value?.trim() || null;
}

function field(id, label, control) {
  return `<div class="field"><label for="${id}">${label}</label>${control}</div>`;
}

async function withBusy(button, busyText, task) {
  const original = button?.textContent;
  if (button) {
    button.disabled = true;
    button.textContent = busyText;
  }
  try {
    return await task();
  } finally {
    if (button?.isConnected) {
      button.disabled = false;
      button.textContent = original;
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
  Object.assign(state, { couple: null, members: [], entries: [], hobbies: {}, editingId: null });
}

// Satu proses refresh untuk semua request yang bersamaan.
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
  // Perpanjang token sebelum kedaluwarsa (sisa < 60 detik).
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
    // Tabel baru belum dibuat: pakai cara lama (disimpan di entries).
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
   Tampilan
   ========================================================== */

const coupleNames = (sep = " & ") => PEOPLE.map((p) => p.name).join(sep);

function profileUrl(slot) {
  const photo = state.profilePhotos.find((p) => p.slot === slot && (!state.couple || p.couple_id === state.couple.id));
  return photo ? storage.publicUrl("profil", photo.storage_path) : "";
}

function avatar(slot, emoji, { size = "hero", editable = false, label = "" } = {}) {
  const url = profileUrl(slot);
  const inner = url
    ? `<img src="${esc(url)}" alt="${esc(label)}" decoding="async">`
    : `<span aria-hidden="true">${emoji}</span>`;
  const edit = editable
    ? `<button type="button" class="avatar__edit" data-action="pick-photo" data-slot="${esc(slot)}" data-label="${esc(label)}" aria-label="Ganti ${esc(label)}">${ICON_CAMERA}</button>`
    : "";
  return `<div class="avatar avatar--${size}"><div class="avatar__frame">${inner}</div>${edit}</div>`;
}

function daysTogether() {
  const start = state.couple?.anniversary_date;
  if (!start) return 0;
  return Math.max(0, Math.floor((Date.now() - new Date(start + "T00:00:00").getTime()) / 86400000));
}

function publicView() {
  return `<main class="shell">
    <header class="hero">${avatar("couple", "💕", { label: "Foto kita berdua" })}
      <h1>Kita Berdua</h1><p class="sub">${esc(coupleNames().toLowerCase())} · cerita yang kita simpan</p></header>
    ${gallery()}
    <div class="public-link"><button class="btn outline" data-action="go-login">Masuk sebagai ${esc(coupleNames(" / "))}</button></div>
    <p class="footer">Made with love ♡</p>
  </main>`;
}

function loginView() {
  return `<main class="login">
    <div class="hero">${avatar("couple", "💕", { label: "Foto kita berdua" })}<h1>Kita Berdua</h1><p class="sub">ruang kecil untuk cerita kita</p></div>
    <section class="card"><h2>Masuk dulu, sayang ♡</h2>
      <form data-form="login" novalidate>
        ${state.loginError ? `<div class="form-error" role="alert">${esc(state.loginError)}</div>` : ""}
        ${field("l-email", "Email", '<input id="l-email" name="email" type="email" autocomplete="username" required placeholder="Email kamu">')}
        ${field("l-pass", "Password", '<input id="l-pass" name="password" type="password" autocomplete="current-password" required placeholder="Password">')}
        <button class="btn block" type="submit">Masuk ke ruang kita</button>
      </form>
    </section>
    <p class="footer"><button class="link-btn" data-action="back-public">← Kembali ke galeri</button></p>
  </main>`;
}

function header() {
  return `<div class="topbar"><span class="muted">${esc(state.session?.user?.email)}</span><button class="btn outline sm" data-action="logout">Keluar</button></div>
  <header class="hero">${avatar("couple", "💑", { label: "Foto kita berdua" })}
    <h1>Kita Berdua</h1><p class="sub">${esc(coupleNames().toLowerCase())}</p>
    ${state.couple?.anniversary_date ? `<p class="count">💗 Bersama selama <strong>${daysTogether()} hari</strong></p>` : ""}
  </header>
  <nav class="nav" aria-label="Menu">${TABS.map(
    (t) => `<button data-action="tab" data-tab="${t.id}" ${state.tab === t.id ? 'aria-current="page"' : ""}>${t.icon} ${t.name}</button>`,
  ).join("")}</nav>`;
}

function entryForm(cat) {
  const type = ENTRY_TYPES[cat];
  const editing = state.entries.find((e) => e.id === state.editingId && e.category === cat) || null;
  const val = (key) => esc(key === "event_time" ? editing?.event_time?.slice(0, 5) : editing?.[key]);

  const dateRow = type.date
    ? `<div class="grid">${field("f-date", "Tanggal", `<input id="f-date" name="event_date" type="date" value="${val("event_date")}">`)}${
        type.time ? field("f-time", "Jam", `<input id="f-time" name="event_time" type="time" value="${val("event_time")}">`) : ""
      }</div>`
    : "";
  const location = type.location
    ? field("f-loc", "Lokasi (opsional)", `<input id="f-loc" name="location" placeholder="Tempat tujuan" value="${val("location")}">`)
    : "";

  return `<section class="card" id="entry-card"><h2>${editing ? "✎ Ubah item" : type.form}</h2>
    <form data-form="entry" data-category="${cat}" ${editing ? `data-editing="${esc(editing.id)}"` : ""}>
      ${field("f-title", type.title, `<input id="f-title" name="title" maxlength="140" required placeholder="Tulis di sini..." value="${val("title")}">`)}
      ${dateRow}${location}
      ${field("f-desc", type.desc, `<textarea id="f-desc" name="description" placeholder="Tulis sesuatu...">${val("description")}</textarea>`)}
      <div class="actions">
        <button class="btn" type="submit">${editing ? "Simpan perubahan" : "Simpan"}</button>
        ${editing ? '<button type="button" class="btn outline" data-action="cancel-edit">Batal</button>' : ""}
      </div>
    </form></section>`;
}

function entryList(cat) {
  const items = state.entries
    .filter((e) => e.category === cat)
    .sort((a, b) => {
      if (!a.event_date || !b.event_date) return a.event_date ? -1 : b.event_date ? 1 : 0;
      return a.event_date.localeCompare(b.event_date);
    });
  if (!items.length) return '<div class="empty">Belum ada cerita di sini. Yuk mulai bersama ♡</div>';

  return items
    .map((x) => {
      const meta = [formatDate(x.event_date), x.event_time?.slice(0, 5), x.location].filter(Boolean).map(esc).join(" · ");
      return `<article class="item ${x.id === state.editingId ? "is-editing" : ""}">
        <div class="item__head"><div><strong>${esc(x.title)}</strong>${meta ? `<div class="muted">${meta}</div>` : ""}</div>
          <div class="actions">
            <button class="btn outline sm" data-action="edit" data-id="${esc(x.id)}" aria-label="Ubah ${esc(x.title)}">✎</button>
            <button class="btn outline sm" data-action="delete-entry" data-id="${esc(x.id)}" aria-label="Hapus ${esc(x.title)}">×</button>
          </div></div>
        ${x.description ? `<p class="item__desc">${esc(x.description)}</p>` : ""}
      </article>`;
    })
    .join("");
}

function entrySection(cat) {
  return `${entryForm(cat)}<section class="card"><h2>${ENTRY_TYPES[cat].list}</h2>${entryList(cat)}</section>`;
}

const canManagePhoto = (photo) =>
  !!state.session && state.members.some((m) => m.user_id === state.session.user.id && m.couple_id === photo.couple_id);

function gallery() {
  const cards = state.photos
    .map(
      (p) => `<figure class="photo-card">
        <button class="photo-card__open" data-action="view-photo" data-id="${esc(p.id)}" aria-label="Perbesar foto ${esc(p.title)}">
          <img src="${esc(storage.publicUrl("kenangan", p.storage_path))}" alt="${esc(p.title)}" loading="lazy" decoding="async">
        </button>
        <figcaption><strong>${esc(p.title)}</strong>
          ${p.taken_on ? `<span class="muted">${esc(formatDate(p.taken_on))}</span>` : ""}
          ${p.caption ? `<p>${esc(p.caption)}</p>` : ""}
          ${canManagePhoto(p) ? `<button class="btn outline sm" data-action="delete-photo" data-id="${esc(p.id)}">Hapus foto</button>` : ""}
        </figcaption></figure>`,
    )
    .join("");

  return `<section class="card"><h2>📸 Galeri Kenangan Kita</h2>
    <p class="muted">Momen kecil yang ingin kita ingat selamanya ♡</p>
    ${state.photoError ? `<div class="notice">${esc(state.photoError)}</div>` : ""}
    ${cards ? `<div class="gallery">${cards}</div>` : '<div class="empty">Belum ada foto. Kita mulai mengabadikan cerita, yuk ♡</div>'}
  </section>`;
}

function thumbsMarkup() {
  return state.pendingPhotos
    .map(
      (p, i) => `<div class="thumb"><img src="${esc(p.url)}" alt="Foto ${i + 1} yang akan diupload">
        <button type="button" class="thumb__remove" data-action="remove-pending" data-index="${i}" aria-label="Batalkan foto ${i + 1}">×</button></div>`,
    )
    .join("");
}

function uploadForm() {
  const d = state.photoDraft;
  return `<section class="card"><h2>💕 Tambah Foto Kenangan</h2>
    <form data-form="photos">
      ${field("p-files", `Pilih foto (maksimal ${MEMORY_MAX_FILES})`, `<input id="p-files" type="file" accept="${Object.keys(IMAGE_EXT).join(",")}" multiple data-photo-input>`)}
      <div class="thumbs" data-thumbs>${thumbsMarkup()}</div>
      ${field("p-title", "Judul kenangan", `<input id="p-title" name="title" maxlength="140" required placeholder="Hari paling bahagia..." value="${esc(d.title)}">`)}
      ${field("p-date", "Tanggal (opsional)", `<input id="p-date" name="taken_on" type="date" value="${esc(d.taken_on)}">`)}
      ${field("p-caption", "Cerita singkat (opsional)", `<textarea id="p-caption" name="caption" maxlength="1500" placeholder="Ceritakan momen ini...">${esc(d.caption)}</textarea>`)}
      <p class="upload-help">Maksimal 8 MB per foto. Semua foto di galeri bisa dilihat pengunjung.</p>
      <button class="btn" type="submit">Upload foto ♡</button>
    </form></section>`;
}

function aboutView() {
  const person = PEOPLE.find((p) => p.name === state.person) || PEOPLE[0];
  const changeBtn = (slot, label) =>
    `<button type="button" class="btn outline sm" data-action="pick-photo" data-slot="${slot}" data-label="${esc(label)}">Ganti foto</button>`;

  return `<section class="card card--center"><h2>💞 Foto Kita Berdua</h2>
      ${avatar("couple", "💑", { size: "profile", editable: true, label: "foto kita berdua" })}
      ${changeBtn("couple", "foto kita berdua")}
      <form data-form="anniversary" class="anniversary">
        ${field("a-date", "Tanggal jadian", `<input id="a-date" name="anniversary_date" type="date" value="${esc(state.couple?.anniversary_date)}">`)}
        <button class="btn sm" type="submit">Simpan tanggal</button>
      </form>
    </section>
    <section class="card">
      <div class="tabs" role="tablist" aria-label="Pilih profil">${PEOPLE.map(
        (p) => `<button type="button" role="tab" aria-selected="${p.name === person.name}" data-action="person" data-person="${esc(p.name)}">${esc(p.name)}</button>`,
      ).join("")}</div>
      <div class="person">
        ${avatar(person.slot, "💕", { size: "profile", editable: true, label: "foto " + person.name })}
        ${changeBtn(person.slot, "foto " + person.name)}
        <h2 style="margin-top:16px">💕 ${esc(person.name)}</h2>
        <p class="muted">Hobi dan hal-hal favorit</p>
        <form data-form="hobbies" data-person="${esc(person.name)}">
          ${field("h-hobbies", "Hobi (pisahkan dengan koma)", `<textarea id="h-hobbies" name="hobbies" placeholder="Makan, kucing, jalan-jalan">${esc(state.hobbies[person.name])}</textarea>`)}
          <button class="btn" type="submit">Simpan hobi</button>
        </form>
      </div>
    </section>`;
}

function ideaView() {
  return `<section class="card"><h2>🎲 Bingung mau kencan ke mana?</h2>
    <p class="muted">Tekan tombol, biarkan nasib memilih.</p>
    <div class="idea" aria-live="polite">${esc(DATE_IDEAS[state.ideaIndex])}</div>
    <div class="actions"><button class="btn" data-action="idea-save">Masukkan ke wishlist</button><button class="btn outline" data-action="idea-next">🎲 Acak ide</button></div>
  </section>`;
}

function page() {
  switch (state.tab) {
    case "about":
      return aboutView();
    case "date_idea":
      return ideaView();
    case "memory":
      return uploadForm() + gallery() + entrySection("memory");
    default:
      return entrySection(state.tab);
  }
}

function notLinkedView() {
  return `<section class="card"><h2>Ruang pasangan belum terhubung</h2>
    <p>Login berhasil, tetapi akun ini belum tercatat di <code>couple_members</code>. Periksa SQL penghubung ${esc(coupleNames())}.</p></section>`;
}

function render() {
  const app = $("#app");
  if (!state.session) {
    app.innerHTML = state.showLogin ? loginView() : publicView();
    return;
  }
  app.innerHTML = `<main class="shell">${header()}${state.couple ? page() : notLinkedView()}
    <p class="footer">Made with love ♡ ${esc(coupleNames())}</p></main>`;
}

/* ==========================================================
   Aksi: login, entri, galeri
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
    Object.assign(state, { loginError: "", showLogin: false });
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
  if (token) {
    // Cabut token di server; abaikan jika sedang offline.
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
  const data = Object.fromEntries(ENTRY_FIELDS.map((k) => [k, formValue(form, k)]));
  const editingId = form.dataset.editing;
  if (editingId) {
    await api(`/rest/v1/entries?id=${eq(editingId)}`, { method: "PATCH", body: JSON.stringify(data) });
  } else {
    await insertEntry({ ...data, category: form.dataset.category });
  }
  state.editingId = null;
  await reload();
  toast(editingId ? "Perubahan disimpan ♡" : "Tersimpan untuk kita berdua ♡");
}

function startEdit(id) {
  const entry = state.entries.find((e) => e.id === id);
  if (!entry) return;
  state.tab = entry.category;
  state.editingId = id;
  render();
  $("#entry-card")?.scrollIntoView({ behavior: prefersReducedMotion() ? "auto" : "smooth", block: "start" });
  $("#f-title")?.focus({ preventScroll: true });
}

async function deleteEntry(id) {
  if (!confirm("Hapus item ini?")) return;
  await api(`/rest/v1/entries?id=${eq(id)}`, { method: "DELETE" });
  if (state.editingId === id) state.editingId = null;
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
  render();
  toast("Tanggal disimpan ♡");
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
  await reload();
  toast("Hobi tersimpan ♡");
}

/* ---------- Foto kenangan ---------- */

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

function refreshThumbs() {
  const box = $("[data-thumbs]");
  if (box) box.innerHTML = thumbsMarkup();
}

async function uploadMemoryPhotos(form) {
  const meta = {
    title: formValue(form, "title"),
    taken_on: formValue(form, "taken_on"),
    caption: formValue(form, "caption"),
  };
  state.photoDraft = meta;
  if (!state.pendingPhotos.length) throw new Error("Pilih minimal satu foto dulu.");
  if (!meta.title) throw new Error("Isi judul kenangan dulu.");

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
    state.photoDraft = {};
  } catch (err) {
    throw new Error(saved ? `${saved} dari ${total} foto berhasil. Sisanya gagal: ${err.message}` : err.message);
  } finally {
    await loadPhotos();
    render();
  }
  toast(saved > 1 ? `${saved} foto kenangan ditambahkan ♡` : "Foto kenangan ditambahkan ♡");
}

async function deletePhoto(id) {
  const photo = state.photos.find((p) => p.id === id);
  if (!photo || !canManagePhoto(photo)) return;
  if (!confirm("Hapus foto kenangan ini secara permanen?")) return;
  // Hapus baris database dulu agar galeri tidak pernah menampilkan foto rusak.
  await api(`/rest/v1/memory_photos?id=${eq(id)}`, { method: "DELETE" });
  await storage.remove("kenangan", photo.storage_path).catch(() => {});
  await loadPhotos();
  render();
  toast("Foto dihapus.");
}

function openViewer(id) {
  const photo = state.photos.find((p) => p.id === id);
  if (!photo) return;
  const opener = document.activeElement;
  const overlay = document.createElement("div");
  overlay.className = "viewer";
  overlay.setAttribute("role", "dialog");
  overlay.setAttribute("aria-modal", "true");
  overlay.setAttribute("aria-label", photo.title);
  overlay.innerHTML = `<img src="${esc(storage.publicUrl("kenangan", photo.storage_path))}" alt="${esc(photo.title)}"><button class="btn" type="button">Tutup ×</button>`;

  const close = () => {
    document.removeEventListener("keydown", onKey);
    overlay.remove();
    document.body.classList.remove("no-scroll");
    opener?.focus?.();
  };
  const onKey = (e) => e.key === "Escape" && close();
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay || e.target.closest("button")) close();
  });
  document.addEventListener("keydown", onKey);
  document.body.append(overlay);
  document.body.classList.add("no-scroll");
  $("button", overlay).focus();
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
      <h2 id="crop-title">Atur ${esc(target.label)}</h2>
      <p class="muted">Geser foto untuk mengatur posisi. Hanya bagian di dalam lingkaran yang dipakai.</p>
      <div class="crop" tabindex="0" aria-label="Area atur posisi. Gunakan tombol panah untuk menggeser, plus dan minus untuk zoom.">
        <img class="crop__img" alt="" draggable="false">
        <div class="crop__mask" aria-hidden="true"></div>
      </div>
      <div class="zoom"><span aria-hidden="true">−</span><input type="range" min="1" max="${ZOOM_MAX}" step="0.01" value="1" aria-label="Zoom foto"><span aria-hidden="true">+</span></div>
      <div class="sheet__actions">
        <button type="button" class="btn outline" data-crop="cancel">Batal</button>
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
  let S = stage.clientWidth; // sisi area potong (px layar)
  let zoom = 1;
  let x = 0; // posisi kiri-atas foto relatif terhadap area potong
  let y = 0;
  let saving = false;

  const scale = () => (S / Math.min(W, H)) * zoom; // zoom 1 = foto pas menutupi lingkaran

  function paint() {
    const s = scale();
    // Foto tidak boleh digeser sampai ada celah kosong di dalam area potong.
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

  // Geser (1 jari / mouse) dan cubit untuk zoom (2 jari)
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
    if (e.key === "Escape" && !saving) close();
  };
  window.addEventListener("resize", onResize);
  document.addEventListener("keydown", onKey);

  function close() {
    window.removeEventListener("resize", onResize);
    document.removeEventListener("keydown", onKey);
    root.remove();
    document.body.classList.remove("no-scroll");
    URL.revokeObjectURL(sourceUrl);
    opener?.focus?.();
  }

  function exportCrop() {
    const s = scale();
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = AVATAR_OUTPUT_PX;
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "#ffffff"; // latar untuk PNG transparan
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
   Event (didelegasikan sekali, tidak dipasang ulang tiap render)
   ========================================================== */

const app = $("#app");

app.addEventListener("click", async (e) => {
  const el = e.target.closest("[data-action]");
  if (!el) return;
  const { action } = el.dataset;
  try {
    switch (action) {
      case "tab":
        state.tab = el.dataset.tab;
        state.editingId = null;
        render();
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
      case "person":
        state.person = el.dataset.person;
        render();
        break;
      case "idea-next":
        state.ideaIndex = (state.ideaIndex + 1 + Math.floor(Math.random() * (DATE_IDEAS.length - 1))) % DATE_IDEAS.length;
        render();
        break;
      case "idea-save":
        await withBusy(el, "Menyimpan…", async () => {
          await insertEntry({ category: "wishlist", title: DATE_IDEAS[state.ideaIndex] });
          await reload();
        });
        toast("Ide masuk ke wishlist ♡");
        break;
      case "edit":
        startEdit(el.dataset.id);
        break;
      case "cancel-edit":
        state.editingId = null;
        render();
        break;
      case "delete-entry":
        await deleteEntry(el.dataset.id);
        break;
      case "delete-photo":
        await deletePhoto(el.dataset.id);
        break;
      case "view-photo":
        openViewer(el.dataset.id);
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

app.addEventListener("submit", async (e) => {
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

app.addEventListener("change", (e) => {
  if (e.target.matches("[data-photo-input]")) {
    addPendingPhotos([...e.target.files]);
    e.target.value = ""; // agar file yang sama bisa dipilih lagi
  }
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
