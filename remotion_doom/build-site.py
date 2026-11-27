# Собирает проект Remotion из исходников монтажа doom/v: страница движка, картинки, шрифты (с эмодзи),
# клипы геймплея (короткие mp4 60 к/с, в кадры их режет prepare-clips.mjs на компьютере), звук и реклама.
#   python3 build-site.py
import json, os, shutil, subprocess
from concurrent.futures import ThreadPoolExecutor
R = os.path.abspath('..'); C = f'{R}/doom'; V = f'{C}/v'; S = 'public/site/doom'
shutil.rmtree('public/site', ignore_errors=True); os.makedirs(S); os.makedirs('public/media', exist_ok=True); os.makedirs('clips_src', exist_ok=True)
for f in ['index.html', 'engine.js', 'beats.js', 'pool.js']: shutil.copy(f'{V}/{f}', S)
shutil.copytree(f'{V}/img', f'{S}/img'); shutil.copytree(f'{V}/fonts', f'{S}/fonts')
# клипы: по одному mp4 на каждое использование (1280x720 или 640x360 для размытых фонов, 60 к/с, ровно нужное число кадров)
use = json.load(open(f'{V}/clipuse.json')); keep = {u['key'] + '.mp4' for u in use} | {u['key'] + '.mp4.txt' for u in use}
for f in os.listdir('clips_src'):
    if f not in keep: os.remove(f'clips_src/{f}')
def go(u):
    out = f"clips_src/{u['key']}.mp4"; sig = f"{u['name']} {u['off']} {u['dur']} {u.get('small')}"
    if os.path.exists(out) and os.path.exists(out + '.txt') and open(out + '.txt').read() == sig: return
    n = round(u['dur'] * 60)
    subprocess.run(['ffmpeg', '-nostdin', '-v', 'error', '-y', '-ss', f"{u['off']:.3f}", '-i', f"{C}/clips/{u['name']}.mp4", '-frames:v', str(n), '-an',
                    '-vf', ('scale=640:360,' if u.get('small') else '') + 'fps=60,format=yuv420p', '-c:v', 'libx264', '-preset', 'medium', '-crf', '18', out + '.tmp.mp4'], check=True)
    os.rename(out + '.tmp.mp4', out); open(out + '.txt', 'w').write(sig)
with ThreadPoolExecutor(4) as ex: list(ex.map(go, use))
# звук и реклама
subprocess.run(['ffmpeg', '-nostdin', '-v', 'error', '-y', '-i', f'{V}/mix_full.wav', '-af', 'loudnorm=I=-16:TP=-1.5:LRA=11', '-ar', '48000', '-c:a', 'aac', '-b:a', '256k', 'public/media/mix.m4a'], check=True)
shutil.copy(f'{C}/ad/doom_ggsel.mp4', 'public/media/doom_ggsel.mp4')
print('site ok', len(use), 'клипов')
