# Нарезка клипов из clips_list.txt -> clips/<name>.mp4 (1280x720, 60 к/с, без звука).
# Обрезка по исходнику: hud — срезаем интерфейс игры по краям, full — кадр целиком.
#   python3 cutclips.py [исходник]   (только клипы этого исходника)
import os, subprocess, sys
from concurrent.futures import ThreadPoolExecutor
HERE = os.path.dirname(os.path.abspath(__file__))
CROP = {
    'hud': 'crop=iw*0.80:ih*0.80:iw*0.10:ih*0.03,',
    'ete': 'crop=iw*0.80:ih*0.80:iw*0.10:ih*0.03,',      # Eternal PC: ещё и водяной знак KVG справа внизу
    'full': '',
    'sw': 'crop=iw*0.88:ih*0.88:iw*0.05:ih*0.06,',          # Switch handheld/docked: срезаем подписи по краям
    'mash': 'crop=iw*0.84:ih*0.84:0:ih*0.16,',               # Mashable: водяной знак справа вверху
    'preg': 'crop=320:180:176:82,',                           # тест на беременность: только окошко, без надписей
}
SRC_CROP = {'doom2016_ps4': 'hud', 'eternal_pc': 'ete', 'hvd': 'sw', 'atm': 'mash', 'preg': 'preg', 'doom4': 'full', 'doom93': 'full', 'snes': 'full', 'cmp4': 'full'}
SPLIT = ('sw16_split',)   # сравнения бок о бок — кадр целиком, с подписями
CL = [l.split(None, 4) for l in open(f'{HERE}/clips_list.txt') if l.strip() and not l.startswith('#')]
only = sys.argv[1] if len(sys.argv) > 1 else None
def go(c):
    n, src, st, d = c[0], c[1], float(c[2]), float(c[3]); out = f'{HERE}/clips/{n}.mp4'
    if os.path.exists(out) or (only and src != only): return
    vf = '' if n.startswith(SPLIT) else CROP[SRC_CROP.get(src, 'full')]
    subprocess.run(['ffmpeg', '-nostdin', '-y', '-v', 'error', '-ss', f'{st:.3f}', '-i', f'{HERE}/src/{src}.mp4', '-t', f'{d:.3f}', '-an',
                    '-vf', vf + 'scale=1280:720:flags=lanczos,fps=60,format=yuv420p', '-c:v', 'libx264', '-preset', 'medium', '-crf', '23', out + '.tmp.mp4'], check=True)
    os.rename(out + '.tmp.mp4', out)
with ThreadPoolExecutor(3) as ex: list(ex.map(go, CL))
print('ok', len(CL))
