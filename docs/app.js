import { buildIndex, normalizeCategories, search as smartSearch } from "./search.js?v=2.4.19";

const $ = (id) => document.getElementById(id);
const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");

const sections = $("sections");
const searchInput = $("search");
const count = $("count");
const chipsEl = $("cat-chips");
const suggestEl = $("suggest");
const toast = $("toast");
let toastTimer;
let index = null;
const META = new Map(); // char -> { name, category }

// Fallback so the board still works if the JSON fails to load.
const FALLBACK = { categories: [
  { name: "Symbols", emoji: [
    { char: "❤️", name: "heavy black heart" }, { char: "⭐️", name: "white medium star" },
    { char: "✅", name: "white heavy check mark" }, { char: "⚠️", name: "warning sign" },
    { char: "☕️", name: "hot beverage" }, { char: "✈️", name: "airplane" }
  ] }
]};

let categories = normalizeCategories(FALLBACK.categories);
let activeCat = "all";

function normalizeEmoji(list) {
  // Support both the enriched {char,name} shape and the legacy string shape.
  return list.map((e) => (typeof e === "string" ? { char: e, name: "" } : e));
}

function copyEmoji(value) {
  const announce = (message) => {
    toast.textContent = message;
    toast.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove("show"), 1300);
  };
  const done = () => announce(`Copied ${value}`);
  const fallback = () => {
    // execCommand fallback for restricted clipboard contexts
    const ta = document.createElement("textarea");
    ta.value = value; document.body.appendChild(ta); ta.select();
    let copied = false;
    try { copied = document.execCommand("copy"); } catch { /* report below */ }
    ta.remove();
    if (copied) done();
    else announce("Copy failed. Select the emoji and copy it manually.");
  };
  const writeText = navigator.clipboard?.writeText?.bind(navigator.clipboard);
  if (writeText) writeText(value).then(done).catch(fallback);
  else fallback();
}

function renderChips() {
  const all = [{ name: "All", key: "all" }, ...categories.map(c => ({ name: c.name, key: c.name }))];
  chipsEl.innerHTML = all.map(c =>
    `<button class="cat-chip${c.key === activeCat ? " active" : ""}" type="button" data-cat="${esc(c.key)}">${esc(c.name)}</button>`
  ).join("");
  for (const btn of chipsEl.querySelectorAll(".cat-chip")) {
    btn.addEventListener("click", () => { activeCat = btn.dataset.cat; renderChips(); render(); });
  }
}

function cell(char) {
  const name = META.get(char)?.name || char;
  return `<button class="emoji-btn" type="button" title="${esc(name)}" aria-label="Copy ${esc(name)}" data-emoji="${esc(char)}">${char}</button>`;
}

document.addEventListener("click", (event) => {
  const btn = event.target.closest("[data-emoji]");
  if (btn) copyEmoji(btn.dataset.emoji);
});

function render() {
  const query = searchInput.value.trim();
  suggestEl.hidden = true;
  suggestEl.innerHTML = "";

  if (query && !index) {
    count.textContent = "Loading emoji...";
    sections.innerHTML = `<p class="board-empty">Loading emoji data...</p>`;
    return;
  }

  if (!query) {
    // Browse mode: category groups.
    let total = 0;
    sections.innerHTML = categories.map((category) => {
      if (activeCat !== "all" && category.name !== activeCat) return "";
      const items = normalizeEmoji(category.emoji);
      total += items.length;
      return `<section class="emoji-section">
        <h2>${esc(category.name)} <span style="color:var(--ink-mute);font-weight:600">${items.length}</span></h2>
        <div class="emoji-grid">${items.map((e) => cell(e.char)).join("")}</div>
      </section>`;
    }).join("");
    count.textContent = `${total} emoji`;
    return;
  }

  // Search mode: ranked results across the whole set (respecting active chip).
  const { results, suggestion } = smartSearch(index, query);
  const filtered = activeCat === "all" ? results : results.filter(r => r.category === activeCat);
  count.textContent = `${filtered.length} result${filtered.length === 1 ? "" : "s"}`;

  if (filtered.length) {
    sections.innerHTML = `<section class="emoji-section">
      <h2>Results <span style="color:var(--ink-mute);font-weight:600">${filtered.length}</span></h2>
      <div class="emoji-grid">${filtered.map(r => cell(r.char)).join("")}</div>
    </section>`;
  } else {
    sections.innerHTML = `<p class="board-empty">No emoji match “${esc(query)}”.</p>`;
  }

  if (suggestion) {
    suggestEl.hidden = false;
    suggestEl.innerHTML = `Did you mean <button type="button" data-suggest="${esc(suggestion)}">${esc(suggestion)}</button>?`;
    suggestEl.querySelector("[data-suggest]").addEventListener("click", () => {
      searchInput.value = suggestion; syncClear(); render(); searchInput.focus();
    });
  }
}

async function load() {
  try {
    const res = await fetch("data/emoji.json", { cache: "no-store" });
    if (res.ok) {
      const data = await res.json();
      const loaded = normalizeCategories(data.categories);
      if (loaded.length) categories = loaded;
    }
  } catch { /* keep fallback */ }
  index = buildIndex(categories);
  for (const c of categories) for (const e of normalizeEmoji(c.emoji)) META.set(e.char, { name: e.name, category: c.name });
  renderChips();
  render();
  syncClear();
}

const clearBtn = $("search-clear");
function syncClear() { clearBtn.hidden = searchInput.value.length === 0; }
searchInput.addEventListener("input", () => { syncClear(); render(); });
clearBtn.addEventListener("click", () => {
  searchInput.value = "";
  syncClear();
  render();
  searchInput.focus();
});
searchInput.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && searchInput.value) { searchInput.value = ""; syncClear(); render(); }
});
load();

if (new URLSearchParams(location.search).has("demo")) {
  searchInput.value = "heart";
  addEventListener("load", () => { syncClear(); render(); });
}

// Shared shell: theme, nav, scroll-to-top, background scene.
const themeToggle = $("theme-toggle");
function syncThemeIcon() {
  const label = document.documentElement.dataset.theme === "light" ? "Switch to dark mode" : "Switch to light mode";
  themeToggle.setAttribute("aria-label", label);
  themeToggle.setAttribute("data-tip", label);
}
let themeFadeTimer = 0;
themeToggle.addEventListener("click", () => {
  // Crossfade the page in one composited pass where the browser supports
  // view transitions; text then cannot re-ease its inherited color and lag
  // behind the page. Elsewhere, fall back to fading only non-inherited
  // colors so text switches in one clean step.
  if (document.startViewTransition) {
    document.documentElement.classList.add("vt-active");
    const vt = document.startViewTransition(() => {
      const next = document.documentElement.dataset.theme === "light" ? "dark" : "light";
      document.documentElement.dataset.theme = next;
      localStorage.setItem("theme", next);
      syncThemeIcon();
    });
    vt.finished.finally(() => document.documentElement.classList.remove("vt-active"));
    return;
  }
  document.documentElement.classList.add("theme-fading");
  clearTimeout(themeFadeTimer);
  themeFadeTimer = setTimeout(() => document.documentElement.classList.remove("theme-fading"), 500);
  const next = document.documentElement.dataset.theme === "light" ? "dark" : "light";
  document.documentElement.dataset.theme = next;
  localStorage.setItem("theme", next);
  syncThemeIcon();
});
syncThemeIcon();

// Scroll spy: the active menu item is the last section whose heading sits
// at or above the reading line just below the sticky header. Computed from
// the scroll position rather than an IntersectionObserver band, because a
// menu jump lands the heading at the top of the viewport, outside any
// mid-viewport band, which left the highlight stuck on a section the page
// merely scrolled past.
const navAnchors = [...document.querySelectorAll(".nav-links a")];
const navSections = navAnchors.map(a => document.getElementById(a.hash.slice(1))).filter(Boolean);
navSections.sort((a, b) => (a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING) ? -1 : 1);
function syncActiveLink() {
  const nav = document.querySelector(".site-nav");
  const line = (nav ? nav.offsetHeight : 0) + 40;
  let current = null;
  for (const sec of navSections) {
    if (sec.getBoundingClientRect().top <= line) current = sec;
  }
  // At the very bottom the last section is current even when the page is
  // too short to lift its heading up to the line.
  if (navSections.length && Math.ceil(scrollY + innerHeight) >= document.documentElement.scrollHeight - 2) {
    current = navSections[navSections.length - 1];
  }
  for (const a of navAnchors) {
    const on = !!current && a.hash === "#" + current.id;
    a.classList.toggle("active", on);
    if (on) a.setAttribute("aria-current", "true");
    else a.removeAttribute("aria-current");
  }
}
let spyRaf = 0;
addEventListener("scroll", () => { if (!spyRaf) spyRaf = requestAnimationFrame(() => { spyRaf = 0; syncActiveLink(); }); }, { passive: true });
addEventListener("resize", syncActiveLink, { passive: true });
syncActiveLink();

const toTop = $("to-top");
if (toTop) {
  addEventListener("scroll", () => { toTop.classList.toggle("show", scrollY > 600); }, { passive: true });
  toTop.addEventListener("click", () => scrollTo({ top: 0, behavior: "smooth" }));
}

const scene = document.querySelector(".bg-scene");
if (scene && matchMedia("(pointer: fine)").matches && !matchMedia("(prefers-reduced-motion: reduce)").matches) {
  let rafId = 0;
  addEventListener("mousemove", (e) => {
    if (rafId) return;
    rafId = requestAnimationFrame(() => {
      rafId = 0;
      scene.style.setProperty("--px", (e.clientX / innerWidth - 0.5).toFixed(3));
      scene.style.setProperty("--py", (e.clientY / innerHeight - 0.5).toFixed(3));
    });
  }, { passive: true });
}
if (scene && !matchMedia("(prefers-reduced-motion: reduce)").matches) {
  let scrollRaf = 0;
  const applyScroll = () => { scrollRaf = 0; scene.style.setProperty("--sy", String(scrollY)); };
  addEventListener("scroll", () => { if (!scrollRaf) scrollRaf = requestAnimationFrame(applyScroll); }, { passive: true });
  applyScroll();
}

// The bar is a brand row plus a menu band, and the band wraps on narrow
// screens, so the anchor offset is measured rather than hardcoded.
const siteNav = document.querySelector(".site-nav");
if (siteNav) {
  const setNavHeight = () => document.documentElement.style.setProperty("--nav-h", siteNav.offsetHeight + "px");
  addEventListener("resize", setNavHeight, { passive: true });
  setNavHeight();
}

// Cursor dust: tiny chartreuse sparks trail the pointer and burn out about
// a second after it rests. Everything lives on one fixed canvas: spawning
// is distance-based so speed sets density, the animation loop stops the
// moment the last spark dies, and touch or reduced-motion visitors never
// pay for any of it.
(() => {
  if (!matchMedia("(hover: hover) and (pointer: fine)").matches) return;
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const canvas = document.createElement("canvas");
  canvas.setAttribute("aria-hidden", "true");
  // width/height 100% is load-bearing: a canvas is a replaced element, so
  // inset alone does not stretch it and it would lay out at its intrinsic
  // dpr-scaled size, drawing every spark dpr times too far from the cursor.
  canvas.style.cssText = "position:fixed;inset:0;width:100%;height:100%;z-index:2100;pointer-events:none;";
  document.body.appendChild(canvas);
  const ctx = canvas.getContext("2d");

  let w = 0, h = 0;
  const size = () => {
    const dpr = Math.min(devicePixelRatio || 1, 2);
    w = innerWidth; h = innerHeight;
    canvas.width = w * dpr; canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };
  size();
  addEventListener("resize", size);

  // One pre-rendered glow sprite per theme: drawImage per spark is far
  // cheaper than building a fresh radial gradient every frame.
  const sprite = (core) => {
    const c = document.createElement("canvas");
    c.width = c.height = 64;
    const g = c.getContext("2d");
    const halo = g.createRadialGradient(32, 32, 0, 32, 32, 32);
    halo.addColorStop(0, "rgba(171, 207, 55, 0.55)");
    halo.addColorStop(0.4, "rgba(171, 207, 55, 0.16)");
    halo.addColorStop(1, "rgba(171, 207, 55, 0)");
    g.fillStyle = halo;
    g.fillRect(0, 0, 64, 64);
    g.fillStyle = core;
    g.beginPath();
    g.arc(32, 32, 4.5, 0, 7);
    g.fill();
    return c;
  };
  // The pale core glows against the night theme; light mode gets a deeper
  // green core so the dust stays visible on cream.
  const dust = { dark: sprite("#d7ef7a"), light: sprite("#7e9c26") };

  const sparks = [];
  const MAX = 90;
  let raf = 0, prev = 0, lastX = -1, lastY = -1, carry = 0;

  const spawn = (x, y, dx, dy) => {
    if (sparks.length >= MAX) return;
    const a = Math.random() * Math.PI * 2;
    const push = 4 + Math.random() * 16;
    sparks.push({
      x: x + (Math.random() - 0.5) * 8,
      y: y + (Math.random() - 0.5) * 8,
      vx: Math.cos(a) * push + dx * 1.4,
      vy: Math.sin(a) * push + dy * 1.4,
      life: 0,
      ttl: 0.45 + Math.random() * 0.5,
      r: 5 + Math.random() * 9,
      star: Math.random() < 0.25,
      rot: Math.random() * Math.PI,
      spin: (Math.random() - 0.5) * 4,
      seed: Math.random() * 40
    });
  };

  const star = (R) => {
    ctx.beginPath();
    ctx.moveTo(0, -R);
    ctx.quadraticCurveTo(R * 0.16, -R * 0.16, R, 0);
    ctx.quadraticCurveTo(R * 0.16, R * 0.16, 0, R);
    ctx.quadraticCurveTo(-R * 0.16, R * 0.16, -R, 0);
    ctx.quadraticCurveTo(-R * 0.16, -R * 0.16, 0, -R);
    ctx.fill();
  };

  const tick = (now) => {
    const t = now / 1000;
    const dt = Math.min(0.05, prev ? t - prev : 0.016);
    prev = t;
    ctx.clearRect(0, 0, w, h);
    const light = document.documentElement.dataset.theme === "light";
    const img = light ? dust.light : dust.dark;
    ctx.fillStyle = light ? "#7e9c26" : "#d7ef7a";
    for (let i = sparks.length - 1; i >= 0; i--) {
      const s = sparks[i];
      s.life += dt;
      if (s.life >= s.ttl) { sparks.splice(i, 1); continue; }
      s.x += s.vx * dt;
      s.y += s.vy * dt;
      s.vx *= 0.9;
      s.vy = s.vy * 0.9 + 26 * dt; // the dust settles gently
      const k = 1 - s.life / s.ttl;
      const twinkle = 0.7 + 0.3 * Math.sin(t * 16 + s.seed);
      ctx.globalAlpha = k * k * twinkle;
      const R = s.r * (0.5 + 0.7 * k);
      ctx.drawImage(img, s.x - R, s.y - R, R * 2, R * 2);
      if (s.star) {
        s.rot += s.spin * dt;
        ctx.save();
        ctx.translate(s.x, s.y);
        ctx.rotate(s.rot);
        star(R * 0.9);
        ctx.restore();
      }
    }
    ctx.globalAlpha = 1;
    if (sparks.length) raf = requestAnimationFrame(tick);
    else { raf = 0; prev = 0; ctx.clearRect(0, 0, w, h); }
  };

  addEventListener("pointermove", (e) => {
    if (e.pointerType && e.pointerType !== "mouse") return;
    if (lastX < 0) { lastX = e.clientX; lastY = e.clientY; return; }
    const dx = e.clientX - lastX, dy = e.clientY - lastY;
    lastX = e.clientX; lastY = e.clientY;
    carry += Math.hypot(dx, dy);
    while (carry > 10) {
      carry -= 10;
      spawn(e.clientX, e.clientY, dx, dy);
    }
    if (sparks.length && !raf) raf = requestAnimationFrame(tick);
  }, { passive: true });
})();


// Offline support: a small service worker caches the page shell so the
// tool opens without a connection after the first visit.
if ("serviceWorker" in navigator) {
  addEventListener("load", () => {
    navigator.serviceWorker.register("sw.js").catch(() => { /* offline support is optional */ });
  });
}
