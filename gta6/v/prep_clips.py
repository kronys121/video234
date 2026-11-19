# Кадры геймплея для локального просмотра: clipuse.json -> clips/<key>/0001.jpg (60 к/с; карточки 1280x720, размытые фоны 640x360)
#   python3 prep_clips.py [от до]  — только клипы, которые видны в этом отрезке времени
import json, os, subprocess, shutil, sys
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
if len(sys.argv) > 2:
    a, b = float(sys.argv[1]), float(sys.argv[2]); use = [u for u in use if u['at'] < b and u['at'] + u['dur'] > a]
keep = {u['key'] for u in json.load(open(f'{HERE}/clipuse.json'))}
os.makedirs(f'{HERE}/clips', exist_ok=True)
for d in os.listdir(f'{HERE}/clips'):
    if d not in keep: shutil.rmtree(f'{HERE}/clips/{d}')
def go(u):
    out = f"{HERE}/clips/{u['key']}"; n = round(u['dur'] * 60)
    stamp = f"{out}/src.txt"; sig = f"{u['name']} {u['off']} {u['dur']} {u.get('small')}"
    if os.path.exists(stamp) and open(stamp).read() == sig: return
    shutil.rmtree(out, ignore_errors=True); os.makedirs(out)
    src, st, _ = CL[u['name']]
    subprocess.run(['ffmpeg', '-nostdin', '-y', '-v', 'error', '-ss', f"{st + u['off']:.3f}", '-i', f'{G}/src/{src}.mp4', '-frames:v', str(n),
                    '-vf', crop(u['name'], src) + (',scale=640:360,fps=60' if u.get('small') else ',scale=1280:720:flags=lanczos,fps=60'), '-q:v', '3', f'{out}/%04d.jpg'], check=True)
    open(stamp, 'w').write(sig)
with ThreadPoolExecutor(4) as ex: list(ex.map(go, use))
print('ok', len(use))
