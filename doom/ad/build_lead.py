# Реклама ggsel для Crysis (длинная подводка, голос ad_voice.mp3):
# подводка lead.html (13,35 с) + основной блок ggsel из gta6/ad/gta6_ggsel_music.mp4 с 11,80 с (там «По ссылке в описании…»).
# Музыка под подводкой — тот же трек, что и под блоком, без стыка.
#   python3 doom/ad/build_lead.py   (из корня репо; кадры подводки рендерит gta4_ps3/render.mjs)
import json, os, subprocess, numpy as np
R = os.path.abspath(os.path.join(os.path.dirname(__file__), '../..')); A = f'{R}/doom/ad'; G = f'{R}/gta6'
SR = 48000; LEAD = 13.35; BODY_FROM = 11.80
def load(p, ss=0, t=None):
    raw = subprocess.check_output(['ffmpeg', '-v', 'error', '-ss', str(ss), '-i', p, *(['-t', str(t)] if t else []), '-f', 'f32le', '-ac', '2', '-ar', str(SR), '-'])
    return np.frombuffer(raw, np.float32).reshape(-1, 2).copy()
rms = lambda x: np.sqrt((x ** 2).mean())
# голос: громкость как у голоса в блоке ggsel
v = load(f'{A}/ad_voice.mp3')[:int(LEAD * SR)]
ref = load(f'{G}/ad/gta6_ggsel.mp4', BODY_FROM, 20)
act = lambda x: x[np.abs(x.mean(1)) > 0.01]
v *= rms(act(ref)) / rms(act(v)) * 10 ** (2.4 / 20)   # +2,4 дБ: по LUFS подводка выходила тише блока
n = int(LEAD * SR); out = np.zeros((n, 2), np.float32); out[:len(v)] += v
# музыка: та же склейка треков, что в build_audio.py GTA 6, отрезок прямо перед BODY_FROM рекламного блока
tracks = ['Electro Cabello.mp3', 'Cut and Run.mp3', 'Getting it Done.mp3', 'Raving Energy.mp3']
AD_AT = round(json.load(open(f'{G}/ad/placement.json'))['insert_at'] * 60) / 60
need = int((6.653 - 4.84 + AD_AT + BODY_FROM + 1) * SR); mus = np.zeros((0, 2), np.float32); XF = 2 * SR
for tr in tracks:
    m = load(f'{G}/music/{tr}'); m = m / (np.abs(m).max() + 1e-9)
    if len(mus) == 0: mus = m
    else: r = np.linspace(0, 1, XF)[:, None]; mus = np.concatenate([mus[:-XF], mus[-XF:] * (1 - r) + m[:XF] * r, m[XF:]])
    if len(mus) > need: break
mus = mus[int((6.653 - 4.84) * SR):]
i0 = int((AD_AT + BODY_FROM - LEAD) * SR); seg = mus[i0:i0 + n]
t = np.arange(n) / SR
g = 10 ** (-24 / 20) * np.clip(t / 0.4, 0, 1)
out += seg * g[:, None]
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-f', 'f32le', '-ar', str(SR), '-ac', '2', '-i', '-', '-c:a', 'pcm_s16le', f'{R}/gta4_ps3/doomlead_audio.wav'],
               input=np.clip(out, -1, 1).astype(np.float32).tobytes(), check=True)
# видео подводки
env = dict(os.environ, PAGE='../doom/ad/lead.html', FPS='60', SUB='2', FRAMES='frames_doomlead', AUDIO='doomlead_audio.wav', OUT='doom_lead.mp4', CRF='16')
subprocess.run(['rm', '-rf', f'{R}/gta4_ps3/frames_doomlead'])
subprocess.run(['node', 'gta4_ps3/render.mjs', 'video', '4', str(LEAD)], cwd=R, env=env, check=True)
# подводка + блок
# звук подводки берём из wav напрямую (в mp4 рендера есть затухание в конце — дало бы провал на стыке)
subprocess.run(['ffmpeg', '-nostdin', '-v', 'error', '-y', '-i', f'{R}/gta4_ps3/out/doom_lead.mp4', '-i', f'{R}/gta4_ps3/doomlead_audio.wav', '-ss', str(BODY_FROM), '-i', f'{G}/ad/gta6_ggsel_music.mp4',
                '-filter_complex', '[0:v]fps=60,format=yuv420p,setsar=1[v0];[2:v]fps=60,format=yuv420p,setsar=1,scale=1920:1080[v1];'
                '[1:a]aresample=48000,aformat=channel_layouts=stereo[a0];[2:a]aresample=48000,aformat=channel_layouts=stereo[a1];[v0][a0][v1][a1]concat=n=2:v=1:a=1[v][a]',
                '-map', '[v]', '-map', '[a]', '-c:v', 'libx264', '-preset', 'slow', '-crf', '17', '-pix_fmt', 'yuv420p', '-r', '60', '-c:a', 'aac', '-b:a', '256k', '-movflags', '+faststart',
                f'{A}/doom_ggsel.mp4'], check=True)
subprocess.run(['rm', '-rf', f'{R}/gta4_ps3/frames_doomlead'])
print('ok', f'{A}/doom_ggsel.mp4')
