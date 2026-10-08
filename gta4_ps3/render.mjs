// Usage (from repo root):
//   node gta4_ps3/render.mjs stills 1.2 5.5 ...   -> gta4_ps3/tmp/still_<t>.jpg
//   node gta4_ps3/render.mjs video [workers] [end] -> gta4_ps3/frames/*.jpg + gta4_ps3/out/gta4_ps3.mp4
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { chromium } from 'playwright';

const HERE = path.dirname(new URL(import.meta.url).pathname);
const ROOT = path.dirname(HERE);
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript', '.json': 'application/json', '.woff2': 'font/woff2', '.png': 'image/png', '.jpg': 'image/jpeg' };
const server = http.createServer((req, res) => {
  const p = decodeURIComponent(req.url.split('?')[0]);
  const f = path.join(ROOT, p);
  if (!f.startsWith(ROOT) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); return res.end(); }
  res.writeHead(200, { 'Content-Type': TYPES[path.extname(f)] || 'application/octet-stream' });
  fs.createReadStream(f).pipe(res);
});
await new Promise((r) => server.listen(0, r));
const URL_ = `http://127.0.0.1:${server.address().port}/gta4_ps3/${process.env.PAGE || 'video.html'}`;
const ARGS = ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--js-flags=--max-old-space-size=4096'];

async function openPage(browser) {
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 });
  page.on('console', (m) => { if (m.type() === 'error' || m.type() === 'warning') console.log('[page]', m.text()); });
  page.on('pageerror', (e) => console.log('[pageerror]', e.message));
  await page.goto(URL_);
  await page.waitForFunction(() => window.__ready === true, null, { timeout: 60000 });
  return page;
}
async function shot(page, t, file) {
  await page.evaluate((tt) => window.renderAt(tt), t);
  await page.screenshot({ path: file, type: 'jpeg', quality: 93 });
}

const mode = process.argv[2] || 'stills';
if (mode === 'stills') {
  const browser = await chromium.launch({ args: ARGS });
  const page = await openPage(browser);
  fs.mkdirSync(path.join(HERE, 'tmp'), { recursive: true });
  for (const t of process.argv.slice(3).map(Number)) {
    const t0 = Date.now();
    await shot(page, t, path.join(HERE, 'tmp', `still_${t.toFixed(2)}.jpg`));
    console.log(`t=${t} ${Date.now() - t0}ms`);
  }
  await browser.close();
} else if (mode === 'video') {
  const workers = Number(process.argv[3] || 3);
  const browser0 = await chromium.launch({ args: ARGS });
  const p0 = await openPage(browser0);
  const dur = Number(process.argv[4] || (await p0.evaluate(() => window.DUR)));
  await browser0.close();
  const dir = path.join(HERE, 'frames'); fs.mkdirSync(dir, { recursive: true });
  const total = Math.round(dur * 30);
  const name = (f) => path.join(dir, `f${String(f).padStart(5, '0')}.jpg`);
  const todo = []; for (let f = 0; f < total; f++) if (!fs.existsSync(name(f))) todo.push(f);
  console.log('frames', total, 'todo', todo.length);
  const t0 = Date.now(); let done = 0;
  await Promise.all(Array.from({ length: workers }, async (_, w) => {
    const browser = await chromium.launch({ args: ARGS });
    const page = await openPage(browser);
    const per = Math.ceil(todo.length / workers);
    for (const f of todo.slice(w * per, (w + 1) * per)) {
      await shot(page, f / 30, name(f));
      if (++done % 60 === 0) { const el = (Date.now() - t0) / 1000; console.log(`${done}/${todo.length} ${el.toFixed(0)}s eta ${(el / done * (todo.length - done)).toFixed(0)}s`); }
    }
    await browser.close();
  }));
  fs.mkdirSync(path.join(HERE, 'out'), { recursive: true });
  execFileSync('ffmpeg', ['-y', '-v', 'error', '-framerate', '30', '-i', path.join(dir, 'f%05d.jpg'), '-i', path.join(HERE, 'audio.mp3'),
    '-t', String(dur), '-c:v', 'libx264', '-preset', 'slow', '-crf', '20', '-maxrate', '12M', '-bufsize', '24M', '-pix_fmt', 'yuv420p', '-profile:v', 'high', '-movflags', '+faststart',
    '-af', `afade=t=out:st=${(dur - 0.25).toFixed(2)}:d=0.25`, '-c:a', 'aac', '-b:a', '192k', path.join(HERE, 'out', process.env.OUT || 'gta4_ps3.mp4')], { stdio: 'inherit' });
  console.log('done', ((Date.now() - t0) / 1000).toFixed(0), 's');
}
server.close();
