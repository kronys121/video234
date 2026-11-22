# Проверка клипов из clips_list.txt с обрезкой интерфейса: 3 кадра на клип -> review/clip_check_NN.jpg
import os, subprocess
from concurrent.futures import ThreadPoolExecutor
from PIL import Image, ImageDraw
HERE = os.path.dirname(os.path.abspath(__file__))
CROP = 'crop=iw*0.74:ih*0.74:iw*0.13:ih*0.02'   # без миникарты, полос здоровья, субтитров (нижние ~24%)
CL = [l.split(None, 4) for l in open(f'{HERE}/clips_list.txt') if l.strip() and not l.startswith('#')]
os.makedirs(f'{HERE}/review/cc', exist_ok=True)
def grab(i):
    n, src, st, d = CL[i][0], CL[i][1], float(CL[i][2]), float(CL[i][3])
    for k, f in enumerate([0.1, 0.5, 0.9]):
        p = f'{HERE}/review/cc/{i:03d}_{k}.jpg'
        if not os.path.exists(p):
            subprocess.run(['ffmpeg', '-nostdin', '-y', '-v', 'error', '-ss', str(st + d * f), '-i', f'{HERE}/src/{src}.mp4', '-frames:v', '1', '-vf', CROP + ',scale=320:180', '-q:v', '4', p])
with ThreadPoolExecutor(8) as ex: list(ex.map(grab, range(len(CL))))
W, H, per = 320, 180, 17
for p0 in range(0, len(CL), per):
    sub = range(p0, min(len(CL), p0 + per)); sh = Image.new('RGB', (W * 3 + 330, H * len(sub)), 'white'); d = ImageDraw.Draw(sh)
    for r, i in enumerate(sub):
        for k in range(3): sh.paste(Image.open(f'{HERE}/review/cc/{i:03d}_{k}.jpg'), (k * W, r * H))
        d.text((W * 3 + 6, r * H + 8), f'#{i} {CL[i][0]}', fill='black'); d.text((W * 3 + 6, r * H + 28), f'{CL[i][1]} @{CL[i][2]} +{CL[i][3]}', fill='gray')
    sh.save(f'{HERE}/review/clip_check_{p0 // per + 1:02d}.jpg', quality=78)
print(len(CL))
