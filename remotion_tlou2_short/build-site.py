# Проект Remotion для шортов The Last of Us Part II (9:16): страница движка ролика (tlou2), клипы, звук, субтитры
# (слова озвучки уже выровнены по сценарию) и кадрирование по сценам — всё помещается в вертикальный кадр.
#   python3 build-site.py
import os, re, shutil, subprocess
R = os.path.abspath('..'); S = 'public/site'; SH = f'{R}/gta6/shorts'; T = f'{R}/tlou2'
SHORTS = [  # имя, куски озвучки полного ролика (voice_raw.mp3), крючок
    ('t1', '0.6,52.25', 'THE LAST OF US 2|НА 7-ЛЕТНЕЙ КОНСОЛИ'),
    ('t2', '52.25,92.45', 'КАК РОДИЛАСЬ|ИСТОРИЯ МЕСТИ'),
    ('t3', '92.45,167.05', 'КАК ДВИГАЕТСЯ ЭЛЛИ|MOTION MATCHING'),
    ('t4', '167.05,232.55', 'ВРАГИ ЗНАЮТ|ИМЕНА ДРУГ ДРУГА'),
    ('t5', '232.55,304.55', 'ЗАГРУЗКИ, КОТОРЫХ|ВЫ НЕ ЗАМЕЧАЛИ'),
    ('t6', '304.55,343.45', 'ХИТРОСТИ ГРАФИКИ|THE LAST OF US 2'),
    ('t7', '343.45,384.35', 'САМАЯ ТЯЖЁЛАЯ РАБОТА|ЗВУК'),
    ('t8', '384.35,435.35', 'УТЕЧКА СЮЖЕТА|THE LAST OF US 2'),
    ('t9', '435.35,481.85', 'ИГРА, КОТОРАЯ|РАСКОЛОЛА ИГРОКОВ'),
]
shutil.rmtree(S, ignore_errors=True); os.makedirs(S + '/tlou2'); os.makedirs('public/media', exist_ok=True); os.makedirs('clips_src', exist_ok=True); os.makedirs('src/data', exist_ok=True)
js = open(f'{T}/tlou2.js').read()
js = js.replace("n.startsWith('/') ? n : `/uncharted3/assets/${n}`", "n.includes('/') ? n : `uncharted3/assets/${n}`")
js = js.replace('`/${clip}/', '`${clip}/')
js = re.sub(r"(['\"`])/(tlou2|rdr2|gta4_ps3|uncharted3|cyberpunk|gta5_new|node_modules|fonts)/", r"\1\2/", js)
left = re.findall(r"['\"`]/[a-z]", js); assert not left, left
open(f'{S}/tlou2/tlou2.js', 'w').write(js)
html = open(f'{T}/tlou2.html').read()
html = html.replace("url('/node_modules/", "url('node_modules/")
html = html.replace('<style>', '<base href="../">\n<style>\n@font-face{font-family:\'Noto Color Emoji\';src:url(\'fonts/NotoColorEmoji.ttf\') format(\'truetype\')}', 1)
html = html.replace('src="tlou2.js"', 'src="tlou2/tlou2.js"')
open(f'{S}/tlou2/tlou2.html', 'w').write(html)
shutil.copy(f'{T}/words.json', f'{S}/tlou2/')
for d in ['tlou2/assets', 'rdr2/assets', 'gta4_ps3/assets', 'gta4_ps3/tlou/assets', 'uncharted3/assets', 'cyberpunk/assets']:
    if os.path.exists(f'{R}/{d}'): shutil.copytree(f'{R}/{d}', f'{S}/{d}')
os.makedirs(f'{S}/fonts'); shutil.copy('/usr/share/fonts/truetype/noto/NotoColorEmoji.ttf', f'{S}/fonts/')
for p in ['oswald/files/oswald-cyrillic-700-normal.woff2', 'oswald/files/oswald-latin-700-normal.woff2', 'montserrat/files/montserrat-latin-900-normal.woff2']:
    os.makedirs(os.path.dirname(f'{S}/node_modules/@fontsource/{p}'), exist_ok=True); shutil.copy(f'{R}/node_modules/@fontsource/{p}', f'{S}/node_modules/@fontsource/{p}')
for f in os.listdir(f'{T}/clips_src'):
    if not os.path.exists(f'clips_src/{f}'): shutil.copy(f'{T}/clips_src/{f}', 'clips_src/')
for name, segs, hook in SHORTS:
    subprocess.run(['python3', f'{SH}/build_short.py', '--data', '--name', name, '--segs', segs, '--hook', hook, '--voice', f'{T}/voice_raw.mp3', '--words', f'{T}/words.json'], check=True)
    subprocess.run(['node', f'{SH}/framing.mjs', f'{SH}/tmp/{name}_data.json', '/tlou2/tlou2.html'], cwd=R, check=True)
    shutil.copy(f'{SH}/tmp/{name}_data.json', f'src/data/{name}.json')
    subprocess.run(['ffmpeg', '-nostdin', '-v', 'error', '-y', '-i', f'{SH}/tmp/{name}_audio.wav', '-ar', '48000', '-c:a', 'aac', '-b:a', '256k', f'public/media/{name}_audio.m4a'], check=True)
print('site ok')
