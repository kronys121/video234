# Проверка монтажа: открывает страницу, собирает использование клипов, проверяет повторы/границы и
# пишет clipuse.json для нарезки кадров.  python3 check.py
import json, os, subprocess, sys
HERE = os.path.dirname(os.path.abspath(__file__))
js = r"""
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const p = await b.newPage();
  const errs = []; p.on('pageerror', e => errs.push(e.message)); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  await p.goto('file://' + process.argv[2] + '/index.html');
  await p.waitForFunction(() => window.SCENES && window.SCENES.length > 0, null, { timeout: 30000 }).catch(() => {});
  const r = await p.evaluate(() => ({ use: window.CLIPUSE, sc: window.SCENES.map(s => ({ t0: s.t0, t1: s.t1, items: s.items.map(i => ({ k: i.kind, at: i.at, out: i.out, en: i.enter, n: (i.times || i.list || []).length, times: i.times, step: i.step })) })) }));
  console.log(JSON.stringify({ errs, ...r })); await b.close();
})();
"""
open('/tmp/claude-0/-home-user-video234/b7cd2455-73e1-534d-ab20-0a526604a9d1/scratchpad/chk.cjs', 'w').write(js)
out = subprocess.run(['node', '/tmp/claude-0/-home-user-video234/b7cd2455-73e1-534d-ab20-0a526604a9d1/scratchpad/chk.cjs', HERE], capture_output=True, text=True, cwd='/home/user/video234')
if out.returncode: print(out.stderr); sys.exit(1)
d = json.loads(out.stdout.strip().splitlines()[-1])
bad = 0
for e in d['errs']:
    if 'clips/' in e or 'ERR_FILE_NOT_FOUND' in e: continue
    print('ОШИБКА СТРАНИЦЫ:', e); bad += 1
CL = {}
for line in open(os.path.join(HERE, '..', 'clips_list.txt')):
    if line.startswith('#') or not line.strip(): continue
    p = line.split(); CL[p[0]] = (p[1], float(p[2]), float(p[3]))
used = {}
for u in d['use']:
    if u['name'] not in CL: print('НЕТ КЛИПА:', u); bad += 1; continue
    src, st, dur = CL[u['name']]
    if u['off'] + u['dur'] > dur + 0.05: print(f"ДЛИННЕЕ КЛИПА: {u['key']} нужно {u['off']+u['dur']:.2f} из {dur}"); bad += 1
    used.setdefault(src, []).append((st + u['off'], st + u['off'] + u['dur'], u['key']))
for src, L in used.items():
    L.sort()
    for a, b in zip(L, L[1:]):
        if b[0] < a[1] - 0.05: print('ПОВТОР:', src, a, b); bad += 1
# элементы, появляющиеся в самом конце сцены
for s in d['sc']:
    for it in s['items']:
        if it['at'] > s['t1'] - 0.45: print(f"ПОЗДНО: сцена {s['t0']} элемент {it['k']} at {it['at']} конец {s['t1']}"); bad += 1
        if it['at'] < s['t0'] - 0.01: print(f"РАНО: сцена {s['t0']} элемент {it['k']} at {it['at']}"); bad += 1
json.dump(d['use'], open(os.path.join(HERE, 'clipuse.json'), 'w'), ensure_ascii=False, indent=0)
json.dump(d['sc'], open(os.path.join(HERE, 'scenes.json'), 'w'), ensure_ascii=False)
print(len(d['sc']), 'сцен,', len(d['use']), 'клипов,', round(sum(u['dur'] for u in d['use']), 1), 'с геймплея; ошибок', bad)
sys.exit(1 if bad else 0)
