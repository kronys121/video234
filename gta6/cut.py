# Нарезка планов по edl.py: срез интерфейса (миникарта, водяной знак, логотипы), 1920x1080, 60 к/с.
#   python3 cut.py check  -> review/edl_check_NN.jpg (3 кадра на план, уже с обрезкой)
#   python3 cut.py cut    -> shots/NNN_name.mp4
import os, sys, subprocess
from concurrent.futures import ThreadPoolExecutor
from PIL import Image, ImageDraw
from edl import shots
HERE = os.path.dirname(os.path.abspath(__file__))
def crop(name, src):
    # HUD: миникарта слева внизу (x<340, y>800), звёзды справа вверху (x>1780, y<180), подсказки/водяной знак слева вверху,
    # логотипы игр в сравнении (y<120), чёрные полосы катсцен (до ~50 px)
    if src == 'vs5' and name.startswith('vs_'): return 'crop=1688:950:116:130'   # сплит GTA 5 | GTA 6 без логотипов
    if src in ('swamps', 'chase_keys'): return 'crop=1310:737:470:165'   # там ещё подсказки миссий слева вверху
    return 'crop=1340:754:440:160'

S = shots()
mode = sys.argv[1] if len(sys.argv) > 1 else 'check'
if mode == 'check':
    os.makedirs(f'{HERE}/review/edl', exist_ok=True)
    def grab(i):
        s = S[i]; ims = []
        for k, f in enumerate([0.15, 0.5, 0.85]):
            p = f'{HERE}/review/edl/{i:03d}_{k}.jpg'
            if not os.path.exists(p):
                subprocess.run(['ffmpeg', '-nostdin', '-y', '-v', 'error', '-ss', str(s['ss'] + s['dur'] * f), '-i', f'{HERE}/src/{s["src"]}.mp4',
                                '-frames:v', '1', '-vf', crop(s['name'], s['src']) + ',scale=320:180', '-q:v', '4', p])
        return i
    with ThreadPoolExecutor(8) as ex: list(ex.map(grab, range(len(S))))
    per = 16; W, H = 320, 180
    for p0 in range(0, len(S), per):
        sub = range(p0, min(len(S), p0 + per))
        sh = Image.new('RGB', (W * 3 + 300, H * len(sub)), 'white'); d = ImageDraw.Draw(sh)
        for r, i in enumerate(sub):
            s = S[i]
            for k in range(3):
                sh.paste(Image.open(f'{HERE}/review/edl/{i:03d}_{k}.jpg'), (k * W, r * H))
            t = s['t'] + (38.286 if s['t'] >= 174.86 else 0)
            d.text((W * 3 + 8, r * H + 8), f"#{i}  {int(s['t']//60)}:{s['t']%60:05.2f}", fill='black')
            d.text((W * 3 + 8, r * H + 28), f"{s['name']}  {s['dur']:.1f}s", fill='black')
            d.text((W * 3 + 8, r * H + 48), f"{s['src']} @{s['ss']:.1f}", fill='gray')
        sh.save(f'{HERE}/review/edl_check_{p0 // per + 1:02d}.jpg', quality=78)
    print('sheets', (len(S) + per - 1) // per)
elif mode == 'cut':
    os.makedirs(f'{HERE}/shots', exist_ok=True)
    def cut(i):
        s = S[i]; out = f'{HERE}/shots/{i:03d}_{s["name"]}.mp4'
        if os.path.exists(out): return
        subprocess.run(['ffmpeg', '-nostdin', '-y', '-v', 'error', '-ss', f"{s['ss']:.3f}", '-i', f'{HERE}/src/{s["src"]}.mp4', '-t', f"{s['dur']:.3f}",
                        '-vf', crop(s['name'], s['src']) + ',scale=1920:1080:flags=lanczos,fps=60,format=yuv420p',
                        '-af', 'aresample=48000', '-ac', '2', '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '16', '-c:a', 'pcm_s16le', '-f', 'matroska', out + '.tmp'], check=True)
        os.rename(out + '.tmp', out)
    with ThreadPoolExecutor(3) as ex: list(ex.map(cut, range(len(S))))
    print('cut', len(S))
