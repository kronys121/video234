import sys, numpy as np, wave
from faster_whisper import WhisperModel
w = wave.open('raw16k.wav'); a = np.frombuffer(w.readframes(w.getnframes()), np.int16) / 32768.
m = WhisperModel('small', device='cpu', compute_type='int8', cpu_threads=4)
for arg in sys.argv[1:]:
    s, e = map(float, arg.split('-'))
    sg, _ = m.transcribe(a[int(s*16000):int(e*16000)].astype(np.float32), language='ru', word_timestamps=True, beam_size=5, condition_on_previous_text=False)
    print(arg, ' '.join(f'{v.word.strip()}[{s+v.start:.2f}-{s+v.end:.2f}]' for q in sg for v in q.words), flush=True)
