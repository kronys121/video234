// проверка страницы: ошибки, не найденные слова, наложения не проверяем
import http from 'node:http'; import fs from 'node:fs'; import path from 'node:path'; import { chromium } from 'playwright';
const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const T = { '.html': 'text/html', '.js': 'text/javascript', '.json': 'application/json', '.woff2': 'font/woff2', '.png': 'image/png', '.jpg': 'image/jpeg' };
const srv = http.createServer((q, r) => { const f = path.join(ROOT, decodeURIComponent(q.url.split('?')[0])); if (!fs.existsSync(f) || fs.statSync(f).isDirectory()) { console.log('404', q.url); r.writeHead(404); return r.end(); } r.writeHead(200, { 'Content-Type': T[path.extname(f)] || 'application/octet-stream' }); fs.createReadStream(f).pipe(r); });
await new Promise((r) => srv.listen(0, r));
const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1920, height: 1080 } });
p.on('pageerror', (e) => console.log('PAGEERROR', e.message));
await p.goto(`http://127.0.0.1:${srv.address().port}/gta_sa/gta_sa.html`);
await p.waitForFunction(() => window.__ready === true, null, { timeout: 120000 });
console.log(JSON.stringify(await p.evaluate(() => ({ missing: window.MISSING || [], clamped: (window.WL || []).filter(([t, p, r, r0]) => r < r0 - 0.01).map(([t, p, r, r0]) => `${p}@${t}: ${r0.toFixed(1)}→${r.toFixed(1)}`) })), null, 1));
await b.close(); srv.close();
