# Собирает public/site из исходников основного репозитория: страница движка TLOU2 с относительными путями,
# картинки, шрифты (включая эмодзи), клипы mp4 (в кадры их режет prepare-clips.mjs), озвучка и реклама.
import os, re, shutil, subprocess
R = os.path.abspath('..'); S = 'public/site'
shutil.rmtree('public', ignore_errors=True); os.makedirs(S + '/tlou2'); os.makedirs('public/media'); os.makedirs('clips_src', exist_ok=True)
js = open(f'{R}/tlou2/tlou2.js').read()
# абсолютные пути -> относительные (страница получает <base href="../">, то есть корень сайта)
js = js.replace("n.startsWith('/') ? n : `/uncharted3/assets/${n}`", "n.includes('/') ? n : `uncharted3/assets/${n}`")
js = js.replace('`/${clip}/', '`${clip}/')
js = re.sub(r"(['\"`])/(tlou2|rdr2|gta4_ps3|uncharted3|cyberpunk|gta5_new|node_modules|fonts)/", r"\1\2/", js)
left = re.findall(r"['\"`]/[a-z]", js)
assert not left, left
open(f'{S}/tlou2/tlou2.js', 'w').write(js)
html = open(f'{R}/tlou2/tlou2.html').read()
html = html.replace("url('/node_modules/", "url('node_modules/")
html = html.replace('<style>', '<base href="../">\n<style>\n@font-face{font-family:\'Noto Color Emoji\';src:url(\'fonts/NotoColorEmoji.ttf\') format(\'truetype\')}', 1)
html = html.replace('src="tlou2.js"', 'src="tlou2/tlou2.js"')
open(f'{S}/tlou2/tlou2.html', 'w').write(html)
shutil.copy(f'{R}/tlou2/words.json', f'{S}/tlou2/')
for d in ['tlou2/assets', 'rdr2/assets', 'gta4_ps3/assets', 'gta4_ps3/tlou/assets', 'uncharted3/assets', 'cyberpunk/assets']: shutil.copytree(f'{R}/{d}', f'{S}/{d}')
os.makedirs(f'{S}/fonts'); shutil.copy('/usr/share/fonts/truetype/noto/NotoColorEmoji.ttf', f'{S}/fonts/')
for p in ['oswald/files/oswald-cyrillic-700-normal.woff2', 'oswald/files/oswald-latin-700-normal.woff2', 'montserrat/files/montserrat-latin-900-normal.woff2']:
    os.makedirs(os.path.dirname(f'{S}/node_modules/@fontsource/{p}'), exist_ok=True); shutil.copy(f'{R}/node_modules/@fontsource/{p}', f'{S}/node_modules/@fontsource/{p}')
for f in os.listdir(f'{R}/tlou2/clips_src'): shutil.copy(f'{R}/tlou2/clips_src/{f}', 'clips_src/')
shutil.copy(f'{R}/tlou2/voice_raw.mp3', 'public/media/voice.mp3')
shutil.copy(f'{R}/gta4_ps3/out/tlou2_ggsel_integration.mp4', 'public/media/')
print('site ok')
