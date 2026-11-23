# Собирает проект Remotion для шорта GTA 6 (9:16, ~1 мин) из исходников:
# движок монтажа gta6/v (те же анимации, что в полном ролике), только клипы нужных отрезков, звук и тайминги субтитров.
#   python3 build-site.py
import json, os, shutil, subprocess
R = os.path.abspath('..'); V = f'{R}/gta6/v'; SH = f'{R}/gta6/shorts'; S = 'public/site/gta6'
subprocess.run(['python3', f'{SH}/build_short.py', '--data'], check=True)
D = json.load(open(f'{SH}/tmp/short_data.json'))
shutil.rmtree('public/site', ignore_errors=True); os.makedirs(S); os.makedirs('public/media', exist_ok=True); os.makedirs('clips_src', exist_ok=True)
for f in ['index.html', 'engine.js', 'beats.js', 'pool.js']: shutil.copy(f'{V}/{f}', S)
shutil.copytree(f'{V}/img', f'{S}/img'); shutil.copytree(f'{V}/fonts', f'{S}/fonts')
# клипы, которые видны в отрезках шорта (остальные движку не понадобятся)
use = [u for u in json.load(open(f'{V}/clipuse.json')) if any(u['at'] < b + 0.5 and u['at'] + u['dur'] > a - 0.5 for a, b in D['segs'])]
keep = {u['key'] + '.mp4' for u in use}
for f in os.listdir('clips_src'):
    if f not in keep: os.remove(f'clips_src/{f}')
for u in use:
    src = f"{R}/remotion_gta6/clips_src/{u['key']}.mp4"
    if not os.path.exists(src): raise SystemExit(f'нет клипа {src} — сначала python3 build-site.py в remotion_gta6')
    shutil.copy(src, 'clips_src/')
# звук и данные
subprocess.run(['ffmpeg', '-nostdin', '-v', 'error', '-y', '-i', f'{SH}/tmp/audio.wav', '-ar', '48000', '-c:a', 'aac', '-b:a', '256k', 'public/media/short_audio.m4a'], check=True)
json.dump(D, open('src/short_data.json', 'w'), ensure_ascii=False)
print('site ok', len(use), 'клипов', round(D['total'], 2), 'с')
