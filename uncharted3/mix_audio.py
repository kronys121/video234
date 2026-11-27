# голос + тихий вуш на каждом перелёте камеры -> audio_mix.wav
import json, subprocess, numpy as np
SR = 48000
def load(p):
    raw = subprocess.check_output(['ffmpeg', '-v', 'error', '-i', p, '-f', 'f32le', '-ac', '2', '-ar', str(SR), '-'])
    return np.frombuffer(raw, dtype=np.float32).reshape(-1, 2)
voice = load('voice.mp3'); wh = load('../gta4_ps3/sfx/whoosh.wav')
wh = wh / np.abs(wh).max() * 10 ** (-24 / 20)
times = json.load(open('whoosh.json'))
out = np.zeros((len(voice) + SR, 2), dtype=np.float32); out[:len(voice)] = voice
for t in times:
    i = max(0, int((t - 0.2) * SR)); n = min(len(wh), len(out) - i); out[i:i + n] += wh[:n]
out = np.clip(out, -1, 1)
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-f', 'f32le', '-ar', str(SR), '-ac', '2', '-i', '-', 'audio_mix.wav'], input=out.tobytes(), check=True)
print('ok', len(out) / SR)
