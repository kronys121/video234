# Звук ролика GTA 6: голос + музыка (Kevin MacLeod, CC BY 4.0) + записанные эффекты (CC0) на появление объектов.
# Реклама ggsel вставляется на 174.86 с (музыка на время рекламы замолкает). -> v/mix_full.wav
import json, os, subprocess, numpy as np
HERE = os.path.dirname(os.path.abspath(__file__)); G = os.path.dirname(HERE)
SR = 48000
def load(p):
    raw = subprocess.check_output(['ffmpeg', '-v', 'error', '-i', p, '-f', 'f32le', '-ac', '2', '-ar', str(SR), '-'])
    return np.frombuffer(raw, dtype=np.float32).reshape(-1, 2).copy()
voice = load(f'{G}/voice/gta6_voice_main.mp3')
N = len(voice) + SR
out = np.zeros((N, 2), np.float32); out[:len(voice)] += voice
# --- музыка: три трека подряд с перекрёстным затуханием
tracks = ['Funkorama.mp3', 'Groove Grove.mp3', 'Backbay Lounge.mp3']
mus = np.zeros((0, 2), np.float32); XF = 3 * SR
for tr in tracks:
    m = load(f'{G}/music/{tr}'); m = m / (np.abs(m).max() + 1e-9)
    if len(mus) == 0: mus = m
    else:
        r = np.linspace(0, 1, XF)[:, None]
        mus = np.concatenate([mus[:-XF], mus[-XF:] * (1 - r) + m[:XF] * r, m[XF:]])
mus = mus[:N]
g = np.full(len(mus), 10 ** (-24 / 20), np.float32)
t = np.arange(len(mus)) / SR
g *= np.clip(t / 1.5, 0, 1)                                  # плавный вход
g *= np.clip((len(voice) / SR + 0.8 - t) / 2.5, 0, 1)        # затухание в конце
out[:len(mus)] += mus * g[:, None]
# --- эффекты
S = f'{G}/../gta_sa/teaser2/sfx_src'
cache = {}
def sfx(name, at, db):
    if name not in cache:
        s = load(f'{S}/{name}'); cache[name] = s / (np.abs(s).max() + 1e-9)
    s = cache[name] * 10 ** (db / 20); i = int(max(0, at) * SR); n = min(len(s), N - i)
    if n > 0: out[i:i + n] += s[:n]
sc = json.load(open(f'{HERE}/scenes.json'))
last = -1; cnt = 0
POP = ['bsb/2821.mp3', 'bsb/1735.mp3']; SW = [f'swishes/swishes/swish-{k}.wav' for k in (1, 3, 4, 5, 6, 8, 9, 10, 11, 2, 7, 12, 13)]
for k, s in enumerate(sc):
    if k > 0: sfx(['bsb/1797.mp3', 'bsb/1798.mp3', 'bsb/1800.mp3'][k % 3], s['t0'] - 0.18, -31)
    for it in s['items']:
        ts = []
        if it['k'] in ('icons', 'stars'):
            ts = it.get('times') or [it['at'] + i * (it.get('step') or 0.3) for i in range(it.get('n') or 5)]
            for j, tt in enumerate(ts): sfx(POP[j % 2], tt, -27); cnt += 1
            continue
        if it['k'] == 'x': sfx('bsb/1742.mp3', it['at'], -25); cnt += 1; continue
        if it['k'] == 'check': sfx('bsb/1735.mp3', it['at'], -24); cnt += 1; continue
        en = it.get('en')
        if en in ('left', 'right', 'zoom') and it['at'] - last > 0.15:
            sfx(SW[cnt % len(SW)], it['at'] - 0.02, -27); last = it['at']; cnt += 1
        elif en in ('pop', 'spin', 'drop', 'rise') and it['at'] - last > 0.15:
            sfx(POP[cnt % 2], it['at'], -28); last = it['at']; cnt += 1
print('sfx', cnt)
# --- вставка рекламы
AD_AT = json.load(open(f'{G}/ad/placement.json'))['insert_at']
ad = load(f'{G}/ad/gta6_ggsel.mp4')
i = int(round(AD_AT * 30) / 30 * SR)   # по границе кадра 30 к/с
full = np.concatenate([out[:i], ad, out[i:len(voice) + int(0.5 * SR)]])
full = np.clip(full, -1, 1)
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-f', 'f32le', '-ar', str(SR), '-ac', '2', '-i', '-', '-af', 'alimiter=limit=0.95', '-c:a', 'pcm_s16le', f'{HERE}/mix_full.wav'],
               input=full.astype(np.float32).tobytes(), check=True)
print('ok', len(full) / SR, 'ad at frame', round(AD_AT * 30), len(ad) / SR)
