import { buildConsole as s01, buildCut as s02, buildStudio as s03, buildSize as s04, buildNoFit as s05, buildCoder as s06 } from './s01_ram.js';
import { buildRun as s07, buildChunks as s08, buildFree as s09, buildDiscMap as s10, buildOnTime as s11, buildLibs as s12, buildMetal as s13, buildWorry as s14, buildRelease as s15, buildMascot as s16 } from './s07_stream.js';

// Shot list for the level-streaming story. trans = transition INTO the shot.
export const SHOTS = [
  { id: 'console', start: 0.0, end: 3.6, trans: 'cut', build: s01 },
  { id: 'cut', start: 3.6, end: 7.3, trans: 'whip', build: s02 },
  { id: 'studio', start: 7.3, end: 11.55, trans: 'flash', build: s03 },
  { id: 'size', start: 11.55, end: 14.75, trans: 'cut', build: s04 },
  { id: 'nofit', start: 14.75, end: 17.0, trans: 'whip', build: s05 },
  { id: 'coder', start: 17.0, end: 21.0, trans: 'flash', build: s06 },
  { id: 'run', start: 21.0, end: 24.4, trans: 'whip', build: s07 },
  { id: 'chunks', start: 24.4, end: 27.35, trans: 'cut', build: s08 },
  { id: 'free', start: 27.35, end: 30.45, trans: 'whip', whipDir: -1, build: s09 },
  { id: 'disc', start: 30.45, end: 33.65, trans: 'flash', build: s10 },
  { id: 'ontime', start: 33.65, end: 36.05, trans: 'cut', build: s11 },
  { id: 'libs', start: 36.05, end: 39.3, trans: 'whip', build: s12 },
  { id: 'metal', start: 39.3, end: 41.35, trans: 'cut', build: s13 },
  { id: 'worry', start: 41.35, end: 45.15, trans: 'flash', build: s14 },
  { id: 'release', start: 45.15, end: 48.0, trans: 'whip', build: s15 },
  { id: 'mascot', start: 48.0, end: 51.05, trans: 'split', build: s16 },
];
export const CHUNKS = [
  'У первой PlayStation', 'было всего', '2 мегабайта', 'оперативной памяти,', 'и многим', 'разработчикам из-за этого', 'приходилось резать', 'свои идеи.',
  'Студия Naughty Dog', 'хотела сделать', 'большие красивые', '3D-уровни,', 'но каждый из них', 'весил 8–16 мегабайт', 'и целиком', 'в память', 'не помещался.',
  'Тогда программист', 'Энди Гэвин', 'написал собственную', 'систему подгрузки.',
  'Пока Крэш', 'бежал вперёд,', 'консоль читала', 'с диска', 'следующие куски', 'уровня размером', 'по 64 килобайта', 'и тут же', 'освобождала память', 'от тех, что', 'остались позади.',
  'Гэвин даже', 'сам продумал,', 'как разложить', 'данные на диске,', 'чтобы всё успевало', 'подгружаться вовремя.',
  'Для этого команда', 'почти не пользовалась', 'библиотеками Sony', 'и писала код', 'прямо под железо.',
  'В Sony', 'забеспокоились, что', 'дисковод не выдержит', 'такой нагрузки,', 'но игра вышла', 'в 1996 году,', 'а Крэш стал', 'неофициальным талисманом', 'PlayStation.',
];
