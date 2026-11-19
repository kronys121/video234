// Готовит public/: кадры клипов из mp4, картинки, шрифты, озвучку и слова с таймингом.
// Запускается в основном репозитории.
import fs from 'node:fs'; import path from 'node:path'; import { execFileSync } from 'node:child_process';
const R = path.resolve('..'), P = path.resolve('public'), SEC = 31.1;
fs.rmSync(P, { recursive: true, force: true });
const cp = (src, dst) => { fs.mkdirSync(path.dirname(path.join(P, dst)), { recursive: true }); fs.cpSync(src.startsWith('/') ? src : path.join(R, src), path.join(P, dst), { recursive: true }); };
const ff = (...a) => execFileSync('ffmpeg', ['-y', '-v', 'error', ...a]);
for (const k of ['city1', 'enemy1', 'dogsniff', 't_hands']) { fs.mkdirSync(path.join(P, 'clips', k), { recursive: true }); ff('-i', path.join(R, `tlou2/clips_src/${k}.mp4`), '-vf', 'fps=30,scale=960:540', '-q:v', '3', path.join(P, 'clips', k, '%04d.jpg')); }
ff('-ss', '4', '-i', path.join(R, 'tlou2/clips_src/t_forest.mp4'), '-frames:v', '1', '-q:v', '2', path.join(P, 'bg_forest.jpg'));
for (const f of ['cover_ps4.jpg', 'logo_black.png', 'nd_logo.png']) cp(`tlou2/assets/${f}`, `img/${f}`);
cp('rdr2/assets/ps4.png', 'img/ps4.png'); cp('cyberpunk/assets/ps5.png', 'img/ps5.png');
for (const s of ['cyrillic', 'latin']) cp(`node_modules/@fontsource/montserrat/files/montserrat-${s}-800-normal.woff2`, `fonts/mont-${s}.woff2`);
cp('/usr/share/fonts/truetype/noto/NotoColorEmoji.ttf', 'fonts/NotoColorEmoji.ttf');
ff('-i', path.join(R, 'tlou2/voice_raw.mp3'), '-t', String(SEC), '-ar', '48000', '-ac', '2', '-af', `afade=t=out:st=${SEC - 0.4}:d=0.4`, path.join(P, 'voice.wav'));
fs.writeFileSync('src/words.json', JSON.stringify(JSON.parse(fs.readFileSync(path.join(R, 'tlou2/words.json'), 'utf8')).filter((x) => x.t < SEC + 2)));
console.log('assets ok');
