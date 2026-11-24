# Проект Remotion для шортов «Cyberpunk 2077» (9:16): страница движка ролика, клипы, звук, субтитры и кадрирование по сценам.
#   python3 build-site.py
import os, re, shutil, subprocess
R = os.path.abspath('..'); S = 'public/site'; SH = f'{R}/gta6/shorts'
SHORTS = [  # имя, куски озвучки (шкала движка), крючок
    ('k1', '0.0,39.25', 'SONY УБРАЛА|КИБЕРПАНК ИЗ МАГАЗИНА'),
    ('k2', '39.25,98.35', 'КАК КИБЕРПАНК|ПОДНЯЛ ОЖИДАНИЯ'),
    ('k3', '98.35,149.15', 'ПЕРЕНОС|ЗА ПЕРЕНОСОМ'),
    ('k4', '149.15,185.15;221.75,232.35', 'МИР МЕЧТЫ|НА 7-ЛЕТНЕЙ PS4'),
    ('k5', '232.35,283.55', 'МАШИНЫ ИСЧЕЗАЮТ,|ЕСЛИ ОТВЕРНУТЬСЯ'),
    ('k6', '283.55,331.05', '720P И МЕНЬШЕ|20 КАДРОВ'),
    ('k7', '331.05,404.95', 'ПОЧЕМУ НИКТО|НЕ ЗНАЛ ЗАРАНЕЕ'),
    ('k8', '404.95,446.75', 'ЗАЧЕМ ВЫПУСКАТЬ|ТАКОЕ НА PS4'),
    ('k9', '446.75,512.95', 'КАК КИБЕРПАНК|ПОЛУЧИЛ ВТОРОЙ ШАНС'),
    ('k10', '512.95,558.85', 'ГЛАВНЫЙ УРОК|КИБЕРПАНКА'),
]
shutil.rmtree(S, ignore_errors=True); os.makedirs(S + '/cyberpunk'); os.makedirs('public/media', exist_ok=True); os.makedirs('clips_src', exist_ok=True); os.makedirs('src/data', exist_ok=True)
js = open(f'{R}/cyberpunk/cyberpunk_v2.js').read()
js = js.replace('`/${clip}/', '`${clip}/')
js = js.replace("n.startsWith('/') ? n :", "n.includes('/') ? n :")   # пути из других папок не префиксовать   # кадры клипов — относительно сайта
js = re.sub(r"(['\"`])/(gta4_ps3|gta5_new|uncharted3|tlou2|rdr2|cyberpunk|node_modules|fonts)/", r"\1\2/", js)
left = re.findall(r"['\"`]/[a-z]", js); assert not left, left
open(f'{S}/cyberpunk/cyberpunk_v2.js', 'w').write(js)
html = open(f'{R}/cyberpunk/cyberpunk_v2.html').read()
html = html.replace("url('/node_modules/", "url('node_modules/").replace('src="cyberpunk_v2.js"', 'src="cyberpunk/cyberpunk_v2.js"')
html = html.replace('<style>', '<base href="../">\n<style>\n@font-face{font-family:\'Noto Color Emoji\';src:url(\'fonts/NotoColorEmoji.ttf\') format(\'truetype\')}', 1)
open(f'{S}/cyberpunk/cyberpunk_v2.html', 'w').write(html)
for f in ['words_full.json']: shutil.copy(f'{R}/cyberpunk/{f}', f'{S}/cyberpunk/')
for d in ['cyberpunk/assets', 'gta4_ps3/assets', 'gta5_new/assets', 'rdr2/assets', 'uncharted3/assets', 'tlou2/assets', 'gta4_ps3/tlou/assets']:
    if os.path.exists(f'{R}/{d}'): shutil.copytree(f'{R}/{d}', f'{S}/{d}')
os.makedirs(f'{S}/fonts'); shutil.copy('/usr/share/fonts/truetype/noto/NotoColorEmoji.ttf', f'{S}/fonts/')
for p in ['oswald/files/oswald-cyrillic-700-normal.woff2', 'oswald/files/oswald-latin-700-normal.woff2', 'montserrat/files/montserrat-latin-900-normal.woff2']:
    os.makedirs(os.path.dirname(f'{S}/node_modules/@fontsource/{p}'), exist_ok=True); shutil.copy(f'{R}/node_modules/@fontsource/{p}', f'{S}/node_modules/@fontsource/{p}')
# клипы: mp4 в размере и частоте движка (на компьютере режутся в кадры prepare-clips.mjs)
CLIPS = {f[:-4]: (f'cyberpunk/clips_src/{f}', None) for f in sorted(os.listdir(f'{R}/cyberpunk/clips_src')) if f.endswith('.mp4')}
for name, (src, vf) in CLIPS.items():
    if os.path.exists(f'clips_src/{name}.mp4'): continue
    if vf is None: shutil.copy(f'{R}/{src}', f'clips_src/{name}.mp4'); continue
    subprocess.run(['ffmpeg', '-nostdin', '-v', 'error', '-y', '-i', f'{R}/{src}', '-an', '-vf', vf, '-r', '30', '-c:v', 'libx264', '-crf', '17', '-pix_fmt', 'yuv420p', f'clips_src/{name}.mp4'], check=True)
for name, segs, hook in SHORTS:
    subprocess.run(['python3', f'{SH}/build_short.py', '--data', '--name', name, '--segs', segs, '--hook', hook, '--voice', f'{R}/cyberpunk/voice_v2.mp3', '--words', f'{R}/cyberpunk/words_full.json'], check=True)
    subprocess.run(['node', f'{SH}/framing.mjs', f'{SH}/tmp/{name}_data.json', '/cyberpunk/cyberpunk_v2.html'], cwd=R, check=True)
    shutil.copy(f'{SH}/tmp/{name}_data.json', f'src/data/{name}.json')
    subprocess.run(['ffmpeg', '-nostdin', '-v', 'error', '-y', '-i', f'{SH}/tmp/{name}_audio.wav', '-ar', '48000', '-c:a', 'aac', '-b:a', '256k', f'public/media/{name}_audio.m4a'], check=True)
print('site ok')
