/* ---------- App Version Config ---------- */
/* Update this single variable when you release a new version! */
const APP_VERSION = "2.0.0";

/* ---------- Download links ---------- */
const DOWNLOADS = {
  android: "downloads/app-release.apk",
  windows: "#download",
  source:  "#"
};

document.querySelectorAll("[data-dl]").forEach(a => {
  const url = DOWNLOADS[a.dataset.dl];
  if (url) {
    a.href = url;
    if (a.dataset.dl === "android") {
      a.download = `verso-v${APP_VERSION}.apk`;
    }
  }
});

const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const safeGet = k => { try { return localStorage.getItem(k); } catch { return null; } };
const safeSet = (k, v) => { try { localStorage.setItem(k, v); } catch {} };

/* ---------- Hero: field of chapters that fill in ---------- */
const field = document.getElementById("field");
function buildField() {
  field.innerHTML = "";
  const size = 34;
  const cols = Math.max(12, Math.floor(window.innerWidth / size));
  const rows = Math.max(8, Math.floor(window.innerHeight / size));
  field.style.setProperty("--cols", cols);
  const frag = document.createDocumentFragment();
  const cells = [];
  for (let i = 0; i < cols * rows; i++) {
    const c = document.createElement("i");
    frag.appendChild(c);
    cells.push(c);
  }
  field.appendChild(frag);
  fillField(cells, cols);
}
let fieldTimer;
function fillField(cells, cols) {
  clearInterval(fieldTimer);
  const order = cells.map((_, i) => i);
  // fill in reading order with a little jitter, like working through a book
  order.sort((a, b) => (a + Math.random() * cols * 2) - (b + Math.random() * cols * 2));
  const target = Math.floor(cells.length * 0.34);
  if (reduced) { order.slice(0, target).forEach(i => cells[i].classList.add("on")); return; }
  let n = 0;
  fieldTimer = setInterval(() => {
    for (let k = 0; k < 3 && n < target; k++, n++) cells[order[n]].classList.add("on");
    if (n >= target) clearInterval(fieldTimer);
  }, 40);
}
buildField();
let resizeT;
window.addEventListener("resize", () => { clearTimeout(resizeT); resizeT = setTimeout(buildField, 250); });

/* ---------- Phone: ring, bars, mini grid ---------- */
const phGrid = document.getElementById("phGrid");
for (let i = 0; i < 40; i++) {
  const c = document.createElement("i");
  if (i < 14) c.style.transitionDelay = `${1 + i * 0.05}s`;
  phGrid.appendChild(c);
}
requestAnimationFrame(() => {
  document.getElementById("ring").classList.add("go");
  document.querySelector(".ph-bars").classList.add("go");
  [...phGrid.children].slice(0, 14).forEach(c => c.classList.add("on"));
});

/* ---------- Count-up numbers ---------- */
function countUp(el) {
  const to = +el.dataset.count;
  const suffix = el.dataset.suffix || "";
  if (reduced) { el.textContent = to + suffix; return; }
  const start = performance.now(), dur = 1600;
  const tick = now => {
    const t = Math.min(1, (now - start) / dur);
    el.textContent = Math.round(to * (1 - Math.pow(1 - t, 3))) + suffix;
    if (t < 1) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}
document.querySelectorAll(".phone [data-count]").forEach(el => setTimeout(() => countUp(el), 700));

const io = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (!e.isIntersecting) return;
    const el = e.target;
    if (el.dataset.count) countUp(el);
    if (el.classList.contains("bars")) el.classList.add("go");
    io.unobserve(el);
  });
}, { threshold: 0.4 });
document.querySelectorAll(".t-streak [data-count], .bars").forEach(el => io.observe(el));

/* ---------- Genesis try-it ---------- */
const chapters = document.getElementById("chapters");
const readCount = document.getElementById("readCount");
const KEY = "verso-demo-genesis";
let saved = [];
try { saved = JSON.parse(safeGet(KEY) || "[]"); } catch { saved = []; }
for (let n = 1; n <= 50; n++) {
  const b = document.createElement("button");
  b.type = "button";
  b.textContent = n;
  b.setAttribute("aria-label", `Genesis chapter ${n}`);
  b.setAttribute("aria-pressed", saved.includes(n) ? "true" : "false");
  b.addEventListener("click", () => {
    b.setAttribute("aria-pressed", b.getAttribute("aria-pressed") === "true" ? "false" : "true");
    update();
  });
  chapters.appendChild(b);
}
function update() {
  const on = [...chapters.children].filter(b => b.getAttribute("aria-pressed") === "true");
  readCount.textContent = on.length;
  safeSet(KEY, JSON.stringify(on.map(b => +b.textContent)));
}
document.getElementById("resetChapters").addEventListener("click", () => {
  [...chapters.children].forEach(b => b.setAttribute("aria-pressed", "false"));
  update();
});
update();

/* ---------- Theme switch ---------- */
const sw = document.getElementById("themeSwitch");
function setTheme(light) {
  document.documentElement.dataset.theme = light ? "light" : "dark";
  sw.setAttribute("aria-checked", String(light));
  safeSet("verso-theme", light ? "light" : "dark");
}
setTheme(safeGet("verso-theme") === "light");
sw.addEventListener("click", () => setTheme(sw.getAttribute("aria-checked") !== "true"));

document.getElementById("year").textContent = new Date().getFullYear();
