import json, subprocess, numpy as np
from faster_whisper import WhisperModel
raw = subprocess.check_output(['ffmpeg', '-v', 'error', '-i', 'voice_raw.mp3', '-ac', '1', '-ar', '16000', '-f', 'f32le', '-'])
a = np.frombuffer(raw, np.float32)
m = WhisperModel('small', device='cpu', compute_type='int8', cpu_threads=4)
prompt = open('../script_plain.txt').read()[:600]
seg, _ = m.transcribe(a, language='ru', word_timestamps=True, initial_prompt=prompt, condition_on_previous_text=False, vad_filter=False)
W = []
for s in seg:
    print(f'{s.start:7.2f} {s.text}', flush=True)
    W += [{'w': w.word.strip(), 't': round(w.start, 3), 'e': round(w.end, 3), 'p': round(w.probability, 3)} for w in s.words]
json.dump(W, open('words_raw.json', 'w'), ensure_ascii=False)
print('done', len(W))
