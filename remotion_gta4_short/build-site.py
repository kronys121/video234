# Проект Remotion для шортов «GTA 4» (9:16): страница движка ролика, клипы, звук, субтитры и кадрирование по сценам.
#   python3 build-site.py
import os, re, shutil, subprocess
R = os.path.abspath('..'); S = 'public/site'; SH = f'{R}/gta6/shorts'
SHORTS = [  # имя, куски озвучки (шкала движка), крючок
    ('q1', '0.0,61.35', 'GTA 4 НА PS3|ЭТО БЫЛО БЕЗУМИЕ'),
    ('q2', '61.35,123.35', 'PS3 БЫЛА|КОМПЬЮТЕРОМ APPLE'),
    ('q3', '123.35,181.85', '2 КАДРА|В СЕКУНДУ'),
    ('q4', '181.85,247.45', '180 МБ ЛИШНИХ|И ВАЗЕЛИН НА ЭКРАНЕ'),
    ('q5', '247.45,297.85', 'ЗАЙДИ В ЗДАНИЕ —|ГОРОД ЗАМЁРЗНЕТ'),
    ('q6', '297.85,375.05', 'ПРОХОЖИЕ|С НЕРВНОЙ СИСТЕМОЙ'),
    ('q7', '375.05,441.55', 'ТЕНИ, КОТОРЫЕ|ЕЛИ ПАМЯТЬ PS3'),
    ('q8', '441.55,509.65', 'GTA 4 НА PS3|ЧЕГО ЭТО СТОИЛО'),
]
shutil.rmtree(S, ignore_errors=True); os.makedirs(S + '/gta4_ps3'); os.makedirs('public/media', exist_ok=True); os.makedirs('clips_src', exist_ok=True); os.makedirs('src/data', exist_ok=True)
js = open(f'{R}/gta4_ps3/full.js').read()
js = js.replace('`/${clip}/', '`${clip}/')   # кадры клипов — относительно сайта
js = re.sub(r"(['\"`])/(gta4_ps3|gta5_new|uncharted3|tlou2|rdr2|cyberpunk|node_modules|fonts)/", r"\1\2/", js)
left = re.findall(r"['\"`]/[a-z]", js); assert not left, left
open(f'{S}/gta4_ps3/full.js', 'w').write(js)
html = open(f'{R}/gta4_ps3/full.html').read()
html = html.replace("url('/node_modules/", "url('node_modules/").replace('src="full.js"', 'src="gta4_ps3/full.js"')
html = html.replace('<style>', '<base href="../">\n<style>\n@font-face{font-family:\'Noto Color Emoji\';src:url(\'fonts/NotoColorEmoji.ttf\') format(\'truetype\')}', 1)
open(f'{S}/gta4_ps3/full.html', 'w').write(html)
for f in []: shutil.copy(f'{R}/gta4_ps3/{f}', f'{S}/gta4_ps3/')
for d in ['gta4_ps3/assets']:
    if os.path.exists(f'{R}/{d}'): shutil.copytree(f'{R}/{d}', f'{S}/{d}')
os.makedirs(f'{S}/fonts'); shutil.copy('/usr/share/fonts/truetype/noto/NotoColorEmoji.ttf', f'{S}/fonts/')
for p in ['oswald/files/oswald-cyrillic-700-normal.woff2', 'oswald/files/oswald-latin-700-normal.woff2', 'montserrat/files/montserrat-latin-900-normal.woff2']:
    os.makedirs(os.path.dirname(f'{S}/node_modules/@fontsource/{p}'), exist_ok=True); shutil.copy(f'{R}/node_modules/@fontsource/{p}', f'{S}/node_modules/@fontsource/{p}')
# клипы: mp4 в размере и частоте движка (на компьютере режутся в кадры prepare-clips.mjs)
CLIPS = {'ps3_run_big': ('gta4_ps3/clips/ps3_gameplay_run.mp4', 'crop=1240:900:440:180,scale=1100:798'), 'crash1': ('gta4_ps3/clips/crash1.mp4', 'crop=1050:720:230:0,scale=880:604'), 'crash2': ('gta4_ps3/clips/crash2.mp4', 'crop=860:720:210:0,scale=720:603'), 'rag1': ('gta4_ps3/clips/rag1.mp4', 'crop=1000:560:140:0,scale=760:426'), 'rag2': ('gta4_ps3/clips/rag2.mp4', 'crop=1000:560:140:30,scale=760:426'), 'ps3_gameplay_lowres': ('gta4_ps3/clips/ps3_gameplay_lowres.mp4', 'crop=600:338:20:0,scale=760:428'), 'cmp_ps3_x360_street': ('gta4_ps3/clips/cmp_ps3_x360_street.mp4', 'scale=960:540'), 'ps3_fps_counter': ('gta4_ps3/clips/ps3_fps_counter.mp4', 'scale=960:540'), 'cmp_ps3_x360_park': ('gta4_ps3/clips/cmp_ps3_x360_park.mp4', 'scale=960:540')}
for name, (src, vf) in CLIPS.items():
    if os.path.exists(f'clips_src/{name}.mp4'): continue
    if vf is None: shutil.copy(f'{R}/{src}', f'clips_src/{name}.mp4'); continue
    subprocess.run(['ffmpeg', '-nostdin', '-v', 'error', '-y', '-i', f'{R}/{src}', '-an', '-vf', vf + ',scale=trunc(iw/2)*2:trunc(ih/2)*2', '-r', '30', '-c:v', 'libx264', '-crf', '17', '-pix_fmt', 'yuv420p', f'clips_src/{name}.mp4'], check=True)
for name, segs, hook in SHORTS:
    subprocess.run(['python3', f'{SH}/build_short.py', '--data', '--name', name, '--segs', segs, '--hook', hook, '--voice', f'{R}/gta4_ps3/audio.mp3', '--words', f'{R}/gta4_ps3/words.json'], check=True)
    subprocess.run(['node', f'{SH}/framing.mjs', f'{SH}/tmp/{name}_data.json', '/gta4_ps3/full.html'], cwd=R, check=True)
    shutil.copy(f'{SH}/tmp/{name}_data.json', f'src/data/{name}.json')
    subprocess.run(['ffmpeg', '-nostdin', '-v', 'error', '-y', '-i', f'{SH}/tmp/{name}_audio.wav', '-ar', '48000', '-c:a', 'aac', '-b:a', '256k', f'public/media/{name}_audio.m4a'], check=True)
print('site ok')
