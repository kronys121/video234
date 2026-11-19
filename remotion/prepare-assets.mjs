// Копирует в public/ всё, что нужно ролику (клипы и звук в git основного проекта не хранятся)
import fs from 'node:fs'; import path from 'node:path'; import { execFileSync } from 'node:child_process';
const R = path.resolve('..'), P = path.resolve('public');
fs.rmSync(P, { recursive: true, force: true });
const cp = (src, dst) => { fs.mkdirSync(path.dirname(path.join(P, dst)), { recursive: true }); fs.cpSync(path.join(R, src), path.join(P, dst), { recursive: true }); };
// клипы — готовые кадры jpg (30 к/с): при рендере не нужно декодировать видео
for (const k of ['city1', 'enemy1', 'dogsniff', 'e_joel', 't_hands']) cp(`tlou2/clips/${k}`, `clips/${k}`);
cp('tlou2/clips/t_forest/0120.jpg', 'img/bg_forest.jpg');
cp('tlou2/clips/t_dark/0090.jpg', 'img/bg_dark.jpg');
for (const f of ['cover_ps4.jpg', 'cover_ps3.jpg', 'logo_white.png', 'nd_logo.png', 'joel1_cut.png', 'ellie1_cut.png', 'sony_black.png']) cp(`tlou2/assets/${f}`, `img/${f}`);
for (const f of ['ps4.png', 'blue.jpg', 'pcb.jpg']) cp(`rdr2/assets/${f}`, `img/${f}`);
cp('cyberpunk/assets/ps5.png', 'img/ps5.png');
cp('gta4_ps3/sfx/whoosh.wav', 'sfx/whoosh.wav');
cp('node_modules/@fontsource/oswald/files/oswald-cyrillic-700-normal.woff2', 'fonts/osw-cyr.woff2');
cp('node_modules/@fontsource/oswald/files/oswald-latin-700-normal.woff2', 'fonts/osw-lat.woff2');
// первая минута озвучки без обработки, только мягкий хвост
execFileSync('ffmpeg', ['-y', '-v', 'error', '-i', path.join(R, 'tlou2/audio_mix.wav'), '-t', '60', '-af', 'afade=t=out:st=59.7:d=0.3', path.join(P, 'voice.wav')]);
console.log('assets ok');
