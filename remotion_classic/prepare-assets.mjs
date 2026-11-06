// Копирует в public/ всё, что нужно ролику, и вырезает слова озвучки для тайминга.
// Запускается в основном репозитории (клипы и звук там не хранятся в git).
import fs from 'node:fs'; import path from 'node:path'; import { execFileSync } from 'node:child_process';
const R = path.resolve('..'), P = path.resolve('public'), SEC = 60;
fs.rmSync(P, { recursive: true, force: true });
const cp = (src, dst) => { fs.mkdirSync(path.dirname(path.join(P, dst)), { recursive: true }); fs.cpSync(path.join(R, src), path.join(P, dst), { recursive: true }); };
for (const k of ['city1', 'enemy1', 'dogsniff', 'e_joel', 't_hands']) cp(`tlou2/clips/${k}`, `clips/${k}`);
cp('tlou2/clips/t_forest/0120.jpg', 'clips/t_forest/0120.jpg');
cp('tlou2/clips/t_dark/0090.jpg', 'clips/t_dark/0090.jpg');
for (const f of ['cover_ps4.jpg', 'cover_ps3.jpg', 'logo_white.png', 'nd_logo.png', 'joel1_cut.png', 'ellie1_cut.png', 'sony_black.png']) cp(`tlou2/assets/${f}`, `img/${f}`);
for (const f of ['ps4.png', 'blue.jpg', 'pcb.jpg']) cp(`rdr2/assets/${f}`, `img/${f}`);
cp('cyberpunk/assets/ps5.png', 'img/ps5.png');
cp('node_modules/@fontsource/oswald/files/oswald-cyrillic-700-normal.woff2', 'fonts/osw-cyr.woff2');
cp('node_modules/@fontsource/oswald/files/oswald-latin-700-normal.woff2', 'fonts/osw-lat.woff2');
execFileSync('ffmpeg', ['-y', '-v', 'error', '-i', path.join(R, 'tlou2/audio_mix.wav'), '-t', String(SEC), '-af', `afade=t=out:st=${SEC - 0.3}:d=0.3`, path.join(P, 'voice.wav')]);
const W = JSON.parse(fs.readFileSync(path.join(R, 'tlou2/words.json'), 'utf8')).filter((x) => x.t < SEC + 2);
fs.writeFileSync('src/words.json', JSON.stringify(W));
console.log('assets ok');
