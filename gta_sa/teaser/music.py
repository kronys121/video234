# Музыка + SFX для тизера GTA SA (30 с). G-funk грув 96 BPM, до-минор. Всё синтезировано.
# python3 music.py -> mix.wav (+ stems/*.wav)
import numpy as np, os
from scipy.signal import butter, sosfilt
SR = 48000; DUR = 30.0; N = int(SR * DUR)
BEAT = 60 / 96; BAR = BEAT * 4; S16 = BEAT / 4
rng = np.random.default_rng(7)
HERE = os.path.dirname(os.path.abspath(__file__))
def tt(n): return np.arange(n) / SR
def mf(m): return 440 * 2 ** ((m - 69) / 12)
def lp(x, f, o=2): return sosfilt(butter(o, f, 'low', fs=SR, output='sos'), x)
def hp(x, f, o=2): return sosfilt(butter(o, f, 'high', fs=SR, output='sos'), x)
def bp(x, a, b, o=2): return sosfilt(butter(o, [a, b], 'band', fs=SR, output='sos'), x)
def place(buf, x, t, g=1.0):
    i = int(round(t * SR));
    if i >= len(buf): return
    x = x[: len(buf) - i]; buf[i:i + len(x)] += g * x
def env(n, a, d, s=0.0, r=None):
    e = np.ones(n); na = max(1, int(a * SR)); e[:na] = np.linspace(0, 1, na)
    if d: k = np.arange(n - na); e[na:] = s + (1 - s) * np.exp(-k / (d * SR))
    if r:
        nr = min(n, int(r * SR)); e[-nr:] *= np.linspace(1, 0, nr)
    return e

# ---------- инструменты ----------
def kick(g=1.0):
    n = int(0.5 * SR); t = tt(n); f = 45 + 110 * np.exp(-t / 0.04)
    ph = 2 * np.pi * np.cumsum(f) / SR
    x = np.sin(ph) * np.exp(-t / 0.28) + 0.25 * np.exp(-t / 0.004) * rng.standard_normal(n) * 0.3
    return np.tanh(1.6 * x) * g
def snare(g=1.0):
    n = int(0.35 * SR); t = tt(n)
    nz = bp(rng.standard_normal(n), 1200, 7000) * np.exp(-t / 0.11)
    tone = np.sin(2 * np.pi * 185 * t) * np.exp(-t / 0.06)
    clap = sum(np.roll(bp(rng.standard_normal(n), 900, 3000) * np.exp(-t / 0.02), int(d * SR)) for d in (0, .011, .022))
    return (0.9 * nz + 0.6 * tone + 0.5 * clap) * g
def hat(g=1.0, open_=False):
    n = int((0.25 if open_ else 0.06) * SR); t = tt(n)
    return hp(rng.standard_normal(n), 7000, 4) * np.exp(-t / (0.08 if open_ else 0.015)) * g
def bass_note(m, dur, g=1.0, glide_from=None):
    n = int(dur * SR); t = tt(n); f = np.full(n, mf(m))
    if glide_from is not None: f = mf(m) + (mf(glide_from) - mf(m)) * np.exp(-t / 0.03)
    ph = 2 * np.pi * np.cumsum(f) / SR
    x = np.sin(ph) + 0.35 * np.sin(2 * ph) + 0.15 * np.sign(np.sin(ph))
    x = lp(x, 700) * env(n, 0.005, 0.35, 0.55, 0.03)
    return x * g
def pad_chord(ms, dur, g=1.0, cutoff=1800):
    n = int(dur * SR); t = tt(n); x = np.zeros(n)
    for m in ms:
        for det in (-0.07, 0, 0.07):
            f = mf(m + det); ph = 2 * np.pi * f * t + rng.uniform(0, 6)
            x += 2 * ((ph / (2 * np.pi)) % 1) - 1
    x = lp(x / (3 * len(ms)), cutoff, 2)
    return x * env(n, 0.35, 0, 1, 0.4) * g
def lead(notes, g=1.0):
    # G-funk "whine": синус с портаменто и вибрато. notes=[(t, midi, dur)]
    end = max(a + c for a, _, c in notes) + 0.3; n = int(end * SR); t = tt(n)
    f = np.zeros(n); amp = np.zeros(n); prev = notes[0][1]
    for (a, m, d) in notes:
        i0, i1 = int(a * SR), int((a + d) * SR); k = np.arange(i1 - i0) / SR
        f[i0:i1] = mf(m) + (mf(prev) - mf(m)) * np.exp(-k / 0.06); prev = m
        e = np.minimum(1, k / 0.04) * np.minimum(1, (d - k) / 0.08 + 0.0); amp[i0:i1] = np.clip(e, 0, 1)
    vib = 1 + 0.012 * np.sin(2 * np.pi * 5.5 * t) * np.minimum(1, t / 0.4)
    ph = 2 * np.pi * np.cumsum(np.maximum(f, 1) * vib) / SR
    x = np.sin(ph) + 0.12 * np.sin(3 * ph)
    return lp(x * amp, 3500) * g

# ---------- SFX ----------
def whoosh(dur=0.7, f0=300, f1=4000, g=1.0, rev=False):
    n = int(dur * SR); t = tt(n); nz = rng.standard_normal(n); out = np.zeros(n); blk = 512
    for i in range(0, n, blk):
        u = i / n; fc = f0 * (f1 / f0) ** (u if not rev else 1 - u)
        seg = nz[i:i + blk]; out[i:i + blk] = bp(seg, fc * 0.7, min(fc * 1.4, 20000))
    e = np.sin(np.pi * np.clip(t / dur, 0, 1)) ** 1.5
    return lp(out * e, 9000) * g
def impact(g=1.0):
    n = int(1.6 * SR); t = tt(n); f = 32 + 60 * np.exp(-t / 0.08)
    boom = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / 0.6)
    crack = bp(rng.standard_normal(n), 200, 5000) * np.exp(-t / 0.05)
    return np.tanh(1.3 * (boom + 0.5 * crack)) * g
def tick(m=96, g=1.0):
    n = int(0.08 * SR); t = tt(n); return np.sin(2 * np.pi * mf(m) * t) * np.exp(-t / 0.012) * g
def riser(dur, g=1.0):
    n = int(dur * SR); t = tt(n); u = t / dur
    nz = hp(rng.standard_normal(n), 2000) * u ** 2
    f = 200 * (8 ** u); tone = np.sin(2 * np.pi * np.cumsum(f) / SR) * u ** 2 * 0.3
    x = (lp(nz, 6000) * 0.35 + tone)
    fo = int(0.06 * SR); x[-fo:] *= np.linspace(1, 0, fo)
    return x * g
def shimmer(dur, g=1.0):
    n = int(dur * SR); t = tt(n); x = np.zeros(n)
    for m in (84, 91, 96, 100):
        x += np.sin(2 * np.pi * mf(m) * t + rng.uniform(0, 6)) * (0.5 + 0.5 * np.sin(2 * np.pi * rng.uniform(3, 7) * t))
    return x * np.sin(np.pi * np.clip(t / dur, 0, 1)) ** 2 * g / 4
def cymbal(g=1.0):
    n = int(3.5 * SR); t = tt(n); return lp(hp(rng.standard_normal(n), 5000, 2), 12000) * np.exp(-t / 0.7) * g

drums = np.zeros(N); bass = np.zeros(N); pad = np.zeros(N); ld = np.zeros(N); sfx = np.zeros(N)

# Аккорды по тактам (C minor): Cm7, Fm7, Abmaj7, G7
CH = {'Cm': [48, 55, 58, 63], 'Fm': [53, 56, 60, 63], 'Ab': [56, 60, 63, 67], 'G7': [55, 59, 62, 65], 'Cm9': [48, 55, 58, 62, 63, 70]}
ROOT = {'Cm': 36, 'Fm': 41, 'Ab': 44, 'G7': 43}
prog = ['Cm', 'Fm', 'Cm', 'Fm', 'Ab', 'G7', 'Cm', 'Fm', 'Ab', 'G7', 'Ab']   # такты 0..10 (0–27.5 с)
for b, c in enumerate(prog):
    t0 = b * BAR
    if t0 >= 26.25: break
    d = min(BAR, 26.25 - t0)
    cut = 900 if b < 2 else (2200 if b < 9 else 1400)
    place(pad, pad_chord(CH[c], d + 0.3, 0.55 if b >= 2 else 0.45, cut), t0)

# Барабаны. Интро: только бочка на 1 и 3 (+хэты во 2-м такте). С 5.0 — полный бит. 22.5–26.25 — брейк.
def groove_bar(t0, full=True, busy=False):
    for k, p in enumerate([0, 2.5, 2.75]):  # бочка: 1, «и» 3-й доли
        if p < 4: place(drums, kick(0.95), t0 + p * BEAT)
    place(drums, snare(0.7), t0 + 1 * BEAT); place(drums, snare(0.7), t0 + 3 * BEAT)
    step = 0.5 if not busy else 0.25
    for i in np.arange(0, 4, step):
        sw = 0.04 * BEAT if (i * 2) % 2 == 1 else 0
        place(drums, hat(0.22 if i % 1 == 0 else 0.15, open_=(i == 3.5)), t0 + i * BEAT + sw)
place(drums, kick(1.0), 0.4)
place(drums, kick(0.8), BAR * 0.5); place(drums, kick(0.9), BAR); place(drums, kick(0.8), BAR * 1.5)
for i in np.arange(0, 4, 0.5): place(drums, hat(0.13), BAR + i * BEAT)
# сбивка перед дропом (4.375–5.0)
for i in range(4): place(drums, snare(0.25 + 0.15 * i), 2 * BAR - (4 - i) * S16)
for b in range(2, 9):  # 5.0–22.5
    groove_bar(b * BAR, busy=(b >= 7))
# брейк: 22.5–26.25 — только хэты в половину и сбивка в конце
for i in range(6): place(drums, hat(0.08), 9 * BAR + i * BEAT)
for i in range(8): place(drums, snare(0.15 + 0.08 * i), 26.25 - (8 - i) * S16)

# Бас: фанковый рисунок на 16-х (с 5.0 до 22.5), в брейке — длинная нота
pat = [(0, 0, 3), (3, 0, 1), (6, 12, 1), (8, 0, 2), (10, 7, 2), (13, 10, 1), (14, 12, 2)]
for b in range(2, 9):
    r = ROOT[prog[b]]
    for (st, iv, ln) in pat:
        place(bass, bass_note(r + iv, ln * S16 * 0.95, 0.8, glide_from=(r + iv + 2 if st == 6 else None)), b * BAR + st * S16)
place(bass, bass_note(ROOT['Ab'] - 12 + 12, BAR + 1.25, 0.6), 9 * BAR)
# финальный аккорд 26.25
place(pad, pad_chord(CH['Cm9'], 3.75, 0.85, 2600), 26.25)
place(bass, bass_note(24 + 12, 3.6, 0.9), 26.25)
place(drums, kick(1.1), 26.25); place(drums, cymbal(0.22), 26.25)

# Лид-«вой» (с 10.0 до 22.5). Мелодия по 2 такта, повтор с вариацией.
mel1 = [(0, 79, 1.5), (1.5, 75, .5), (2, 77, 1), (3, 79, 1), (4, 80, 2), (6, 79, 1), (7, 77, 1)]
mel2 = [(0, 75, 1.5), (1.5, 74, .5), (2, 75, 1), (3, 77, 1), (4, 79, 3), (7, 74, 1)]
mel3 = [(0, 79, 1), (1, 82, 1), (2, 80, 1), (3, 79, 1), (4, 77, 2), (6, 75, 2)]
for base, mel in ((4 * BAR, mel1), (6 * BAR, mel2), (7 * BAR, mel3)):
    if base == 7 * BAR: base = 7 * BAR  # такты 7–8 (17.5–22.5): mel3
    place(ld, lead([(base + a * BEAT, m, d * BEAT) for a, m, d in mel], 0.35), 0)

# ---------- SFX по событиям картинки ----------
place(sfx, impact(0.5), 0.4)                       # PS2 выходит из темноты
place(sfx, shimmer(1.6, 0.5), 2.2)                 # полоса света по корпусу
place(sfx, whoosh(0.75, 200, 5000, 0.55), 4.35)    # нырок в PS2
place(sfx, impact(0.9), 5.0)                       # удар «32 МБ»
for i in range(32): place(sfx, tick(96 + (i % 4) * 2, 0.16), 7.5 + i * S16 * 0.5)  # ячейки 7.5–10.0
place(sfx, whoosh(1.0, 400, 2500, 0.45, rev=True), 9.6)  # ячейки → карта
for t0 in (10.6, 12.5, 15.0):                      # круг подгрузки прибывает в город
    for k in range(6): place(sfx, tick(100 - k, 0.12), t0 + k * 0.045)
place(sfx, whoosh(0.6, 300, 6000, 0.6), 17.15)     # рывок в туннель
for t0 in (18.1, 19.35, 20.6, 21.85): place(sfx, whoosh(0.35, 1500, 6000, 0.3), t0 - 0.2)
place(sfx, riser(3.6, 0.22), 22.6)                 # камера в небо
place(sfx, impact(0.8), 26.25)                     # финал

def nrm(x, peak): return x / (np.abs(x).max() + 1e-9) * peak
os.makedirs(os.path.join(HERE, 'stems'), exist_ok=True)
stems = {'drums': nrm(drums, 0.8), 'bass': nrm(bass, 0.55), 'pad': nrm(pad, 0.28), 'lead': nrm(ld, 0.2), 'sfx': nrm(sfx, 0.6)}
mono = sum(stems.values())
# стерео: пэд и лид чуть в стороны
L = mono + 0.08 * stems['pad'] - 0.05 * stems['lead']; R = mono - 0.08 * stems['pad'] + 0.05 * stems['lead']
st = np.stack([L, R], 1)
# мягкая компрессия + лимитер
st = np.tanh(st * 1.1) / np.tanh(1.1)
st *= 0.89 / np.abs(st).max()
fo = int(0.6 * SR); st[-fo:] *= np.linspace(1, 0, fo)[:, None] ** 2
st[:int(0.005 * SR)] *= np.linspace(0, 1, int(0.005 * SR))[:, None]
import wave
def wr(path, a):
    a = np.clip(a, -1, 1); a = (a * 32767).astype(np.int16)
    with wave.open(path, 'wb') as w:
        w.setnchannels(a.shape[1] if a.ndim > 1 else 1); w.setsampwidth(2); w.setframerate(SR); w.writeframes(a.tobytes())
wr(os.path.join(HERE, 'mix.wav'), st)
for k, v in stems.items(): wr(os.path.join(HERE, 'stems', k + '.wav'), v)
print('ok', st.shape, 'peak', np.abs(st).max())
