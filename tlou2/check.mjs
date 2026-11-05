// проверка: наложения текста на клипы и поздние элементы
import http from 'node:http'; import fs from 'node:fs'; import path from 'node:path'; import { chromium } from 'playwright';
const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const srv = http.createServer((q, r) => { const f = path.join(ROOT, decodeURIComponent(q.url.split('?')[0])); if (!fs.existsSync(f) || fs.statSync(f).isDirectory()) { r.writeHead(404); return r.end(); } r.writeHead(200, { 'Content-Type': f.endsWith('.js') ? 'text/javascript' : f.endsWith('.html') ? 'text/html' : 'application/octet-stream' }); fs.createReadStream(f).pipe(r); });
await new Promise((r) => srv.listen(0, r));
const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1920, height: 1080 } }); p.on('pageerror', (e) => console.error('[pageerror]', e.message));
await p.goto(`http://127.0.0.1:${srv.address().port}/tlou2/tlou2.html`);
await p.waitForFunction(() => window.__ready === true, null, { timeout: 30000 });
const info = await p.evaluate(() => ({ missing: window.MISSING || [], wl: window.WL, bts: window.BTS }));
const out = [];
for (let i = 0; i < info.bts.length; i++) {
  const t = (info.bts[i + 1] ?? 519.4) - 0.05;
  await p.evaluate((tt) => window.renderAt(tt), t);
  const ov = await p.evaluate(() => {
    const res = []; for (const vis of document.querySelectorAll('#world > div')) {
    const els = [...vis.children].filter((c) => +getComputedStyle(c).opacity > 0.5);
    const cards = els.filter((c) => c.classList.contains('card')), others = els.filter((c) => !c.classList.contains('card') && !c.style.zIndex);
    for (const o of others) { const a = o.getBoundingClientRect(); for (const c of cards) { const r = c.getBoundingClientRect(); const ix = Math.max(0, Math.min(a.right, r.right) - Math.max(a.left, r.left)), iy = Math.max(0, Math.min(a.bottom, r.bottom) - Math.max(a.top, r.top)); if (ix * iy > 0.06 * a.width * a.height && ix > 20 && iy > 20) res.push((o.textContent || o.tagName).trim().slice(0, 30) + ` ${Math.round(ix)}x${Math.round(iy)}`); } } }
    return res;
  });
  if (ov.length) out.push([info.bts[i], ov]);
}
console.log(JSON.stringify({ missing: info.missing, overlaps: out, clamped: info.wl.filter((x) => x[2] < x[3] - 0.01).length }, null, 0));
await b.close(); srv.close();
