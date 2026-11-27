# Звук ролика Doom (общая шкала ролика с рекламой): голос + реклама + динамичная музыка без пауз
# (Kevin MacLeod, CC BY 4.0, приглушается под речью) + записанные эффекты (CC0) на появление объектов.
#   python3 build_audio.py -> v/mix_full.wav, v/ad_with_music.wav
import json, os, subprocess, numpy as np
AD_FRAMES = 2390   # doom_ggsel.mp4: 39,83 с
HERE = os.path.dirname(os.path.abspath(__file__)); G = os.path.dirname(HERE)
SR = 48000
M = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), '..', 'gta6', 'music')
def load(p):
    raw = subprocess.check_output(['ffmpeg', '-v', 'error', '-i', p, '-f', 'f32le', '-ac', '2', '-ar', str(SR), '-'])
    return np.frombuffer(raw, dtype=np.float32).reshape(-1, 2).copy()
voice = load(f'{G}/voice/voice_final.mp3')
AD_AT = round(json.load(open(f'{G}/ad/placement.json'))['insert_at'] * 60) / 60   # по границе кадра 60 к/с
ad = load(f'{G}/ad/doom_ggsel.mp4')   # в рекламе уже есть своя музыка
ad *= 10 ** (-3.5 / 20)   # реклама была на 3,5 дБ громче голоса ролика
AD = AD_FRAMES / 60; ad = np.pad(ad, ((0, max(0, int(AD * SR) - len(ad))), (0, 0)))[:int(AD * SR)]
i0 = int(round(AD_AT * SR)); iA = len(ad)
def T(t): return t + (AD if t >= AD_AT else 0)        # время ролика без рекламы -> время итогового ролика
speech = np.concatenate([voice[:i0], ad, voice[i0:]])
N = len(speech) + SR
out = np.zeros((N, 2), np.float32); out[:len(speech)] += speech
# --- музыка: динамичные треки подряд, перекрёстное затухание 2 с
tracks = ['Electro Cabello.mp3', 'Cut and Run.mp3', 'Getting it Done.mp3', 'Raving Energy.mp3']
mus = np.zeros((0, 2), np.float32); XF = 2 * SR
for tr in tracks:
    m = load(f'{M}/{tr}'); m = m / (np.abs(m).max() + 1e-9)
    if len(mus) == 0: mus = m
    else:
        r = np.linspace(0, 1, XF)[:, None]; mus = np.concatenate([mus[:-XF], mus[-XF:] * (1 - r) + m[:XF] * r, m[XF:]])
    if len(mus) > N: break
# музыка с начала первого трека
MUS_OFF = 0.0
mus = mus[int(MUS_OFF * SR):][:N]
# приглушение под речью: огибающая речи (окно 40 мс), атака 60 мс, отпускание 400 мс
mono = np.abs(speech.mean(1)); win = int(0.04 * SR)
env = np.sqrt(np.convolve(mono ** 2, np.ones(win) / win, mode='same'))
act = (env > 10 ** (-38 / 20)).astype(np.float32)
hop = 480; a = act[::hop]; sm = np.zeros_like(a); k_at, k_rel = 1 - np.exp(-hop / (0.06 * SR)), 1 - np.exp(-hop / (0.4 * SR))
for j in range(1, len(a)): sm[j] = sm[j - 1] + (a[j] - sm[j - 1]) * (k_at if a[j] > sm[j - 1] else k_rel)
duck = np.interp(np.arange(N), np.arange(len(sm)) * hop, sm)
gdb = -17 - 7 * duck                                       # -17 дБ в паузах, -24 дБ под речью
g = (10 ** (gdb / 20)).astype(np.float32)
t = np.arange(N) / SR; END = len(speech) / SR
g *= np.clip(t / 1.0, 0, 1) * np.clip((END + 1.0 - t) / 3.0, 0, 1)
# под рекламой основная музыка уходит (в рекламе своя), плавно за 0,4 с
A0, A1 = AD_AT, AD_AT + AD
g *= 1 - np.clip(np.minimum((t - (A0 - 0.4)) / 0.4, ((A1 + 0.4) - t) / 0.4), 0, 1)
out += mus * g[:, None]
# --- эффекты (время сцен переводим на шкалу с рекламой)
S = f'{G}/../gta_sa/teaser2/sfx_src'; cache = {}
def sfx(name, at, db):
    if name not in cache:
        s = load(f'{S}/{name}'); cache[name] = s / (np.abs(s).max() + 1e-9)
    s = cache[name] * 10 ** (db / 20); i = int(max(0, T(at)) * SR); n = min(len(s), N - i)
    if n > 0: out[i:i + n] += s[:n]
sc = json.load(open(f'{HERE}/scenes.json'))
last = -1; cnt = 0
POP = ['bsb/2821.mp3', 'bsb/1735.mp3']; SW = [f'swishes/swishes/swish-{k}.wav' for k in (1, 3, 4, 5, 6, 8, 9, 10, 11, 2, 7, 12, 13)]
for k, s in enumerate(sc):
    if k > 0: sfx(['bsb/1797.mp3', 'bsb/1798.mp3', 'bsb/1800.mp3'][k % 3], s['t0'] - 0.18, -30)
    for it in s['items']:
        if it['k'] in ('icons', 'stars'):
            ts = it.get('times') or [it['at'] + i * (it.get('step') or 0.3) for i in range(it.get('n') or 5)]
            for j, tt in enumerate(ts): sfx(POP[j % 2], tt, -26); cnt += 1
            continue
        if it['k'] == 'x': sfx('bsb/1742.mp3', it['at'], -24); cnt += 1; continue
        if it['k'] == 'check': sfx('bsb/1735.mp3', it['at'], -23); cnt += 1; continue
        en = it.get('en')
        if en in ('left', 'right', 'zoom') and it['at'] - last > 0.15:
            sfx(SW[cnt % len(SW)], it['at'] - 0.02, -26); last = it['at']; cnt += 1
        elif en in ('pop', 'spin', 'drop', 'rise') and it['at'] - last > 0.15:
            sfx(POP[cnt % 2], it['at'], -27); last = it['at']; cnt += 1
full = out[:len(speech) + int(0.6 * SR)]
def wr(a, path, extra=()):
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-f', 'f32le', '-ar', str(SR), '-ac', '2', '-i', '-', *extra, '-c:a', 'pcm_s16le', path], input=np.clip(a, -1, 1).astype(np.float32).tobytes(), check=True)
wr(full, f'{HERE}/mix_full.wav', ['-af', 'alimiter=limit=0.9'])
print('sfx', cnt, 'длина', round(len(full) / SR, 2), 'реклама', round(AD_AT, 3), '+', round(AD, 3))
