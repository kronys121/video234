# Проект Remotion для шортов «GTA 5 на PS3» (9:16): страница движка ролика (gta5_new), клипы, звук, субтитры
# (слова из посимвольных таймингов озвучки — текст точный) и кадрирование по сценам.
#   python3 build-site.py
import os, re, shutil, subprocess
R = os.path.abspath('..'); S = 'public/site'; SH = f'{R}/gta6/shorts'; G = f'{R}/gta5_new'
SHORTS = [  # имя, куски озвучки полного ролика (audio.mp3), крючок
    ('g1', '0.0,52.3', 'GTA 5 НА PS3|НАСТОЯЩЕЕ БЕЗУМИЕ'),
    ('g2', '52.3,117.8', 'КАК КАРТА GTA 5|ВЛЕЗЛА В PS3'),
    ('g3', '117.8,191.8', 'ПРОЦЕССОР CELL|БОСС И РАБОЧИЕ'),
    ('g4', '191.8,254.2', 'ДВА КРАНА|ДЛЯ ОДНОГО ВЕДРА'),
    ('g5', '254.2,292.9', 'ПАМЯТЬ PS3|РАЗЛОЖЕНА ПО КОРОБКАМ'),
    ('g6', '292.9,372.95', 'КАК GTA 5 ПРЯЧЕТ|ЭКРАН ЗАГРУЗКИ'),
    ('g7', '372.95,420.4', 'ЖИВОЙ МИР|НА 256 МБ'),
    ('g8', '420.4,479.45', 'GTA 5 ЗНАЕТ,|КУДА ВЫ ПОЕДЕТЕ'),
    ('g9', '479.45,554.2', '720P И 30 FPS|ЦЕНА ЧУДА'),
    ('g10', '562.4,640.3', 'ПОЧЕМУ В GTA 5|ИГРАЮТ ДО СИХ ПОР'),
]
shutil.rmtree(S, ignore_errors=True); os.makedirs(S + '/gta5_new'); os.makedirs('public/media', exist_ok=True); os.makedirs('clips_src', exist_ok=True); os.makedirs('src/data', exist_ok=True)
js = open(f'{G}/gta5.js').read()
js = js.replace("n.startsWith('/') ? n : `/gta5_new/assets/${n}`", "n.includes('/') ? n : `gta5_new/assets/${n}`")
js = re.sub(r"(['\"`])/(gta5_new|gta4_ps3|uncharted3|tlou2|rdr2|cyberpunk|node_modules|fonts)/", r"\1\2/", js)
left = re.findall(r"['\"`]/[a-z]", js); assert not left, left
open(f'{S}/gta5_new/gta5.js', 'w').write(js)
html = open(f'{G}/gta5.html').read()
html = html.replace("url('/node_modules/", "url('node_modules/").replace('src="gta5.js"', 'src="gta5_new/gta5.js"')
html = html.replace('<style>', '<base href="../">\n<style>\n@font-face{font-family:\'Noto Color Emoji\';src:url(\'fonts/NotoColorEmoji.ttf\') format(\'truetype\')}', 1)
open(f'{S}/gta5_new/gta5.html', 'w').write(html)
for d in ['gta5_new/assets', 'gta4_ps3/assets']: shutil.copytree(f'{R}/{d}', f'{S}/{d}')
os.makedirs(f'{S}/fonts'); shutil.copy('/usr/share/fonts/truetype/noto/NotoColorEmoji.ttf', f'{S}/fonts/')
for p in ['oswald/files/oswald-cyrillic-700-normal.woff2', 'oswald/files/oswald-latin-700-normal.woff2', 'montserrat/files/montserrat-latin-900-normal.woff2']:
    os.makedirs(os.path.dirname(f'{S}/node_modules/@fontsource/{p}'), exist_ok=True); shutil.copy(f'{R}/node_modules/@fontsource/{p}', f'{S}/node_modules/@fontsource/{p}')
# клипы: mp4 сразу в размере и частоте движка (кадры 30 к/с, 960x540; switch — 800x450)
for f in os.listdir(f'{G}/clips'):
    if not f.endswith('.mp4') or os.path.exists(f'clips_src/{f}'): continue
    sc = '800:450' if f == 'switch.mp4' else '960:540'
    subprocess.run(['ffmpeg', '-nostdin', '-v', 'error', '-y', '-i', f'{G}/clips/{f}', '-an', '-vf', f'scale={sc}', '-r', '30', '-c:v', 'libx264', '-crf', '18', '-pix_fmt', 'yuv420p', f'clips_src/{f}'], check=True)
for name, segs, hook in SHORTS:
    subprocess.run(['python3', f'{SH}/build_short.py', '--data', '--name', name, '--segs', segs, '--hook', hook, '--voice', f'{G}/audio.mp3', '--words', f'{G}/words.json'], check=True)
    subprocess.run(['node', f'{SH}/framing.mjs', f'{SH}/tmp/{name}_data.json', '/gta5_new/gta5.html'], cwd=R, check=True)
    shutil.copy(f'{SH}/tmp/{name}_data.json', f'src/data/{name}.json')
    subprocess.run(['ffmpeg', '-nostdin', '-v', 'error', '-y', '-i', f'{SH}/tmp/{name}_audio.wav', '-ar', '48000', '-c:a', 'aac', '-b:a', '256k', f'public/media/{name}_audio.m4a'], check=True)
print('site ok')
