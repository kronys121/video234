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

# phrases: (display text, spoken text) — spoken is what the narrator actually pronounces
PHRASES = [
 ("Во время войны в Персидском заливе в 1991 году", "Во время войны в Персидском заливе в тысячадевятьсотдевяностопервом году"),
 ("американский солдат оставил свой Game Boy в казарме, которая позже попала под авиаудар и полностью выгорела.", "американский солдат оставил свой Гейм Бой в казарме, которая позже попала под авиаудар и полностью выгорела."),
 ("Приставку нашли спустя несколько дней среди обгоревшего мусора", None),
 ("расплавленный, покорёженный, почерневший от копоти корпус.", None),
 ("Внутри всё ещё торчал картридж с игрой.", None),
 ("Солдат отправил приставку обратно в Nintendo с просьбой посмотреть, можно ли хоть что-то спасти.", "Солдат отправил приставку обратно в Нинтендо с просьбой посмотреть, можно ли хоть что-то спасти."),
 ("К удивлению инженеров компании, после чистки экран и материнская плата оказались полностью рабочими", None),
 ("сгорел только отсек с батарейками, и то не критично.", None),
 ("С тех пор эта обгоревшая приставка стоит в штаб-квартире Nintendo как живое доказательство легендарной прочности оригинального Game Boy,", "С тех пор эта обгоревшая приставка стоит в штаб-квартире Нинтендо как живое доказательство легендарной прочности оригинального Гейм Бой,"),
 ("и историю до сих пор рассказывают, когда речь заходит о том, почему старую технику иногда собирали \"на совесть\".", None),
]
# phrase boundaries from silencedetect (-30 dB, 0.12 s)
BOUNDS = [(3.83, 4.07), (10.18, 10.58), (13.95, 14.28), (17.56, 17.86), (20.14, 20.41),
          (25.47, 25.83), (31.69, 32.01), (34.91, 35.25), (42.84, 43.23)]

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
