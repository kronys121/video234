import json, subprocess, numpy as np
SR = 48000
raw = subprocess.check_output(['ffmpeg', '-v', 'error', '-i', 'raw.mp3', '-f', 'f32le', '-ac', '2', '-ar', str(SR), '-'])
A = np.frombuffer(raw, dtype=np.float32).reshape(-1, 2)
Wall = json.load(open('words_raw.json')); keep = json.load(open('words_keep.json'))
env = np.sqrt(np.convolve((A ** 2).mean(1), np.ones(480) / 480, mode='same'))  # громкость, окно 10 мс
def quiet(t, lo, hi):  # самая тихая точка в [lo, hi] около t
    a, b = int(max(0, lo) * SR), int(min(len(A) / SR, hi) * SR)
    if b <= a: return t
    return (a + int(np.argmin(env[a:b]))) / SR
# непрерывные куски (подряд идущие слова исходной записи)
runs = []; cur = [keep[0]]
for x in keep[1:]:
    if x['i'] == cur[-1]['i'] + 1: cur.append(x)
    else: runs.append(cur); cur = [x]
runs.append(cur)
segs = []
for r in runs:
    i0, i1 = r[0]['i'], r[-1]['i']
    prev_e = Wall[i0 - 1]['e'] if i0 > 0 else 0
    next_t = Wall[i1 + 1]['t'] if i1 + 1 < len(Wall) else len(A) / SR
    s = quiet(r[0]['t'], max(prev_e, r[0]['t'] - 0.25), r[0]['t'] - 0.01)
    e = quiet(r[-1]['e'], r[-1]['e'] + 0.03, min(next_t, r[-1]['e'] + 0.35))
    # длинные паузы внутри куска режем до 0.6 с
    pieces = [[s, None]]
    for a, b in zip(r, r[1:]):
        if b['t'] - a['e'] > 0.9:
            m1 = quiet(a['e'], a['e'] + 0.05, a['e'] + 0.35); m2 = quiet(b['t'], b['t'] - 0.3, b['t'] - 0.02)
            pieces[-1][1] = m1; pieces.append([m2, None])
    pieces[-1][1] = e
    for p in pieces: segs.append(tuple(p))
F = int(0.012 * SR); out = []
for k, (s, e) in enumerate(segs):
    x = A[int(s * SR):int(e * SR)].copy()
    ramp = np.linspace(0, 1, F)[:, None]; x[:F] *= ramp; x[-F:] *= ramp[::-1]
    out.append(x)
    if k + 1 < len(segs):
        gap = segs[k + 1][0] - e  # исходная пауза до следующего куска (если он сразу за ним)
        pause = 0.42 if (gap < 0 or gap > 0.6) else max(0.08, gap)
        out.append(np.zeros((int(pause * SR), 2), np.float32))
Y = np.concatenate(out)
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-f', 'f32le', '-ar', str(SR), '-ac', '2', '-i', '-', '-c:a', 'libmp3lame', '-b:a', '192k', 'voice_clean.mp3'], input=Y.tobytes(), check=True)
json.dump(segs, open('segs.json', 'w'))
print('кусков', len(segs), 'было', round(len(A) / SR, 1), 'стало', round(len(Y) / SR, 1))
