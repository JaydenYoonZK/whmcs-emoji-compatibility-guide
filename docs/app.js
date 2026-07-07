const $ = (id) => document.getElementById(id);
const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

const sections = $("sections");
const search = $("search");
const count = $("count");
const chipsEl = $("cat-chips");
const toast = $("toast");
let toastTimer;

// Fallback so the board still works if the JSON fails to load.
const FALLBACK = { categories: [
  { name: "Symbols", emoji: [
    { char: "❤️", name: "heavy black heart" }, { char: "⭐️", name: "white medium star" },
    { char: "✅", name: "white heavy check mark" }, { char: "⚠️", name: "warning sign" },
    { char: "☕️", name: "hot beverage" }, { char: "✈️", name: "airplane" }
  ] }
]};

let categories = FALLBACK.categories;
let activeCat = "all";

function normalizeEmoji(list) {
  // Support both the enriched {char,name} shape and the legacy string shape.
  return list.map((e) => (typeof e === "string" ? { char: e, name: "" } : e));
}

function copyEmoji(value) {
  const done = () => {
    toast.textContent = `Copied ${value}`;
    toast.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove("show"), 1300);
  };
  navigator.clipboard.writeText(value).then(done).catch(() => {
    // execCommand fallback for restricted clipboard contexts
    const ta = document.createElement("textarea");
    ta.value = value; document.body.appendChild(ta); ta.select();
    try { document.execCommand("copy"); done(); } catch { /* ignore */ }
    ta.remove();
  });
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

function render() {
  const query = search.value.trim().toLowerCase();
  let total = 0;

  const html = categories.map((category) => {
    if (activeCat !== "all" && category.name !== activeCat) return "";
    const catMatch = category.name.toLowerCase().includes(query);
    const items = normalizeEmoji(category.emoji).filter((e) =>
      !query || catMatch || e.char.includes(query) || (e.name && e.name.includes(query))
    );
    if (!items.length) return "";
    total += items.length;
    return `<section class="emoji-section">
      <h2>${esc(category.name)} <span style="color:var(--ink-mute);font-weight:600">${items.length}</span></h2>
      <div class="emoji-grid">
        ${items.map((e) => `<button class="emoji-btn" type="button" title="${esc(e.name || e.char)}" aria-label="Copy ${esc(e.name || e.char)}" data-emoji="${esc(e.char)}">${e.char}</button>`).join("")}
      </div>
    </section>`;
  }).join("");

  sections.innerHTML = html || `<p class="board-empty">No emoji match “${esc(query)}”. Try a simpler word, or clear the search.</p>`;
  count.textContent = `${total} emoji`;

  for (const btn of sections.querySelectorAll("[data-emoji]")) {
    btn.addEventListener("click", () => copyEmoji(btn.dataset.emoji));
  }
}

async function load() {
  try {
    const res = await fetch("data/emoji.json", { cache: "no-store" });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data.categories) && data.categories.length) categories = data.categories;
    }
  } catch { /* keep fallback */ }
  renderChips();
  render();
}

search.addEventListener("input", render);
load();

if (new URLSearchParams(location.search).has("demo")) {
  search.value = "heart";
  addEventListener("load", () => render());
}

// Shared shell: theme, nav, scroll-to-top, background scene.
const themeToggle = $("theme-toggle");
function syncThemeIcon() { themeToggle.textContent = document.documentElement.dataset.theme === "light" ? "🌙" : "☀️"; }
themeToggle.addEventListener("click", () => {
  const next = document.documentElement.dataset.theme === "light" ? "dark" : "light";
  document.documentElement.dataset.theme = next;
  localStorage.setItem("theme", next);
  syncThemeIcon();
});
syncThemeIcon();

const navAnchors = [...document.querySelectorAll(".nav-links a")];
const navSections = navAnchors.map(a => document.getElementById(a.hash.slice(1))).filter(Boolean);
const sectionSpy = new IntersectionObserver((entries) => {
  for (const entry of entries) {
    if (!entry.isIntersecting) continue;
    for (const a of navAnchors) a.classList.toggle("active", a.hash === "#" + entry.target.id);
  }
}, { rootMargin: "-30% 0px -60% 0px" });
navSections.forEach(sec => sectionSpy.observe(sec));

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
