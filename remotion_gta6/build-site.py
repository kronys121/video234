# Собирает проект Remotion из исходников монтажа gta6/v: страница движка, картинки, шрифты (с эмодзи),
# клипы геймплея (короткие mp4 60 к/с, в кадры их режет prepare-clips.mjs на компьютере), звук и реклама.
#   python3 build-site.py
import json, os, shutil, subprocess
from concurrent.futures import ThreadPoolExecutor
R = os.path.abspath('..'); V = f'{R}/gta6/v'; S = 'public/site/gta6'
shutil.rmtree('public/site', ignore_errors=True); os.makedirs(S); os.makedirs('public/media', exist_ok=True); os.makedirs('clips_src', exist_ok=True)
for f in ['index.html', 'engine.js', 'beats.js', 'pool.js']: shutil.copy(f'{V}/{f}', S)
shutil.copytree(f'{V}/img', f'{S}/img'); shutil.copytree(f'{V}/fonts', f'{S}/fonts')
# клипы: по одному mp4 на каждое использование (уже обрезан интерфейс, 1280x720, 60 к/с, ровно нужное число кадров)
CL = {}
for line in open(f'{R}/gta6/clips_list.txt'):
    if line.startswith('#') or not line.strip(): continue
    p = line.split(); CL[p[0]] = (p[1], float(p[2]), float(p[3]))
def crop(name, src):
    if src == 'vs5' and name.startswith('vs_'): return 'crop=1688:950:116:130'
    if src in ('swamps', 'chase_keys'): return 'crop=1310:737:470:165'
    return 'crop=1340:754:440:160'
use = json.load(open(f'{V}/clipuse.json')); keep = {u['key'] + '.mp4' for u in use}
for f in os.listdir('clips_src'):
    if f not in keep and not (f.endswith('.txt') and f[:-4] in keep): os.remove(f'clips_src/{f}')
def go(u):
    out = f"clips_src/{u['key']}.mp4"; sig = f"{u['name']} {u['off']} {u['dur']} {u.get('small')}"
    if os.path.exists(out) and os.path.exists(out + '.txt') and open(out + '.txt').read() == sig: return
    src, st, _ = CL[u['name']]; n = round(u['dur'] * 60)
    subprocess.run(['ffmpeg', '-nostdin', '-v', 'error', '-y', '-ss', f"{st + u['off']:.3f}", '-i', f'{R}/gta6/src/{src}.mp4', '-frames:v', str(n), '-an',
                    '-vf', crop(u['name'], src) + (',scale=640:360,fps=60,format=yuv420p' if u.get('small') else ',scale=1280:720:flags=lanczos,fps=60,format=yuv420p'), '-c:v', 'libx264', '-preset', 'medium', '-crf', '18', out + '.tmp.mp4'], check=True)
    os.rename(out + '.tmp.mp4', out); open(out + '.txt', 'w').write(sig)
with ThreadPoolExecutor(4) as ex: list(ex.map(go, use))
# звук и реклама
subprocess.run(['ffmpeg', '-nostdin', '-v', 'error', '-y', '-i', f'{V}/mix_full.wav', '-af', 'loudnorm=I=-16:TP=-1.5:LRA=11', '-ar', '48000', '-c:a', 'aac', '-b:a', '256k', 'public/media/mix.m4a'], check=True)
shutil.copy(f'{R}/gta6/ad/gta6_ggsel.mp4', 'public/media/gta6_ggsel.mp4')
print('site ok', len(use), 'клипов')
