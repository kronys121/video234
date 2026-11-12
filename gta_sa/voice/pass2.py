import json, re, subprocess, numpy as np, sys
SR = 48000; src, wj, dst = sys.argv[1], sys.argv[2], sys.argv[3]
nz = lambda s: re.sub(r'[^a-zа-я0-9]', '', s.lower().replace('ё', 'е'))
C = [x for x in json.load(open(wj)) if nz(x['w'])]
n = [nz(x['w']) for x in C]
cuts = []
# повтор 3+ слов рядом -> вырезать ранний заход
j = 0
while j < len(C) - 2:
    hit = None
    for k in range(max(0, j - 15), j - 1):
        if n[k:k+3] == n[j:j+3]: hit = k; break
    if hit is None and n[j] == 'поэтому':  # «поэтому и утра держит. Поэтому игра держит…»
        for k in range(max(0, j - 6), j):
            if n[k] == 'поэтому': hit = k; break
    if hit is not None:
        cuts.append((C[hit]['t'], C[j]['t'], ' '.join(x['w'] for x in C[hit:j])))
    j += 1
merged = []
for c in cuts:
    if merged and c[0] < merged[-1][1]: continue
    merged.append(c)
cuts = merged
for a, b, t in cuts: print(f'{a:7.2f}-{b:7.2f}  УБРАНО: {t}')
raw = subprocess.check_output(['ffmpeg', '-v', 'error', '-i', src, '-f', 'f32le', '-ac', '2', '-ar', str(SR), '-'])
A = np.frombuffer(raw, dtype=np.float32).reshape(-1, 2)
env = np.sqrt(np.convolve((A ** 2).mean(1), np.ones(480) / 480, mode='same'))
q = lambda lo, hi: (int(lo * SR) + int(np.argmin(env[int(lo * SR):int(hi * SR)]))) / SR
F = int(0.012 * SR); out = []; pos = 0.0
for a, b, _ in cuts:
    s = q(a - 0.25, a - 0.01); e = q(b - 0.25, b - 0.01)
    x = A[int(pos * SR):int(s * SR)].copy(); r = np.linspace(0, 1, F)[:, None]
    if pos > 0: x[:F] *= r
    x[-F:] *= r[::-1]; out += [x, np.zeros((int(0.12 * SR), 2), np.float32)]; pos = e
x = A[int(pos * SR):].copy(); x[:F] *= np.linspace(0, 1, F)[:, None]; out.append(x)
Y = np.concatenate(out)
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-f', 'f32le', '-ar', str(SR), '-ac', '2', '-i', '-', '-c:a', 'libmp3lame', '-b:a', '192k', dst], input=Y.tobytes(), check=True)
print('стало', round(len(Y) / SR, 1))
