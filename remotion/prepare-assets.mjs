// Копирует в public/ только то, что нужно пилоту (клипы и звук в git не хранятся)
import fs from 'node:fs'; import path from 'node:path'; import { execFileSync } from 'node:child_process';
const R = path.resolve('..'), P = path.resolve('public');
const cp = (src, dst) => { fs.mkdirSync(path.dirname(path.join(P, dst)), { recursive: true }); fs.cpSync(path.join(R, src), path.join(P, dst), { recursive: true }); };
for (const k of ['city1', 'enemy1', 'dogsniff', 't_forest']) cp(`tlou2/clips/${k}`, `clips/${k}`);
for (const f of ['cover_ps4.jpg', 'logo_white.png', 'nd_logo.png']) cp(`tlou2/assets/${f}`, `img/${f}`);
for (const f of ['ps4.png', 'blue.jpg', 'pcb.jpg']) cp(`rdr2/assets/${f}`, `img/${f}`);
cp('cyberpunk/assets/ps5.png', 'img/ps5.png');
cp('node_modules/@fontsource/oswald/files/oswald-cyrillic-700-normal.woff2', 'fonts/osw-cyr.woff2');
cp('node_modules/@fontsource/oswald/files/oswald-latin-700-normal.woff2', 'fonts/osw-lat.woff2');
// первые 31.1 с озвучки, без обработки, только мягкий хвост
execFileSync('ffmpeg', ['-y', '-v', 'error', '-i', path.join(R, 'tlou2/audio_mix.wav'), '-t', '31.1', '-af', 'afade=t=out:st=30.6:d=0.5', path.join(P, 'voice.wav')]);
// слова с таймингом (из той же озвучки)
const W = JSON.parse(fs.readFileSync(path.join(R, 'tlou2/words.json'), 'utf8')).filter((x) => x.t < 32);
fs.writeFileSync('src/words.json', JSON.stringify(W));
console.log('assets ok');
