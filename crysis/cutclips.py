# Нарезка клипов из clips_list.txt: интерфейс игры срезан, 1280x720, 60 к/с, без звука -> clips/<name>.mp4
import os, subprocess
from concurrent.futures import ThreadPoolExecutor
HERE = os.path.dirname(os.path.abspath(__file__))
CROP = 'crop=iw*0.74:ih*0.74:iw*0.13:ih*0.02'
CL = [l.split(None, 4) for l in open(f'{HERE}/clips_list.txt') if l.strip() and not l.startswith('#')]
os.makedirs(f'{HERE}/clips', exist_ok=True)
def go(c):
    n, src, st, d = c[0], c[1], float(c[2]), float(c[3]); out = f'{HERE}/clips/{n}.mp4'
    if os.path.exists(out): return
    subprocess.run(['ffmpeg', '-nostdin', '-y', '-v', 'error', '-ss', f'{st:.3f}', '-i', f'{HERE}/src/{src}.mp4', '-t', f'{d:.3f}', '-an',
                    '-vf', CROP + ',scale=1280:720:flags=lanczos,fps=60,format=yuv420p', '-c:v', 'libx264', '-preset', 'medium', '-crf', '20', out + '.tmp.mp4'], check=True)
    os.rename(out + '.tmp.mp4', out)
with ThreadPoolExecutor(4) as ex: list(ex.map(go, CL))
print('ok', len(CL))
