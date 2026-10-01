"""Word timing without ASR: split speech by detected pauses, then map each
word's syllables (vowels) onto syllable nuclei found in the energy envelope."""
import json, re, subprocess, sys
import numpy as np
from scipy.signal import find_peaks, butter, sosfiltfilt

AUDIO = sys.argv[1]
SR = 16000
raw = subprocess.run(['ffmpeg', '-v', 'quiet', '-i', AUDIO, '-ac', '1', '-ar', str(SR), '-f', 'f32le', '-'],
                     capture_output=True).stdout
x = np.frombuffer(raw, np.float32)
dur = len(x) / SR

# vowel-band energy envelope (300-2500 Hz), 100 fps
sos = butter(4, [300, 2500], btype='band', fs=SR, output='sos')
y = sosfiltfilt(sos, x)
hop = SR // 100
env = np.sqrt(np.convolve(y ** 2, np.ones(hop * 3) / (hop * 3), 'same')[::hop])
env_db = 20 * np.log10(env + 1e-6)
t_env = np.arange(len(env)) / 100

# phrases / pause bounds come from a JSON spec: {"phrases":[[display, spoken|null],...], "bounds":[[a,b],...]}
SPEC = json.load(open(sys.argv[3]))
PHRASES = [tuple(p) for p in SPEC['phrases']]
BOUNDS = [tuple(b) for b in SPEC['bounds']]
assert len(PHRASES) == len(BOUNDS) + 1

speech = env_db > (env_db.max() - 38)
start = t_env[np.argmax(speech)] ; end = t_env[len(speech) - 1 - np.argmax(speech[::-1])]
edges = [start] + [v for b in BOUNDS for v in b] + [end]
segs = [(edges[2 * i], edges[2 * i + 1]) for i in range(len(PHRASES))]

VOW = set('аеёиоуыэюяaeiouy')
def syl(w):
    return max(1, sum(c in VOW for c in w.lower()))

words_out = []
for (disp, spoken), (s0, s1) in zip(PHRASES, segs):
    dw = disp.split()
    sw = (spoken or disp).split()
    assert len(sw) == len(dw), disp
    sy = [syl(w) for w in sw]
    total = sum(sy)
    m = (t_env >= s0) & (t_env <= s1)
    seg_t, seg_e = t_env[m], env_db[m]
    pk, _ = find_peaks(seg_e, prominence=3.0, distance=6)
    nuclei = seg_t[pk]
    # cumulative syllable index -> time, via nuclei if the count is plausible, else linear
    def t_of(k):
        if 0.6 * total <= len(nuclei) <= 1.5 * total and len(nuclei) > 2:
            f = k / total * (len(nuclei) - 1)
            i = int(f); fr = f - i
            a = nuclei[min(i, len(nuclei) - 1)]; b = nuclei[min(i + 1, len(nuclei) - 1)]
            tn = a + (b - a) * fr
            tl = s0 + (s1 - s0) * k / total
            return 0.6 * tn + 0.4 * tl
        return s0 + (s1 - s0) * k / total
    k = 0
    for w, n in zip(dw, sy):
        ws = s0 if k == 0 else t_of(k) - 0.06
        k += n
        words_out.append({'w': w, 's': round(float(ws), 3)})
    words_out[-1]['phrase_end'] = round(float(s1), 3)
    print(f'{s0:6.2f}-{s1:6.2f} syl={total:3d} nuclei={len(nuclei):3d}  {disp[:60]}', file=sys.stderr)

for i, w in enumerate(words_out):
    w['e'] = w.pop('phrase_end', None) or words_out[i + 1]['s']
json.dump({'duration': round(dur, 3), 'words': words_out}, open(sys.argv[2], 'w'), ensure_ascii=False, indent=1)
