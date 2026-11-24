# Проект Remotion для шортов «Crysis на консолях» (9:16): движок монтажа ролика (crysis/v), клипы, звук,
# субтитры (сценарий, выровненный по озвучке: crysis/voice/words_aligned.json) и кадрирование по сценам.
#   python3 build-site.py
import json, os, shutil, subprocess
R = os.path.abspath('..'); C = f'{R}/crysis'; V = f'{C}/v'; SH = f'{R}/gta6/shorts'; S = 'public/site/crysis'
SHORTS = [  # имя, куски озвучки полного ролика (crysis_voice_main.mp3), крючок
    ('c1', '0.0,35.25', 'А CRYSIS ПОТЯНЕТ?|НА PS3 И XBOX 360'),
    ('c2', '35.25,95.3', 'С ЧЕГО ВСЁ НАЧАЛОСЬ|FAR CRY'),
    ('c3', '95.3,157.95', 'CRYSIS 2007|ДЖУНГЛИ И НАНОКОСТЮМ'),
    ('c4', '157.95,209.85', 'ИГРУ НЕ ТЯНУЛО|НИЧЕГО'),
    ('c5', '230.65,288.5', '512 МБ НА ВСЁ|XBOX 360 И PS3'),
    ('c6', '288.5,336.3', 'CRYENGINE 3|И НЬЮ-ЙОРК'),
    ('c7', '336.3,384.4', 'CRYSIS НА КОНСОЛЯХ|ЧЕМ ЗАПЛАТИЛИ'),
    ('c8', '384.4,430.5', 'ДАЛЬНОСТЬ И СГЛАЖИВАНИЕ|ПК ПРОТИВ КОНСОЛЕЙ'),
    ('c9', '430.5,487.95', 'ВЫРЕЗАННЫЙ УРОВЕНЬ|CRYSIS НА КОНСОЛЯХ'),
    ('c10', '488.0,554.3', 'CRYSIS НА SWITCH|КАК ЭТО ВОЗМОЖНО'),
    ('c11', '554.3,595.85', 'CAN IT RUN CRYSIS?|ТЕПЕРЬ ЭТО ПРЕСЕТ'),
]
shutil.rmtree('public/site', ignore_errors=True); os.makedirs(S); os.makedirs('public/media', exist_ok=True); os.makedirs('clips_src', exist_ok=True); os.makedirs('src/data', exist_ok=True)
for f in ['index.html', 'engine.js', 'beats.js', 'pool.js']: shutil.copy(f'{V}/{f}', S)
shutil.copytree(f'{V}/img', f'{S}/img'); shutil.copytree(f'{V}/fonts', f'{S}/fonts')
subprocess.run(['python3', f'{C}/voice/align_words.py'], check=True)
segs_all = []
for name, segs, hook in SHORTS:
    subprocess.run(['python3', f'{SH}/build_short.py', '--data', '--name', name, '--segs', segs, '--hook', hook, '--voice', f'{C}/voice/crysis_voice_main.mp3', '--words', f'{C}/voice/words_aligned.json'], check=True)
    subprocess.run(['node', f'{SH}/framing.mjs', f'{SH}/tmp/{name}_data.json', '/crysis/v/index.html'], cwd=R, check=True)
    D = json.load(open(f'{SH}/tmp/{name}_data.json')); segs_all += D['segs']
    shutil.copy(f'{SH}/tmp/{name}_data.json', f'src/data/{name}.json')
    subprocess.run(['ffmpeg', '-nostdin', '-v', 'error', '-y', '-i', f'{SH}/tmp/{name}_audio.wav', '-ar', '48000', '-c:a', 'aac', '-b:a', '256k', f'public/media/{name}_audio.m4a'], check=True)
# клипы, которые видны в отрезках шортов (и первой сцены — движок рисует 0:00 при загрузке)
use = [u for u in json.load(open(f'{V}/clipuse.json')) if u['at'] < 0.5 or any(u['at'] < b + 0.5 and u['at'] + u['dur'] > a - 0.5 for a, b in segs_all)]
keep = {u['key'] + '.mp4' for u in use}
for f in os.listdir('clips_src'):
    if f not in keep: os.remove(f'clips_src/{f}')
for u in use:
    out = f"clips_src/{u['key']}.mp4"
    if os.path.exists(out): continue
    src = f"{R}/remotion_crysis/clips_src/{u['key']}.mp4"
    if os.path.exists(src): shutil.copy(src, out); continue
    subprocess.run(['ffmpeg', '-nostdin', '-v', 'error', '-y', '-ss', f"{u['off']:.3f}", '-i', f"{C}/clips/{u['name']}.mp4", '-frames:v', str(round(u['dur'] * 60)), '-an',
                    '-vf', ('scale=640:360,' if u.get('small') else '') + 'fps=60,format=yuv420p', '-c:v', 'libx264', '-preset', 'medium', '-crf', '18', out], check=True)
print('site ok', len(use), 'клипов')
