import json, subprocess, numpy as np
from edl import EDL
SR = 48000
C = json.load(open('chunks.json'))
raw = subprocess.check_output(['ffmpeg', '-v', 'error', '-i', 'voice_raw.mp3', '-f', 'f32le', '-ac', '2', '-ar', str(SR), '-'])
A = np.frombuffer(raw, np.float32).reshape(-1, 2)
env = np.sqrt(np.convolve((A ** 2).mean(1), np.ones(240) / 240, mode='same'))
def quiet(lo, hi):
    a, b = int(lo * SR), int(hi * SR)
    return (a + int(np.argmin(env[a:b]))) / SR if b > a else lo
P = []  # (start, end, chunk, конец фразы?)
for it in EDL:
    if it[0] == 't': P.append((it[1], it[2], None, True)); continue
    c = C[it[0]]; ws = c['words']
    if len(it) == 1: P.append((c['s'], c['e'], it[0], True)); continue
    i0, i1 = it[1], it[2]
    s = c['s'] if i0 == 0 else quiet(max(ws[i0 - 1]['e'] - 0.02, ws[i0]['t'] - 0.3), ws[i0]['t'] + 0.04)
    e = c['e'] if i1 == len(ws) - 1 else quiet(ws[i1]['e'] - 0.04, min(ws[i1 + 1]['t'] + 0.02, ws[i1]['e'] + 0.35))
    P.append((s, e, it[0], ws[i1]['w'][-1:] in '.?!…'))
F = int(0.01 * SR); out = []; marks = []; pos = 0
for n, (s, e, k, fin) in enumerate(P):
    x = A[int(s * SR):int(e * SR)].copy(); r = np.linspace(0, 1, F)[:, None]; x[:F] *= r; x[-F:] *= r[::-1]
    marks.append(dict(s=round(pos / SR, 3), e=round((pos + len(x)) / SR, 3), src_s=round(s, 3), src_e=round(e, 3), k=k))
    out.append(x); pos += len(x)
    if n + 1 < len(P):
        nx = P[n + 1][0]
        if 0 <= nx - e < 0.6: gap = nx - e                      # продолжение той же записи — пауза как была
        else: gap = 0.45 if fin else 0.22                        # стык дублей: пауза по пунктуации
        out.append(np.zeros((int(gap * SR), 2), np.float32)); pos += int(gap * SR)
Y = np.concatenate(out)
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-f', 'f32le', '-ar', str(SR), '-ac', '2', '-i', '-', '-c:a', 'libmp3lame', '-b:a', '256k', 'doom_voice_clean.mp3'], input=Y.tobytes(), check=True)
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-f', 'f32le', '-ar', str(SR), '-ac', '2', '-i', '-', '-ac', '1', '-ar', '16000', 'clean16k.wav'], input=Y.tobytes(), check=True)
json.dump(marks, open('clean_map.json', 'w'))
print('кусков', len(P), 'было', round(len(A) / SR, 1), 'с, стало', round(len(Y) / SR, 1), 'с')
