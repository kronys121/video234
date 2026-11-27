# Кадры геймплея для движка: clipuse.json -> clips/<key>/0001.jpg (60 к/с; карточки 1280x720, размытые фоны 640x360).
# Источник — уже нарезанные клипы doom/clips/<name>.mp4 (интерфейс срезан, 1280x720, 60 к/с).
#   python3 prep_clips.py [от до]
import json, os, subprocess, shutil, sys
from concurrent.futures import ThreadPoolExecutor
HERE = os.path.dirname(os.path.abspath(__file__)); C = os.path.dirname(HERE)
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
    subprocess.run(['ffmpeg', '-nostdin', '-y', '-v', 'error', '-ss', f"{u['off']:.3f}", '-i', f"{C}/clips/{u['name']}.mp4", '-frames:v', str(n),
                    '-vf', 'scale=640:360' if u.get('small') else 'null', '-q:v', '3', f'{out}/%04d.jpg'], check=True)
    open(stamp, 'w').write(sig)
with ThreadPoolExecutor(4) as ex: list(ex.map(go, use))
print('ok', len(use))
