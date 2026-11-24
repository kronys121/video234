// Кадрирование шорта 9:16: для каждой сцены монтажа (gta6/v) находит границы всех видимых элементов
// и подбирает масштаб и центр, чтобы всё помещалось в окно монтажа шорта (1080 x WIN_H) с запасом.
// Затем проверяет каждый кадр (шаг 0,1 с): ни один элемент не выходит за окно.
//   node gta6/shorts/framing.mjs <data.json>   (из корня репо; дописывает в json поле cams)
import http from 'node:http'; import fs from 'node:fs'; import path from 'node:path'; import { chromium } from 'playwright';
const HERE = path.dirname(new URL(import.meta.url).pathname); const ROOT = path.resolve(HERE, '../..');
const file = process.argv[2]; const D = JSON.parse(fs.readFileSync(file, 'utf8'));
const PAGE = process.argv[3] || '/gta6/v/index.html'; const SA = !PAGE.includes('/gta6/');   // движок GTA 6 (сцены SCENES) или движок v2 GTA SA / TLOU2 (биты SA_BEATS)
const WIN_W = 1080, WIN_H = 900, MX = 28, MY = 64, SMAX = 1.0;   // MY — с учётом мягкого затухания краёв окна сверху/снизу
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.woff2': 'font/woff2', '.ttf': 'font/ttf', '.png': 'image/png', '.jpg': 'image/jpeg' };
const srv = http.createServer((q, r) => { const f = path.join(ROOT, decodeURIComponent(q.url.split('?')[0])); if (!f.startsWith(ROOT) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { r.writeHead(404); return r.end(); } r.writeHead(200, { 'Content-Type': TYPES[path.extname(f)] || 'application/octet-stream' }); fs.createReadStream(f).pipe(r); });
await new Promise((r) => srv.listen(0, r));
const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1920, height: 1080 } });
await p.route('**/clips/**', (r) => r.abort());
await p.goto(`http://127.0.0.1:${srv.address().port}${PAGE}`);
await p.waitForFunction(() => window.__ready === true, null, { timeout: 240000 });
const times = []; for (const [a, z] of D.segs) for (let t = a; t < z; t += 0.05) times.push(+t.toFixed(3));
const samples = await p.evaluate(async ([times, SA]) => {
  const out = [];
  const rectOf = (it) => {
    if (it.kind === 'arrow') return it.path.getBoundingClientRect();
    if (it.kind === 'txt' && it.words) { const ws = it.words.map((w) => w.parentNode.getBoundingClientRect()); return { left: Math.min(...ws.map((w) => w.left)), right: Math.max(...ws.map((w) => w.right)), top: Math.min(...ws.map((w) => w.top)), bottom: Math.max(...ws.map((w) => w.bottom)) }; }
    return it.el.getBoundingClientRect();
  };
  for (const t of times) {
    await window.renderAt(t);
    const rects = [];
    if (SA) {
      const B = window.SA_BEATS; let cur = 0; B.forEach((b, i) => { if (t >= b.t0) cur = i; });
      for (const it of B[cur].items) {
        if (!it.el) continue; const op = it.el.style.opacity === '' ? 1 : +it.el.style.opacity; if (op < 0.05) continue;
        const r = it.el.getBoundingClientRect(); if (r.right - r.left < 2) continue;
        rects.push({ si: cur, k: it.el.className || it.el.tagName, n: (it.el.textContent || it.el.src || '').slice(0, 30), l: r.left, r: r.right, t: r.top, b: r.bottom, o: op });
      }
    } else {
      window.SCENES.forEach((s, si) => {
        if (s.el.style.display === 'none') return;
        for (const it of s.items) {
          if (!it.el || it.el.style.display === 'none' || +(it.el.style.opacity || 1) < 0.05) continue;
          const r = rectOf(it); if (r.right - r.left < 2) continue;
          rects.push({ si, k: it.kind, n: String(it.text || it.src || it.clip || it.ch || it.kind).slice(0, 30), l: r.left, r: r.right, t: r.top, b: r.bottom, o: +(it.el.style.opacity || 1) });
        }
      });
    }
    out.push({ t, rects });
  }
  return out;
}, [times, SA]);
const scenes = await p.evaluate((SA) => SA ? window.SA_BEATS.map((b, i, B) => [b.t0, i + 1 < B.length ? B[i + 1].t0 : window.DUR]) : window.SCENES.map((s) => [s.t0, s.t1]), SA);
await b.close(); srv.close();
// границы по сценам
const box = {};
for (const s of samples) for (const r of s.rects) { const q = box[r.si] ||= { l: 1e9, r: -1e9, t: 1e9, b: -1e9 }; q.l = Math.min(q.l, r.l); q.r = Math.max(q.r, r.r); q.t = Math.min(q.t, r.t); q.b = Math.max(q.b, r.b); }
const SMIN = WIN_W / 1920;                                   // кадр монтажа всегда закрывает всю ширину окна
const clamp = (v, a, b) => Math.min(Math.max(v, a), b);
const cams = Object.entries(box).map(([si, q]) => {
  const bw = q.r - q.l, bh = q.b - q.t;
  const s = clamp(Math.min(SMAX, (WIN_W - 2 * MX) / bw, (WIN_H - 2 * MY) / bh), SMIN, SMAX);
  const h = Math.min(WIN_H, 1080 * s);                       // окно не выше самого кадра — без пустых полос
  // центр: сначала держим окно внутри кадра монтажа, потом (главное) — весь контент внутри окна с отступами
  let cx = clamp((q.l + q.r) / 2, WIN_W / 2 / s, 1920 - WIN_W / 2 / s);
  const cxa = q.r - (WIN_W / 2 - MX) / s, cxb = q.l + (WIN_W / 2 - MX) / s; if (cxa <= cxb) cx = clamp(cx, cxa, cxb);
  let cy = h >= 1080 * s - 0.5 ? 540 : clamp((q.t + q.b) / 2, h / 2 / s, 1080 - h / 2 / s);
  const cya = q.b - (h / 2 - MY) / s, cyb = q.t + (h / 2 - MY) / s; if (cya <= cyb) cy = clamp(cy, cya, cyb);
  return { si: +si, t0: scenes[si][0], t1: scenes[si][1], s: +s.toFixed(4), h: Math.round(h), cx: +cx.toFixed(1), cy: +cy.toFixed(1) };
}).sort((a, b) => a.t0 - b.t0);
// проверка: каждый видимый элемент в каждом кадре внутри окна (кроме мгновений смены сцен)
const camOf = (si) => cams.find((c) => c.si === si);
let bad = 0;
for (const s of samples) for (const r of s.rects) {
  if (r.o < 0.95) continue;                                   // элемент ещё появляется/уходит
  const OUT = r.l < 40 || r.r > 1880 || r.t < 40 || r.b > 1040; if (OUT) continue;   // и в горизонтальном ролике стоит у края или выходит за кадр (ноги вырезок и т.п.)
  const c = camOf(r.si); const X = (x) => (x - c.cx) * c.s + WIN_W / 2, Y = (y) => (y - c.cy) * c.s + c.h / 2;
  if (X(r.l) < 8 || X(r.r) > WIN_W - 8 || Y(r.t) < 22 || Y(r.b) > c.h - 22) { if (bad++ < 20) console.log('ЗА ОКНОМ', s.t, r.k, r.n, [X(r.l), Y(r.t), X(r.r), Y(r.b)].map(Math.round)); }
}
D.cams = cams; D.win = { w: WIN_W, h: WIN_H }; D.page = SA ? 'site' + PAGE : 'site/gta6/index.html';
fs.writeFileSync(file, JSON.stringify(D));
console.log(path.basename(file), 'сцен', cams.length, 'масштаб', Math.min(...cams.map((c) => c.s)).toFixed(2), '…', Math.max(...cams.map((c) => c.s)).toFixed(2), 'вне окна:', bad);
