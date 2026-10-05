// usage: node render.mjs <outDir> t=<sec,sec,...>          quick preview frames
//        node render.mjs <outDir> <worker> <workers> [fps]  a contiguous slice of the whole film
import http from 'http';import fs from 'fs';import path from 'path';
import {chromium} from 'playwright-core';
const [,, outDir, a, b, fpsArg] = process.argv;
const FPS = +(fpsArg || 24), ROOT = path.dirname(new URL(import.meta.url).pathname);
const types = {'.html':'text/html','.js':'text/javascript','.mjs':'text/javascript','.woff2':'font/woff2','.css':'text/css'};
const server = http.createServer((req, res) => {
  const p = path.join(ROOT, decodeURIComponent(req.url.split('?')[0]));
  fs.readFile(p, (e, d) => { if (e) { res.writeHead(404); res.end(); return; }
    res.writeHead(200, {'content-type': types[path.extname(p)] || 'application/octet-stream'}); res.end(d); });
}).listen(0);
const port = server.address().port;
const browser = await chromium.launch({
  executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
  args: ['--no-sandbox', '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'],
});
const page = await browser.newPage({viewport: {width: 1280, height: 720}});
page.on('console', m => { const t = m.text(); if (!t.includes('404')) console.log('[page]', t); });
page.on('pageerror', e => console.log('[pageerror]', e.message));
await page.goto(`http://localhost:${port}/index.html?part=${process.env.PART||'full'}&cam=${process.env.CAM||''}`);
await page.waitForFunction('window.__ready===true', null, {timeout: 900000});
fs.mkdirSync(outDir, {recursive: true});
const dur = await page.evaluate(() => window.__dur);
let jobs = [];
if (a && a.startsWith('t=')) jobs = a.slice(2).split(',').map(Number).map(t => [t, `t${t}.jpg`]);
else { const w = +a, W = +b, N = Math.round(dur * FPS), s = Math.floor(N * w / W), e = Math.floor(N * (w + 1) / W);
  for (let f = s; f < e; f++) jobs.push([f / FPS, `${String(f).padStart(5, '0')}.jpg`]); }
const t0 = Date.now();
for (let i = 0; i < jobs.length; i++) {
  const [t, name] = jobs[i];
  await page.evaluate(t => window.renderFrame(t), t);
  await page.screenshot({path: path.join(outDir, name), type: 'jpeg', quality: 93});
  if (jobs.length > 20 && i % 25 === 0) console.log(`${name} ${i}/${jobs.length} ${((Date.now() - t0) / 1000).toFixed(0)}s`);
}
await browser.close();server.close();
