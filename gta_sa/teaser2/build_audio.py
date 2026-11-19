# Звук тизера v2: голос автора (фразы из основного ролика) + музыка Kevin MacLeod «Funkorama» (CC BY 4.0)
# + записанные SFX (BigSoundBank CC0, OpenGameArt CC0). Пишет mix.wav и timeline.json (тайминги слов в ролике).
import json, os, subprocess, numpy as np
HERE = os.path.dirname(os.path.abspath(__file__)); SR = 48000; DUR = 30.0
def load(p, mono=False):
    raw = subprocess.check_output(['ffmpeg', '-v', 'error', '-i', p, '-f', 'f32le', '-ac', '1' if mono else '2', '-ar', str(SR), '-'])
    a = np.frombuffer(raw, dtype=np.float32)
    return a if mono else a.reshape(-1, 2)
voice = load(os.path.join(HERE, '../voice/gta_sa_voice_main.mp3'))
words = json.load(open(os.path.join(HERE, '../voice/words.json')))

def quiet_point(t0, t1):
    """самая тихая точка (окно 20 мс) между t0 и t1 в исходной озвучке"""
    i0, i1 = int(t0 * SR), int(t1 * SR); w = int(0.02 * SR)
    m = np.abs(voice[i0:i1].mean(1)); best, bi = 1e9, i0
    for i in range(0, len(m) - w, int(0.004 * SR)):
        e = (m[i:i + w] ** 2).mean()
        if e < best: best, bi = e, i0 + i + w // 2
    return bi / SR
# (поиск начала, поиск конца) — границы ищутся в паузах между словами
SEG = [((0.0, 0.0), (13.50, 13.64)),      # GTA San Andreas ... оперативной памяти.
       ((62.86, 63.05), (67.34, 67.50)),  # Весь штат ... было просто невозможно
       ((202.86, 202.99), (203.92, 204.14)),  # Внутреннее помещение —
       ((204.88, 205.07), (209.12, 209.20)),  # это отдельные маленькие миры ... над картой.
       ((16.46, 16.62), (18.74, 18.87))]  # И как же Rockstar сумела это провернуть
GAP = [0.10, 0.34, 0.38, 0.10, 0.40]
out = np.zeros((int(DUR * SR), 2), np.float32)
timeline = []; tpos = 0.0; fade = int(0.012 * SR)
for k, ((s0, s1), (e0, e1)) in enumerate(SEG):
    a = 0.0 if s1 == 0 else quiet_point(s0, s1); b = quiet_point(e0, e1)
    tpos += GAP[k]
    seg = voice[int(a * SR):int(b * SR)].copy()
    seg[:fade] *= np.linspace(0, 1, fade)[:, None]; seg[-fade:] *= np.linspace(1, 0, fade)[:, None]
    i = int(tpos * SR); out[i:i + len(seg)] += seg
    ws = [{'w': w['w'].strip(), 't': round(w['t'] - a + tpos, 3), 'e': round(w['e'] - a + tpos, 3)} for w in words if a - 0.02 <= w['t'] < b]
    timeline.append({'src': [round(a, 3), round(b, 3)], 'at': round(tpos, 3), 'end': round(tpos + (b - a), 3), 'words': ws})
    tpos += b - a
voice_end = tpos
# нормализация голоса к пику -3 dBFS
out *= 10 ** (-3 / 20) / (np.abs(out).max() + 1e-9)

# музыка: Funkorama с сильной доли (7.105 с), тише голоса; в финальной карточке чуть громче, затем затухание
mus = load(os.path.join(HERE, 'music_src/Funkorama.mp3'))[int(7.105 * SR):int((7.105 + DUR) * SR)]
mus = mus / (np.abs(mus).max() + 1e-9)
t = np.arange(len(mus)) / SR
g = np.full(len(mus), 10 ** (-17 / 20))
# мягкий подъём после голоса и затухание в конце
up = np.clip((t - voice_end - 0.1) / 0.6, 0, 1); g *= 1 + up * (10 ** (5 / 20) - 1)
g *= np.clip((DUR - t) / 1.6, 0, 1) ** 1.5
g[:int(0.03 * SR)] *= np.linspace(0, 1, int(0.03 * SR))
out[:len(mus)] += mus * g[:, None]

# SFX — записанные звуки (CC0)
def sfx(name, at, db):
    p = os.path.join(HERE, 'sfx_src', name)
    s = load(p); s = s / (np.abs(s).max() + 1e-9) * 10 ** (db / 20)
    i = int(at * SR); n = min(len(s), len(out) - i)
    if n > 0: out[i:i + n] += s[:n]
def W(i, t=None):  # время слова i в сегменте k
    return i
def wt(k, word, nth=0, exact=False):
    cl = lambda x: x.lower().strip('.,!?–—')
    hits = [w for w in timeline[k]['words'] if (cl(w['w']) == word.lower() if exact else cl(w['w']).startswith(word.lower()))]
    return hits[nth]['t']
cues = []
def cue(name, at, db): cues.append((name, round(at, 3), db)); sfx(name, at, db)
# сцена 1: обложка выезжает, звёзды
cue('bsb/1797.mp3', 0.05, -20)
for i in range(5): cue('bsb/1742.mp3', wt(0, 'лучш') + 0.05 + i * 0.13, -27)
# сцена 2: карточки на каждое слово перечисления
L = ['Три', 'город', 'город', 'лес', 'пустын', 'горы', 'велосипед', 'самол', 'качалк', 'парикм']
tri = wt(0, 'Три')
card_t = [tri, tri + 0.18, tri + 0.36] + [wt(0, x, 0, x == 'горы') for x in L[3:]]
cue('bsb/1798.mp3', tri - 0.25, -19)
for i, ct in enumerate(card_t): cue(f'swishes/swishes/swish-{[1,3,4,5,6,8,9,10,11,2][i]}.wav', ct - 0.03, -21)
# сцена 3: переход в геймплей, вычёркивание загрузки
cue('bsb/1795.mp3', wt(0, 'и', 1, True) - 0.25, -18)
cue('bsb/1735.mp3', wt(0, 'загрузки') + 0.15, -20)
# сцена 4: PS2 и «32 МБ»
cue('bsb/1796.mp3', wt(0, 'на', 0, True) - 0.2, -19)
cue('bsb/2821.mp3', wt(0, '32'), -22)
# сцена 5: карта (бумага), попытка загрузить, крест
cue('bsb/0164.mp3', timeline[1]['at'] + 0.0, -16)
cue('bsb/1800.mp3', wt(1, 'загрузить') - 0.05, -21)
cue('bsb/1742.mp3', wt(1, 'невозможно') + 0.1, -18)
# сцена 6: интерьеры
cue('bsb/1801.mp3', timeline[2]['at'] - 0.25, -18)
cue('bsb/1797.mp3', wt(3, 'это', 0, True) - 0.2, -20)
for i, x in enumerate(['отдельн', 'маленьк', 'миры']): cue(f'swishes/swishes/swish-{[7,12,13][i]}.wav', wt(3, x) - 0.03, -21)
cue('bsb/0128.mp3', wt(3, 'висят') - 0.2, -18)
# сцена 7: Rockstar
cue('bsb/1796.mp3', timeline[4]['at'] - 0.25, -19)
cue('bsb/2821.mp3', wt(4, 'Rockstar'), -21)
# финал
cue('bsb/1795.mp3', timeline[4]['end'] + 0.05, -18)

# мягкий лимитер
pk = np.abs(out).max()
if pk > 0.95: out *= 0.95 / pk
out[-int(0.05 * SR):] *= np.linspace(1, 0, int(0.05 * SR))[:, None]
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-f', 'f32le', '-ar', str(SR), '-ac', '2', '-i', '-', '-af', 'acompressor=threshold=-20dB:ratio=2.5:attack=8:release=120,loudnorm=I=-14:TP=-1.5:LRA=9', '-ar', str(SR), '-c:a', 'pcm_s16le', os.path.join(HERE, 'mix.wav')], input=out.astype(np.float32).tobytes(), check=True)
json.dump({'segments': timeline, 'voice_end': round(voice_end, 3), 'card_t': [round(x, 3) for x in card_t], 'cues': cues}, open(os.path.join(HERE, 'timeline.json'), 'w'), ensure_ascii=False, indent=1)
print('voice_end', round(voice_end, 2))
for s in timeline: print(s['src'], '->', s['at'], s['end'], ' '.join(f"{w['w']}@{w['t']}" for w in s['words']))
