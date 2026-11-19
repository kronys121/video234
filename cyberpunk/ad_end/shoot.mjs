// прозрачные кадры оверлея концовки рекламы (время — от начала рекламного ролика)
import http from 'node:http'; import fs from 'node:fs'; import path from 'node:path'; import { chromium } from 'playwright';
const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '../..');
const OUT = path.join(path.dirname(new URL(import.meta.url).pathname), 'frames'); fs.mkdirSync(OUT, { recursive: true });
const T = { '.html': 'text/html', '.woff2': 'font/woff2' };
const srv = http.createServer((q, r) => { const f = path.join(ROOT, decodeURIComponent(q.url.split('?')[0])); if (!fs.existsSync(f)) { r.writeHead(404); return r.end(); } r.writeHead(200, { 'Content-Type': T[path.extname(f)] || 'application/octet-stream' }); fs.createReadStream(f).pipe(r); });
await new Promise((r) => srv.listen(0, r));
const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1920, height: 1080 } });
await p.goto(`http://127.0.0.1:${srv.address().port}/cyberpunk/ad_end/overlay.html`); await p.evaluate(() => window.ready);
const T0 = 32.5, T1 = 36.014; let i = 0;
for (let t = T0; t < T1; t += 1 / 30) { await p.evaluate((tt) => window.renderAt(tt), t); await p.screenshot({ path: path.join(OUT, `o${String(i++).padStart(4, '0')}.png`), omitBackground: true }); }
console.log('frames', i); await b.close(); srv.close();
