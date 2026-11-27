// Выгружает моменты перелётов (WHOOSH) и появлений иконок (POPS) со страницы — для звуковой дорожки.
import http from 'node:http'; import fs from 'node:fs'; import path from 'node:path'; import { chromium } from 'playwright';
const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const srv = http.createServer((q, r) => { const f = path.join(ROOT, decodeURIComponent(q.url.split('?')[0])); if (!fs.existsSync(f) || fs.statSync(f).isDirectory()) { r.writeHead(404); return r.end(); } r.writeHead(200, { 'Content-Type': f.endsWith('.js') ? 'text/javascript' : f.endsWith('.html') ? 'text/html' : 'application/octet-stream' }); fs.createReadStream(f).pipe(r); });
await new Promise((r) => srv.listen(0, r));
const b = await chromium.launch(); const p = await b.newPage(); p.on('pageerror', (e) => console.error('[pageerror]', e.message)); p.on('console', (m) => { if (m.type() === 'error') console.error('[console]', m.text()); });
await p.goto(`http://127.0.0.1:${srv.address().port}/all4/${process.argv[2] || 'all4.html'}`);
await p.waitForFunction(() => window.__ready === true, null, { timeout: 20000 });
console.log(JSON.stringify(await p.evaluate(() => ({ whoosh: window.WHOOSH, pops: window.POPS, missing: window.MISSING || [] }))));
await b.close(); srv.close();
