# Собирает public/site из исходников основного репозитория: страница GTA SA с относительными путями,
# картинки, шрифты (включая эмодзи), клипы mp4 (в кадры их режет prepare-clips.mjs), озвучка и реклама.
import os, re, shutil, subprocess
R = os.path.abspath('..'); S = 'public/site'
shutil.rmtree('public', ignore_errors=True); os.makedirs(S + '/gta_sa/voice'); os.makedirs('public/media'); os.makedirs('clips_src', exist_ok=True)
js = open(f'{R}/gta_sa/gta_sa.js').read()
js = js.replace("n.startsWith('/') ? n : `/uncharted3/assets/${n}`", "n.includes('/') ? n : `uncharted3/assets/${n}`")
js = js.replace('`/${clip}/', '`${clip}/')
js = re.sub(r"(['\"`])/(tlou2|rdr2|gta4_ps3|uncharted3|cyberpunk|gta5_new|gta_sa|node_modules|fonts)/", r"\1\2/", js)
left = re.findall(r"['\"`]/[a-z]", js); assert not left, left
open(f'{S}/gta_sa/gta_sa.js', 'w').write(js)
html = open(f'{R}/gta_sa/gta_sa.html').read()
html = html.replace("url('/node_modules/", "url('node_modules/").replace('src="gta_sa.js"', 'src="gta_sa/gta_sa.js"')
html = html.replace('<style>', '<base href="../">\n<style>\n@font-face{font-family:\'Noto Color Emoji\';src:url(\'fonts/NotoColorEmoji.ttf\') format(\'truetype\')}', 1)
open(f'{S}/gta_sa/gta_sa.html', 'w').write(html)
shutil.copy(f'{R}/gta_sa/voice/words.json', f'{S}/gta_sa/voice/')
for d in ['gta_sa/assets', 'tlou2/assets', 'rdr2/assets', 'gta4_ps3/assets', 'gta4_ps3/tlou/assets', 'uncharted3/assets', 'cyberpunk/assets']: shutil.copytree(f'{R}/{d}', f'{S}/{d}')
os.makedirs(f'{S}/fonts'); shutil.copy('/usr/share/fonts/truetype/noto/NotoColorEmoji.ttf', f'{S}/fonts/')
for p in ['oswald/files/oswald-cyrillic-700-normal.woff2', 'oswald/files/oswald-latin-700-normal.woff2', 'montserrat/files/montserrat-latin-900-normal.woff2']:
    os.makedirs(os.path.dirname(f'{S}/node_modules/@fontsource/{p}'), exist_ok=True); shutil.copy(f'{R}/node_modules/@fontsource/{p}', f'{S}/node_modules/@fontsource/{p}')
# клипы: кадры -> короткие mp4 (на компьютере пользователя снова режутся в кадры)
for k in sorted(os.listdir(f'{R}/gta_sa/clips')):
    out = f'clips_src/{k}.mp4'
    if not os.path.exists(out):
        subprocess.run(['ffmpeg', '-v', 'error', '-y', '-framerate', '30', '-i', f'{R}/gta_sa/clips/{k}/%04d.jpg', '-c:v', 'libx264', '-crf', '16', '-pix_fmt', 'yuv420p', out], check=True)
shutil.copy(f'{R}/gta_sa/voice/gta_sa_voice_main.mp3', 'public/media/voice.mp3')
shutil.copy(f'{R}/gta_sa/ad/ad_final_user.mp4', 'public/media/gta_sa_ggsel.mp4')
print('site ok')
