# Собирает проект Remotion для шортов GTA 6 (9:16) из исходников:
# движок монтажа gta6/v (те же анимации, что в полном ролике), только нужные клипы, звук, субтитры и кадрирование по сценам.
#   python3 build-site.py
import json, os, shutil, subprocess
R = os.path.abspath('..'); V = f'{R}/gta6/v'; SH = f'{R}/gta6/shorts'; S = 'public/site/gta6'
SHORTS = [  # имя, куски озвучки полного ролика, крючок
    ('short1', '0,21.55;242.9,280.76', 'GTA 6 НЕ ДОЛЖНА|БЫЛА РАБОТАТЬ НА PS5'),
    ('short2', '42.2,84.75;98.55,114.95', 'ПОЛИЦИЯ GTA 6|ТЕБЯ ЗАПОМНИТ'),
    ('short3', '331.0,371.05;419.8,447.15', 'КАК ROCKSTAR|ОБМАНЫВАЕТ PS5'),
]
shutil.rmtree('public/site', ignore_errors=True); os.makedirs(S); os.makedirs('public/media', exist_ok=True); os.makedirs('clips_src', exist_ok=True); os.makedirs('src/data', exist_ok=True)
for f in ['index.html', 'engine.js', 'beats.js', 'pool.js']: shutil.copy(f'{V}/{f}', S)
shutil.copytree(f'{V}/img', f'{S}/img'); shutil.copytree(f'{V}/fonts', f'{S}/fonts')
segs_all = []
for name, segs, hook in SHORTS:
    subprocess.run(['python3', f'{SH}/build_short.py', '--data', '--name', name, '--segs', segs, '--hook', hook], check=True)
    subprocess.run(['node', f'{SH}/framing.mjs', f'{SH}/tmp/{name}_data.json'], cwd=R, check=True)   # масштаб/центр по сценам + проверка
    D = json.load(open(f'{SH}/tmp/{name}_data.json')); segs_all += D['segs']
    json.dump(D, open(f'src/data/{name}.json', 'w'), ensure_ascii=False)
    subprocess.run(['ffmpeg', '-nostdin', '-v', 'error', '-y', '-i', f'{SH}/tmp/{name}_audio.wav', '-ar', '48000', '-c:a', 'aac', '-b:a', '256k', f'public/media/{name}_audio.m4a'], check=True)
# клипы, которые видны в отрезках шортов
use = [u for u in json.load(open(f'{V}/clipuse.json')) if any(u['at'] < b + 0.5 and u['at'] + u['dur'] > a - 0.5 for a, b in segs_all)]
keep = {u['key'] + '.mp4' for u in use}
for f in os.listdir('clips_src'):
    if f not in keep: os.remove(f'clips_src/{f}')
for u in use:
    src = f"{R}/remotion_gta6/clips_src/{u['key']}.mp4"
    if not os.path.exists(src): raise SystemExit(f'нет клипа {src} — сначала python3 build-site.py в remotion_gta6')
    if not os.path.exists(f"clips_src/{u['key']}.mp4"): shutil.copy(src, 'clips_src/')
print('site ok', len(use), 'клипов')
