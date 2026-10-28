// Выгружает моменты перелётов (WHOOSH) и появлений иконок (POPS) со страницы — для звуковой дорожки.
import http from 'node:http'; import fs from 'node:fs'; import path from 'node:path'; import { chromium } from 'playwright';
const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const srv = http.createServer((q, r) => { const f = path.join(ROOT, decodeURIComponent(q.url.split('?')[0])); if (!fs.existsSync(f) || fs.statSync(f).isDirectory()) { r.writeHead(404); return r.end(); } r.writeHead(200, { 'Content-Type': f.endsWith('.js') ? 'text/javascript' : f.endsWith('.html') ? 'text/html' : 'application/octet-stream' }); fs.createReadStream(f).pipe(r); });
await new Promise((r) => srv.listen(0, r));
const b = await chromium.launch(); const p = await b.newPage();
await p.goto(`http://127.0.0.1:${srv.address().port}/gta5_new/${process.argv[2] || 'gta5.html'}`);
await p.waitForFunction(() => window.__ready === true, null, { timeout: 60000 });
console.log(JSON.stringify(await p.evaluate(() => ({ whoosh: window.WHOOSH, pops: window.POPS }))));
await b.close(); srv.close();
