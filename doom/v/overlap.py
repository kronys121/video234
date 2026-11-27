# Проверка вёрстки по всему ролику: тексты не наезжают друг на друга и на картинки/карточки,
# ничего не вылезает за кадр. Шаг 0,1 с.  python3 overlap.py [от до]
import json, subprocess, sys, os
HERE = os.path.dirname(os.path.abspath(__file__))
a, b = (float(sys.argv[1]), float(sys.argv[2])) if len(sys.argv) > 2 else (0, None)
js = r"""
const { chromium } = require('playwright');
(async () => {
  const [dir, A, B] = process.argv.slice(2);
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1920, height: 1080 } });
  await p.route('**/clips/**', r => r.abort());
  await p.goto('file://' + dir + '/index.html');
  await p.waitForFunction(() => window.__ready === true, null, { timeout: 60000 });
  const out = await p.evaluate(async ([A, B]) => {
    const res = []; const end = B === 'None' ? window.DUR : +B;
    const ov = (r, q, m) => Math.min(r.right, q.right) - Math.max(r.left, q.left) > m && Math.min(r.bottom, q.bottom) - Math.max(r.top, q.top) > m;
    for (let t = +A; t < end; t += 0.1) {
      await window.renderAt(t);
      const vis = [];
      for (const s of window.SCENES) {
        if (s.el.style.display === 'none' || +s.el.style.opacity < 0.9) continue;
        for (const it of s.items) {
          if (!it.el || it.el.style.display === 'none' || +(it.el.style.opacity || 1) < 0.85) continue;
          if (['arrow', 'ring', 'x', 'check'].includes(it.kind)) continue;
          const r = it.el.getBoundingClientRect();
          // текст: прямоугольник по фактическим словам
          let rr = r;
          if (it.kind === 'txt' && it.words) { const ws = it.words.map(w => w.parentNode.getBoundingClientRect()); rr = { left: Math.min(...ws.map(w => w.left)), right: Math.max(...ws.map(w => w.right)), top: Math.min(...ws.map(w => w.top)), bottom: Math.max(...ws.map(w => w.bottom)) }; }
          vis.push({ k: it.kind, name: it.text || it.src || it.clip || it.ch || it.kind, r: rr, t0: s.t0, ign: it.noov });
        }
      }
      for (let i = 0; i < vis.length; i++) {
        const v = vis[i], r = v.r;
        const isT = v.k === 'txt' || v.k === 'num';
        if (isT && (r.left < 30 || r.right > 1890 || r.top < 20 || r.bottom > 1060)) res.push({ t: +t.toFixed(1), what: 'ЗА КРАЕМ', a: v.name, rect: [r.left, r.top, r.right, r.bottom].map(Math.round) });
        for (let j = i + 1; j < vis.length; j++) {
          const w = vis[j]; const wT = w.k === 'txt' || w.k === 'num';
          if (!isT && !wT) continue;
          if (v.ign || w.ign) continue;
          if (ov(r, w.r, 6)) res.push({ t: +t.toFixed(1), what: isT && wT ? 'ТЕКСТ/ТЕКСТ' : 'ТЕКСТ/КАРТИНКА', a: v.name, b: w.name });
        }
      }
    }
    return res;
  }, [A, B]);
  console.log(JSON.stringify(out)); await b.close();
})();
"""
f = '/tmp/claude-0/-home-user-video234/b7cd2455-73e1-534d-ab20-0a526604a9d1/scratchpad/ov.cjs'; open(f, 'w').write(js)
r = subprocess.run(['node', f, HERE, str(a), str(b)], capture_output=True, text=True, cwd='/home/user/video234')
if r.returncode: print(r.stderr[-2000:]); sys.exit(2)
res = json.loads(r.stdout.strip().splitlines()[-1])
# схлопываем подряд идущие одинаковые находки в интервалы
seen = {}
for x in res:
    k = (x['what'], str(x.get('a'))[:40], str(x.get('b'))[:40]); seen.setdefault(k, []).append(x['t'])
for k, ts in sorted(seen.items(), key=lambda kv: kv[1][0]):
    print(f'{ts[0]:7.1f}–{ts[-1]:7.1f}  {k[0]}: «{k[1]}»' + (f' × «{k[2]}»' if k[2] != 'None' else ''))
print('проблем:', len(seen)); sys.exit(1 if seen else 0)
