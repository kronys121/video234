// прозрачные кадры оверлея концовки интеграции (60 к/с; время — от начала файла интеграции)
import http from 'node:http'; import fs from 'node:fs'; import path from 'node:path'; import { chromium } from 'playwright';
const HERE = path.dirname(new URL(import.meta.url).pathname), ROOT = path.resolve(HERE, '../../..');
const OUT = path.join(HERE, 'frames'); fs.rmSync(OUT, { recursive: true, force: true }); fs.mkdirSync(OUT, { recursive: true });
const T = { '.html': 'text/html', '.woff2': 'font/woff2' };
const srv = http.createServer((q, r) => { const f = path.join(ROOT, decodeURIComponent(q.url.split('?')[0])); if (!fs.existsSync(f)) { r.writeHead(404); return r.end(); } r.writeHead(200, { 'Content-Type': T[path.extname(f)] || 'application/octet-stream' }); fs.createReadStream(f).pipe(r); });
await new Promise((r) => srv.listen(0, r));
const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1920, height: 1080 } });
await p.goto(`http://127.0.0.1:${srv.address().port}/gta_sa/ad/end/overlay.html`); await p.evaluate(() => window.ready);
const T0 = Number(process.argv[2] || 37.068), T1 = Number(process.argv[3] || 42.008); let i = 0;
for (let t = T0; t < T1 - 1e-6; t += 1 / 60) { await p.evaluate((tt) => window.renderAt(tt), t); await p.screenshot({ path: path.join(OUT, `o${String(i++).padStart(4, '0')}.png`), omitBackground: true }); }
console.log('frames', i); await b.close(); srv.close();
