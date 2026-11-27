import json, numpy as np, wave
from faster_whisper import WhisperModel
w = wave.open('raw16k.wav'); a = np.frombuffer(w.readframes(w.getnframes()), np.int16) / 32768.
e = np.sqrt(np.convolve(a ** 2, np.ones(400) / 400, 'same')[::160]); db = 20 * np.log10(e + 1e-9)
act = db > -38
# паузы >= 0.3 с — границы фраз
segs = []; i = 0; n = len(act)
while i < n:
    if act[i]:
        j = i; sil = 0
        while j < n:
            if act[j]: sil = 0
            else:
                sil += 1
                if sil >= 30: break
            j += 1
        s, en = max(0, i - 8), min(n, j - sil + 10)
        if en - s > 15: segs.append([s / 100, en / 100])
        i = j
    else: i += 1
# склеить короткие паузы, чтобы фразы были 1..12 с
out = []
for s in segs:
    if out and s[0] - out[-1][1] < 0.45 and s[1] - out[-1][0] < 12: out[-1][1] = s[1]
    else: out.append(s)
print('фраз', len(out), flush=True)
m = WhisperModel('small', device='cpu', compute_type='int8', cpu_threads=4)
res = []
for k, (s, en) in enumerate(out):
    x = a[int(s * 16000):int(en * 16000)].astype(np.float32)
    sg, _ = m.transcribe(x, language='ru', word_timestamps=True, beam_size=5, condition_on_previous_text=False, vad_filter=False)
    ws = []; txt = ''
    for q in sg:
        txt += q.text
        ws += [dict(w=v.word.strip(), t=round(s + v.start, 3), e=round(s + v.end, 3)) for v in q.words]
    res.append(dict(k=k, s=s, e=en, text=txt.strip(), words=ws))
    print(f'{k:4d} {s:7.2f}-{en:7.2f} {txt.strip()}', flush=True)
json.dump(res, open('chunks.json', 'w'), ensure_ascii=False)
print('done')
