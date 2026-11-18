# Кадры для карточек геймплея: clipuse.json -> clips/<key>/0001.jpg (30 к/с, 1280x720, интерфейс игры обрезан)
import json, os, subprocess, shutil
from concurrent.futures import ThreadPoolExecutor
HERE = os.path.dirname(os.path.abspath(__file__)); G = os.path.dirname(HERE)
CL = {}
for line in open(f'{G}/clips_list.txt'):
    if line.startswith('#') or not line.strip(): continue
    p = line.split(); CL[p[0]] = (p[1], float(p[2]), float(p[3]))
def crop(name, src):
    if src == 'vs5' and name.startswith('vs_'): return 'crop=1688:950:116:130'
    if src in ('swamps', 'chase_keys'): return 'crop=1310:737:470:165'
    return 'crop=1340:754:440:160'
use = json.load(open(f'{HERE}/clipuse.json'))
keep = {u['key'] for u in use}
os.makedirs(f'{HERE}/clips', exist_ok=True)
for d in os.listdir(f'{HERE}/clips'):
    if d not in keep: shutil.rmtree(f'{HERE}/clips/{d}')
def go(u):
    out = f"{HERE}/clips/{u['key']}"; n = round(u['dur'] * 30)
    stamp = f"{out}/src.txt"; sig = f"{u['name']} {u['off']} {u['dur']}"
    if os.path.exists(stamp) and open(stamp).read() == sig: return
    shutil.rmtree(out, ignore_errors=True); os.makedirs(out)
    src, st, _ = CL[u['name']]
    subprocess.run(['ffmpeg', '-nostdin', '-y', '-v', 'error', '-ss', f"{st + u['off']:.3f}", '-i', f'{G}/src/{src}.mp4', '-frames:v', str(n),
                    '-vf', crop(u['name'], src) + ',scale=1280:720:flags=lanczos,fps=30', '-q:v', '3', f'{out}/%04d.jpg'], check=True)
    open(stamp, 'w').write(sig)
with ThreadPoolExecutor(4) as ex: list(ex.map(go, use))
print('ok', len(use))
