// Usage:
//   node render.mjs stills 1.2 5.5 ...        -> tmp/still_<t>.jpg (control frames)
//   node render.mjs video [workers]           -> frames/*.jpg + out/video.mp4 with audio
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { chromium } from 'playwright';

const ROOT = path.dirname(new URL(import.meta.url).pathname);
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.json': 'application/json', '.woff': 'font/woff', '.woff2': 'font/woff2', '.png': 'image/png', '.jpg': 'image/jpeg' };
const server = http.createServer((req, res) => {
  let p = decodeURIComponent(req.url.split('?')[0]);
  if (p === '/') p = '/src/index.html';
  const f = path.join(ROOT, p);
  if (!f.startsWith(ROOT) || !fs.existsSync(f)) { res.writeHead(404); return res.end(); }
  res.writeHead(200, { 'Content-Type': TYPES[path.extname(f)] || 'application/octet-stream' });
  fs.createReadStream(f).pipe(res);
});
await new Promise((r) => server.listen(0, r));
const PROJ = process.env.PROJECT || '1';
const AUDIO = process.env.AUDIO || 'audio.mp3';
const OUT = process.env.OUT || 'gameboy_1991.mp4';
const FRAMES = process.env.FRAMES || 'frames';
const URL_ = `http://127.0.0.1:${server.address().port}/?p=${PROJ}`;

const ARGS = ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--disable-gpu-vsync', '--js-flags=--max-old-space-size=4096'];

async function openPage(browser) {
  const page = await browser.newPage({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 });
  page.on('console', (m) => { if (m.type() === 'error' || m.type() === 'warning') console.log('[page]', m.text()); });
  page.on('pageerror', (e) => console.log('[pageerror]', e.message));
  await page.goto(URL_);
  await page.waitForFunction(() => window.__ready === true, null, { timeout: 60000 });
  const info = await page.evaluate(() => window.__init());
  return { page, info };
}
const save = (b64, file) => fs.writeFileSync(file, Buffer.from(b64.split(',')[1], 'base64'));

const mode = process.argv[2] || 'stills';
if (mode === 'stills') {
  const browser = await chromium.launch({ args: ARGS });
  const { page, info } = await openPage(browser);
  fs.mkdirSync(path.join(ROOT, 'tmp'), { recursive: true });
  const times = process.argv.slice(3).filter((a) => !a.startsWith('--')).map(Number);
  for (const t of times) {
    const t0 = Date.now();
    const b64 = await page.evaluate((tt) => window.__time(tt, 0.92), t);
    save(b64, path.join(ROOT, 'tmp', `still${PROJ === '1' ? '' : PROJ}_${t.toFixed(2)}.jpg`));
    console.log(`t=${t} ${(Date.now() - t0)}ms`);
  }
  if (process.argv.includes('--chunks')) console.log(await page.evaluate(() => window.__chunks()));
  console.log(JSON.stringify(info.shots));
  await browser.close();
} else if (mode === 'overlaps') {
  // sample every 0.2 s (or the given range) and print interpenetrating pairs per shot
  const browser = await chromium.launch({ args: ARGS });
  const { page, info } = await openPage(browser);
  const a = Number(process.argv[3] || 0), b = Number(process.argv[4] || info.duration);
  const seen = new Map();
  for (let t = a; t < b; t += 0.2) {
    const [id, res] = await page.evaluate((tt) => window.__overlaps(tt), t);
    for (const r of res) { const k = id + ': ' + r.replace(/ \(.*\)$/, ''); const v = seen.get(k) || { first: t, last: t, max: r }; v.last = t; if (parseInt(r.match(/\((\d+)cm\)/)[1]) > parseInt(v.max.match(/\((\d+)cm\)/)[1])) v.max = r; seen.set(k, v); }
  }
  if (!seen.size) console.log('NO OVERLAPS');
  for (const [k, v] of seen) console.log(`${k}  t=${v.first.toFixed(1)}–${v.last.toFixed(1)}  max ${v.max.match(/\(.*\)/)[0]}`);
  await browser.close();
} else if (mode === 'video') {
  const workers = Number(process.argv[3] || 2);
  const dir = path.join(ROOT, FRAMES); fs.mkdirSync(dir, { recursive: true });
  const browser0 = await chromium.launch({ args: ARGS });
  const { info } = await openPage(browser0); await browser0.close();
  const audioDur = Number(execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', path.join(ROOT, AUDIO)]).toString());
  const total = Math.ceil(audioDur * 30);
  console.log('frames', total, 'shots end', info.duration);
  const todo = []; for (let f = 0; f < total; f++) if (!fs.existsSync(path.join(dir, `f${String(f).padStart(5, '0')}.jpg`))) todo.push(f);
  const t0 = Date.now(); let done = 0;
  await Promise.all(Array.from({ length: workers }, async (_, w) => {
    const browser = await chromium.launch({ args: ARGS });
    const { page } = await openPage(browser);
    // contiguous block per worker keeps scene builds local
    const per = Math.ceil(todo.length / workers);
    for (const f of todo.slice(w * per, (w + 1) * per)) {
      const b64 = await page.evaluate((ff) => window.__frame(ff, 0.96), f);
      save(b64, path.join(dir, `f${String(f).padStart(5, '0')}.jpg`));
      done++;
      if (done % 30 === 0) { const el = (Date.now() - t0) / 1000; console.log(`${done}/${todo.length}  ${el.toFixed(0)}s  eta ${(el / done * (todo.length - done)).toFixed(0)}s`); }
    }
    await browser.close();
  }));
  fs.mkdirSync(path.join(ROOT, 'out'), { recursive: true });
  execFileSync('ffmpeg', ['-y', '-v', 'error', '-framerate', '30', '-i', path.join(dir, 'f%05d.jpg'), '-i', path.join(ROOT, AUDIO),
    '-c:v', 'libx264', '-preset', 'slow', '-crf', '17', '-pix_fmt', 'yuv420p', '-profile:v', 'high', '-movflags', '+faststart',
    '-c:a', 'aac', '-b:a', '192k', '-shortest', path.join(ROOT, 'out', OUT)], { stdio: 'inherit' });
  console.log('done', ((Date.now() - t0) / 1000).toFixed(0), 's');
}
server.close();
