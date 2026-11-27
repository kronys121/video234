# Проект Remotion для шортов GTA San Andreas (9:16): страница движка ролика (gta_sa), клипы, звук, субтитры (правильный текст,
# выровненный по озвучке) и кадрирование по сценам — всё помещается в вертикальный кадр.
#   python3 build-site.py
import json, os, re, shutil, subprocess
R = os.path.abspath('..'); S = 'public/site'; SH = f'{R}/gta6/shorts'; SA = f'{R}/gta_sa'
SHORTS = [  # имя, куски озвучки полного ролика (gta_sa_voice_main.mp3), крючок
    ('sa1', '0.0,20.75;50.25,90.45', 'SAN ANDREAS НА 32 МБ|КАК ЭТО ВОЗМОЖНО'),
    ('sa2', '90.55,141.75', 'КАК PS2 ГРУЗИЛА|ЦЕЛЫЙ ШТАТ'),
    ('sa3', '141.75,197.35', 'ЖЁЛТЫЙ ТУМАН|ПРЯТАЛ КРАЙ МИРА'),
    ('sa4', '197.45,273.35', 'КАРТА SAN ANDREAS|МЕНЬШЕ, ЧЕМ КАЖЕТСЯ'),
    ('sa5', '273.55,339.55', 'ВСЁ В ОДНОЙ ИГРЕ|НА 32 МБ ПАМЯТИ'),
    ('sa6', '339.55,379.75', 'CJ ТОЛСТЕЕТ|И КАЧАЕТСЯ'),
    ('sa7', '379.75,439.45', 'СКАНДАЛ|HOT COFFEE'),
]
# --- страница движка с относительными путями (как в remotion_sa)
shutil.rmtree(S, ignore_errors=True); os.makedirs(S + '/gta_sa'); os.makedirs('public/media', exist_ok=True); os.makedirs('clips_src', exist_ok=True); os.makedirs('src/data', exist_ok=True)
js = open(f'{SA}/gta_sa.js').read()
js = js.replace("n.startsWith('/') ? n : `/uncharted3/assets/${n}`", "n.includes('/') ? n : `uncharted3/assets/${n}`")
js = js.replace('`/${clip}/', '`${clip}/')
js = re.sub(r"(['\"`])/(tlou2|rdr2|gta4_ps3|uncharted3|cyberpunk|gta5_new|gta_sa|node_modules|fonts)/", r"\1\2/", js)
left = re.findall(r"['\"`]/[a-z]", js); assert not left, left
open(f'{S}/gta_sa/gta_sa.js', 'w').write(js)
html = open(f'{SA}/gta_sa.html').read()
html = html.replace("url('/node_modules/", "url('node_modules/").replace('src="gta_sa.js"', 'src="gta_sa/gta_sa.js"')
html = html.replace('<style>', '<base href="../">\n<style>\n@font-face{font-family:\'Noto Color Emoji\';src:url(\'fonts/NotoColorEmoji.ttf\') format(\'truetype\')}', 1)
open(f'{S}/gta_sa/gta_sa.html', 'w').write(html)
os.makedirs(f'{S}/gta_sa/voice'); shutil.copy(f'{SA}/voice/words.json', f'{S}/gta_sa/voice/')
for d in ['gta_sa/assets', 'tlou2/assets', 'rdr2/assets', 'gta4_ps3/assets', 'gta4_ps3/tlou/assets', 'uncharted3/assets', 'cyberpunk/assets']:
    if os.path.exists(f'{R}/{d}'): shutil.copytree(f'{R}/{d}', f'{S}/{d}')
os.makedirs(f'{S}/fonts'); shutil.copy('/usr/share/fonts/truetype/noto/NotoColorEmoji.ttf', f'{S}/fonts/')
for p in ['oswald/files/oswald-cyrillic-700-normal.woff2', 'oswald/files/oswald-latin-700-normal.woff2', 'montserrat/files/montserrat-latin-900-normal.woff2']:
    os.makedirs(os.path.dirname(f'{S}/node_modules/@fontsource/{p}'), exist_ok=True); shutil.copy(f'{R}/node_modules/@fontsource/{p}', f'{S}/node_modules/@fontsource/{p}')
# --- клипы: берём готовые mp4 из remotion_sa (или собираем из кадров)
for k in sorted(os.listdir(f'{SA}/clips')):
    out = f'clips_src/{k}.mp4'
    if os.path.exists(out): continue
    if os.path.exists(f'{R}/remotion_sa/clips_src/{k}.mp4'): shutil.copy(f'{R}/remotion_sa/clips_src/{k}.mp4', out); continue
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-framerate', '30', '-i', f'{SA}/clips/{k}/%04d.jpg', '-c:v', 'libx264', '-crf', '16', '-pix_fmt', 'yuv420p', out], check=True)
# --- данные шортов: субтитры, звук, кадрирование
for name, segs, hook in SHORTS:
    subprocess.run(['python3', f'{SH}/build_short.py', '--data', '--name', name, '--segs', segs, '--hook', hook, '--voice', f'{SA}/voice/gta_sa_voice_main.mp3',
                    '--words', f'{SA}/voice/words.json', '--text', f'{SA}/shorts/{name}.txt'], check=True)
    subprocess.run(['node', f'{SH}/framing.mjs', f'{SH}/tmp/{name}_data.json', '/gta_sa/gta_sa.html'], cwd=R, check=True)
    shutil.copy(f'{SH}/tmp/{name}_data.json', f'src/data/{name}.json')
    subprocess.run(['ffmpeg', '-nostdin', '-v', 'error', '-y', '-i', f'{SH}/tmp/{name}_audio.wav', '-ar', '48000', '-c:a', 'aac', '-b:a', '256k', f'public/media/{name}_audio.m4a'], check=True)
print('site ok')
