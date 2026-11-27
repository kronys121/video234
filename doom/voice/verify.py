import json, re, sys, difflib, numpy as np, wave
from faster_whisper import WhisperModel
src = sys.argv[1] if len(sys.argv) > 1 else 'clean16k.wav'
w = wave.open(src); a = np.frombuffer(w.readframes(w.getnframes()), np.int16) / 32768.
e = np.sqrt(np.convolve(a ** 2, np.ones(400) / 400, 'same')[::160]); act = 20 * np.log10(e + 1e-9) > -38
segs = []; i = 0; n = len(act)
while i < n:
    if act[i]:
        j = i; sil = 0
        while j < n:
            sil = 0 if act[j] else sil + 1
            if sil >= 30: break
            j += 1
        s, en = max(0, i - 8), min(n, j - sil + 10)
        if segs and s / 100 - segs[-1][1] < 0.45 and en / 100 - segs[-1][0] < 14: segs[-1][1] = en / 100
        elif en - s > 15: segs.append([s / 100, en / 100])
        i = j
    else: i += 1
m = WhisperModel('small', device='cpu', compute_type='int8', cpu_threads=4)
W = []; lines = []
for s, en in segs:
    sg, _ = m.transcribe(a[int(s * 16000):int(en * 16000)].astype(np.float32), language='ru', word_timestamps=True, beam_size=5, condition_on_previous_text=False)
    t = ''
    for q in sg:
        t += q.text; W += [dict(w=v.word.strip(), t=round(s + v.start, 2)) for v in q.words]
    lines.append(f'{s:7.2f} {t.strip()}')
open(src + '.txt', 'w').write('\n'.join(lines))
json.dump(W, open(src + '.words.json', 'w'), ensure_ascii=False)
print('распознано', len(W), 'слов')
