# Пул свободных отрезков геймплея для фонов сцен: всё, что не занято карточками, без повторов.
#   python3 gen_pool.py  -> pool.js   (потом python3 check.py)
import json, os, subprocess
HERE = os.path.dirname(os.path.abspath(__file__)); G = os.path.dirname(HERE)
open(f'{HERE}/pool.js', 'w').write('window.POOL = [];\n')
subprocess.run(['python3', f'{HERE}/check.py'], capture_output=True)
use = json.load(open(f'{HERE}/clipuse.json'))
CL = {}
for line in open(f'{G}/clips_list.txt'):
    if line.startswith('#') or not line.strip(): continue
    p = line.split(); CL[p[0]] = (p[1], float(p[2]), float(p[3]))
busy = {}
for u in use:
    src, st, _ = CL[u['name']]; busy.setdefault(src, []).append((st + u['off'] - 0.1, st + u['off'] + u['dur'] + 0.1))
SKIP = ('meme_', 'sw16_split', 'c4_split', 'd16_logo', 'd16_title', 'd16_mars_planet', 'snes_cart', 'esw_gyro', 'esw3', 'e_cutscene', 'd4_cod')   # мемы, сравнения, титры, руки — не для фона
free = []
for name, (src, st, dur) in CL.items():
    if name.startswith(SKIP): continue
    a, b = st, st + dur
    cuts = sorted(x for x in busy.get(src, []) if x[1] > a and x[0] < b)
    cur = a
    for (x0, x1) in cuts:
        if x0 - cur >= 2.6: free.append((src, name, round(cur - st, 2), round(x0 - cur, 2)))
        cur = max(cur, x1)
    if b - cur >= 2.6: free.append((src, name, round(cur - st, 2), round(b - cur, 2)))
# свободные куски разных клипов из одного исходника не должны пересекаться между собой
free.sort(key=lambda f: (f[0], CL[f[1]][1] + f[2])); ok = []; last = {}
for f in free:
    s0 = CL[f[1]][1] + f[2]
    if s0 < last.get(f[0], -1): continue
    ok.append(f); last[f[0]] = s0 + f[3]
# чередуем исходники, чтобы соседние сцены были из разных видео
by = {}
for f in ok: by.setdefault(f[0], []).append(f)
order = []
while any(by.values()):
    for k in list(by):
        if by[k]: order.append(by[k].pop(0))
open(f'{HERE}/pool.js', 'w').write('window.POOL = ' + json.dumps([[f[1], f[2], f[3]] for f in order]) + ';\n')
print(len(order), 'кусков,', round(sum(f[3] for f in order), 1), 'с свободного геймплея')
