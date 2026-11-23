# TikTok/Shorts 1080x1920 по ролику GTA 6: голос автора (2 куска), геймплей 9:16, субтитры по словам, финал «продолжение на канале».
#   python3 build_short.py          -> gta6_short_tiktok.mp4
#   python3 build_short.py --data   -> tmp/audio.wav + tmp/short_data.json (для проекта Remotion)
import json, os, subprocess, sys, numpy as np
DATA = '--data' in sys.argv
HERE = os.path.dirname(os.path.abspath(__file__)); G = os.path.dirname(HERE)
SR = 48000; FPS = 60; END = 3.6
SEGS = [(0.0, 21.55), (242.9, 280.76)]          # куски озвучки (сек оригинала)
W = json.load(open(f'{G}/voice/words.json'))
# слова на шкале шорта
words = []; t0 = 0.0
for a, b in SEGS:
    for w in W:
        if a <= w['t'] < b: words.append({'w': w['w'], 't': w['t'] - a + t0, 'e': min(w['e'], b) - a + t0})
    t0 += b - a
VO = t0; TOTAL = VO + END
# правки распознавания
FIX = {'Race': 'RAGE', 'E': 'ИИ', '.E.': '', '6': '6', 'Рукстар': 'Rockstar', 'чистоты': 'частоты', 'Прошлых': 'В прошлых', 'данные': 'здания', 'отечения': 'отсечение', 'мс': 'мс'}
for i, w in enumerate(words):
    if w['w'] == 'это' and i + 1 < len(words) and words[i + 1]['w'] == 'отечения': w['w'] = ''
for w in words: w['w'] = FIX.get(w['w'], w['w'])
words = [w for w in words if w['w']]
# ---------- видео: кадры монтажа из полного ролика (render_frames.mjs) -> 9:16 ----------
os.makedirs(f'{HERE}/tmp', exist_ok=True)
if not DATA:
    # фон — тот же кадр, растянутый и размытый; сверху — монтаж 1440x810 (обрезка краёв до 1080) по центру
    fc = ('[0:v]split[a][b];[a]scale=-2:1920,crop=1080:1920,gblur=sigma=110:steps=3,eq=brightness=-0.03[bg];'
          '[b]scale=1440:810:flags=lanczos,crop=1080:810[fg0];[1:v]format=gray[m];[fg0][m]alphamerge[fg];[bg][fg]overlay=0:520:shortest=1,format=yuv420p[v]')
    subprocess.run(['ffmpeg', '-nostdin', '-y', '-v', 'error', '-framerate', str(FPS), '-i', f'{HERE}/frames/f%05d.jpg', '-loop', '1', '-i', f'{HERE}/fade_mask.png', '-filter_complex', fc, '-shortest', '-map', '[v]',
                    '-c:v', 'libx264', '-preset', 'fast', '-crf', '16', f'{HERE}/tmp/main.mp4'], check=True)
    # финал: размытый последний кадр
    last = sorted(os.listdir(f'{HERE}/frames'))[-1]
    subprocess.run(['ffmpeg', '-nostdin', '-y', '-v', 'error', '-loop', '1', '-framerate', str(FPS), '-t', f'{END:.3f}', '-i', f'{HERE}/frames/{last}',
                    '-vf', 'scale=-2:1920,crop=1080:1920,gblur=sigma=30,eq=brightness=-0.25,format=yuv420p', '-c:v', 'libx264', '-preset', 'fast', '-crf', '16', f'{HERE}/tmp/end.mp4'], check=True)
    open(f'{HERE}/tmp/list.txt', 'w').write(f"file '{HERE}/tmp/main.mp4'\nfile '{HERE}/tmp/end.mp4'\n")
    subprocess.run(['ffmpeg', '-nostdin', '-y', '-v', 'error', '-f', 'concat', '-safe', '0', '-i', f'{HERE}/tmp/list.txt', '-c', 'copy', f'{HERE}/tmp/bg.mp4'], check=True)
# ---------- субтитры ASS ----------
def ts(x): h = int(x // 3600); m = int(x % 3600 // 60); s = x % 60; return f'{h}:{m:02d}:{s:05.2f}'
ass = ['[Script Info]', 'ScriptType: v4.00+', 'PlayResX: 1080', 'PlayResY: 1920', 'WrapStyle: 2', '',
       '[V4+ Styles]', 'Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding',
       'Style: Cap,Inter Black,78,&H00FFFFFF,&H00FFFFFF,&H00000000,&H64000000,0,0,0,0,100,100,0,0,1,8,3,2,60,60,400,1',
       'Style: Hook,Inter Black,76,&H00FFFFFF,&H00FFFFFF,&H00000000,&H64000000,0,0,0,0,100,100,0,0,1,8,3,8,60,60,250,1',
       'Style: Big,Inter Black,230,&H0035E1FF,&H00FFFFFF,&H00000000,&H64000000,0,0,0,0,100,100,0,0,1,12,4,5,60,60,0,1',
       'Style: End,Inter Black,96,&H00FFFFFF,&H00FFFFFF,&H00000000,&H64000000,0,0,0,0,100,100,0,0,1,8,3,5,60,60,0,1',
       'Style: Tag,Inter ExtraBold,46,&H00FFFFFF,&H00FFFFFF,&H00000000,&H64000000,0,0,0,0,100,100,0,0,1,4,2,8,60,60,90,1', '',
       '[Events]', 'Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text']
YEL = '&H0035E1FF&'
# группы по 3 слова; текущее слово жёлтое с «прыжком»
groups = []; cur = []
for w in words:
    cur.append(w)
    if len(cur) == 2 or len(''.join(x['w'] for x in cur)) > 12 or w['w'].endswith(('.', '?', ',', '!')):
        groups.append(cur); cur = []
if cur: groups.append(cur)
for gi, g in enumerate(groups):
    nxt = groups[gi + 1][0]['t'] if gi + 1 < len(groups) else VO
    for k, w in enumerate(g):
        s = w['t']; e = g[k + 1]['t'] if k + 1 < len(g) else min(w['e'] + 0.25, nxt)
        txt = ' '.join((r'{\c' + YEL + r'\fscx112\fscy112\t(0,90,\fscx100\fscy100)}' + x['w'].upper() + r'{\c&H00FFFFFF&}') if j == k else x['w'].upper() for j, x in enumerate(g))
        ass.append(f'Dialogue: 1,{ts(s)},{ts(e)},Cap,,0,0,0,,{txt}')
# крючок сверху в первые 2.5 с
ass.append(r'Dialogue: 2,0:00:00.00,0:00:04.00,Hook,,0,0,0,,{\fad(0,200)\fscx70\fscy70\t(0,180,\fscx100\fscy100)}GTA 6 НЕ ДОЛЖНА\NБЫЛА РАБОТАТЬ НА PS5')
# большие цифры
def big(t, d, text): ass.append(r'Dialogue: 3,' + f'{ts(t)},{ts(t + d)}' + r',Big,,0,0,0,,{\an5\pos(540,760)\fad(80,150)\fscx40\fscy40\t(0,160,\fscx110\fscy110)\t(160,260,\fscx100\fscy100)}' + text)
def wt(txt, n=0): return [w for w in words if w['w'].strip('.,?!').lower() == txt.lower()][n]['t']
# финальная карточка
ass.append(r'Dialogue: 4,' + f'{ts(VO + 0.05)},{ts(TOTAL)}' + r',End,,0,0,0,,{\an5\pos(540,820)\fad(150,0)\fscx60\fscy60\t(0,200,\fscx100\fscy100)}ПРОДОЛЖЕНИЕ\NНА КАНАЛЕ')
ass.append(r'Dialogue: 4,' + f'{ts(VO + 0.35)},{ts(TOTAL)}' + r',End,,0,0,0,,{\an5\pos(540,1080)\c' + YEL + r'\fs120\fad(150,0)\fscx50\fscy50\t(0,220,\fscx100\fscy100)}@kronyscs')
ass.append(r'Dialogue: 4,' + f'{ts(VO + 0.7)},{ts(TOTAL)}' + r',End,,0,0,0,,{\an5\pos(540,1290)\fs64\fad(150,0)}ПОЛНЫЙ РАЗБОР ↓')
# метка канала сверху всё время
ass.append(r'Dialogue: 0,' + f'0:00:04.00,{ts(VO)}' + r',Tag,,0,0,0,,{\alpha&H30&}@kronyscs')
open(f'{HERE}/tmp/subs.ass', 'w').write('\n'.join(ass) + '\n')
# ---------- звук ----------
def load(p):
    raw = subprocess.check_output(['ffmpeg', '-v', 'error', '-i', p, '-f', 'f32le', '-ac', '2', '-ar', str(SR), '-'])
    return np.frombuffer(raw, np.float32).reshape(-1, 2).copy()
v = load(f'{G}/voice/gta6_voice_main.mp3'); out = np.zeros((int(TOTAL * SR) + SR, 2), np.float32); pos = 0
for a, b in SEGS:
    s = v[int(a * SR):int(b * SR)].copy(); f = int(0.015 * SR); s[:f] *= np.linspace(0, 1, f)[:, None]; s[-f:] *= np.linspace(1, 0, f)[:, None]
    out[pos:pos + len(s)] += s; pos += len(s)
out *= 10 ** (-1 / 20) / (np.abs(out).max() + 1e-9)
m = load(f'{G}/music/Electro Cabello.mp3'); m = m / (np.abs(m).max() + 1e-9); m = m[int(1.813 * SR):][:len(out)]
t = np.arange(len(m)) / SR
g = np.where(t < VO, 10 ** (-21 / 20), 10 ** (-12 / 20)) * np.clip((TOTAL - t) / 1.2, 0, 1)
out[:len(m)] += m * g[:, None]
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-f', 'f32le', '-ar', str(SR), '-ac', '2', '-i', '-', '-af', 'loudnorm=I=-14:TP=-1.5:LRA=9', '-ar', str(SR), '-t', f'{TOTAL:.3f}', f'{HERE}/tmp/audio.wav'],
               input=out.astype(np.float32).tobytes(), check=True)
if DATA:
    json.dump({'segs': SEGS, 'vo': VO, 'end': END, 'total': TOTAL,
               'groups': [[{'w': x['w'].upper(), 't': round(x['t'], 3), 'e': round(x['e'], 3)} for x in g] for g in groups]},
              open(f'{HERE}/tmp/short_data.json', 'w'), ensure_ascii=False)
    print('data ok'); sys.exit()
# ---------- сборка ----------
subprocess.run(['ffmpeg', '-nostdin', '-y', '-v', 'error', '-i', f'{HERE}/tmp/bg.mp4', '-i', f'{HERE}/tmp/audio.wav',
                '-vf', f"subtitles={HERE}/tmp/subs.ass:fontsdir=/usr/share/fonts/opentype/inter", '-t', f'{TOTAL:.3f}',
                '-c:v', 'libx264', '-preset', 'slow', '-crf', '18', '-pix_fmt', 'yuv420p', '-r', str(FPS), '-c:a', 'aac', '-b:a', '192k', '-movflags', '+faststart',
                f'{HERE}/gta6_short_tiktok.mp4'], check=True)
print('ok', round(TOTAL, 2), 'c')
