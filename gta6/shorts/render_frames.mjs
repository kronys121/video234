// Рендер кадров монтажа (gta6/v/index.html) для шорта: кадр f шорта -> время озвучки по сегментам.
//   node gta6/shorts/render_frames.mjs <workers>   (из корня репо) -> gta6/shorts/frames/f00000.jpg
import http from 'node:http'; import fs from 'node:fs'; import path from 'node:path'; import { chromium } from 'playwright';
const HERE = path.dirname(new URL(import.meta.url).pathname); const ROOT = path.resolve(HERE, '../..');
const SEGS = [[0.0, 21.55], [242.9, 280.76]]; const FPS = 60;
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.woff2': 'font/woff2', '.ttf': 'font/ttf', '.png': 'image/png', '.jpg': 'image/jpeg', '.json': 'application/json' };
const server = http.createServer((req, res) => { const f = path.join(ROOT, decodeURIComponent(req.url.split('?')[0]));
  if (!f.startsWith(ROOT) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); return res.end(); }
  res.writeHead(200, { 'Content-Type': TYPES[path.extname(f)] || 'application/octet-stream' }); fs.createReadStream(f).pipe(res); });
await new Promise((r) => server.listen(0, r));
const URL_ = `http://127.0.0.1:${server.address().port}/gta6/v/index.html`;
const ARGS = ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'];
const times = []; for (const [a, b] of SEGS) { const n = Math.round((b - a) * FPS); for (let i = 0; i < n; i++) times.push(a + i / FPS); }
const dir = path.join(HERE, 'frames'); fs.mkdirSync(dir, { recursive: true });
const name = (f) => path.join(dir, `f${String(f).padStart(5, '0')}.jpg`);
const todo = times.map((_, i) => i).filter((i) => !fs.existsSync(name(i)));
console.log('frames', times.length, 'todo', todo.length);
const W = Number(process.argv[2] || 4); let done = 0; const t0 = Date.now();
await Promise.all(Array.from({ length: W }, async (_, w) => {
  const b = await chromium.launch({ args: ARGS }); const p = await b.newPage({ viewport: { width: 1920, height: 1080 } });
  p.on('pageerror', (e) => console.log('[pageerror]', e.message));
  await p.goto(URL_); await p.waitForFunction(() => window.__ready === true, null, { timeout: 120000 });
  for (let k = w; k < todo.length; k += W) { const f = todo[k];
    await p.evaluate((t) => window.renderAt(t), times[f]); await p.screenshot({ path: name(f), type: 'jpeg', quality: 92 });
    if (++done % 120 === 0) { const el = (Date.now() - t0) / 1000; console.log(`${done}/${todo.length} eta ${(el / done * (todo.length - done)).toFixed(0)}s`); } }
  await b.close(); }));
server.close(); console.log('done');
