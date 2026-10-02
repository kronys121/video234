import { buildIntro as s01, buildTag as s02, buildYear as s03, buildWork as s04 } from './s01_dorm.js';
import { buildTeams as s05, buildNoRespawn as s06, buildGhost as s07, buildPeek as s08 } from './s05_game.js';
import { buildGlobe as s09, buildDeal as s10, buildRelease as s11, buildArena as s12, buildSeries as s13 } from './s09_valve.js';

// Shot list for the Counter-Strike story. trans = transition INTO the shot.
export const SHOTS = [
  { id: 'intro', start: 0.0, end: 3.5, trans: 'cut', build: s01 },
  { id: 'tag', start: 3.5, end: 7.35, trans: 'whip', build: s02 },
  { id: 'year', start: 7.35, end: 10.15, trans: 'flash', build: s03 },
  { id: 'work', start: 10.15, end: 12.7, trans: 'cut', build: s04 },
  { id: 'teams', start: 12.7, end: 16.7, trans: 'flash', build: s05 },
  { id: 'respawn', start: 16.7, end: 18.72, trans: 'whip', build: s06 },
  { id: 'ghost', start: 18.72, end: 21.15, trans: 'cut', build: s07 },
  { id: 'peek', start: 21.15, end: 23.65, trans: 'whip', whipDir: -1, build: s08 },
  { id: 'globe', start: 23.65, end: 26.15, trans: 'flash', build: s09 },
  { id: 'deal', start: 26.15, end: 28.25, trans: 'whip', build: s10 },
  { id: 'release', start: 28.25, end: 32.25, trans: 'cut', build: s11 },
  { id: 'arena', start: 32.25, end: 35.95, trans: 'flash', build: s12 },
  { id: 'series', start: 35.95, end: 37.8, trans: 'split', build: s13 },
];
export const CHUNKS = [
  'Два студента сделали', 'бесплатный мод', 'для Half-Life', 'просто ради интереса,', 'а Valve', 'в итоге', 'купила его', 'и наняла', 'обоих авторов.',
  'В 1999 году', 'Минь Ле', 'и Джесс Клифф', 'начали делать', 'для Half-Life', 'мод Counter-Strike,', 'где команда', 'террористов сражается', 'с контртеррористами.',
  'Раундов с возрождением', 'не было:', 'погиб, значит', 'ждёшь следующего', 'раунда.',
  'Из-за этого', 'каждый выстрел', 'ощущался важным,', 'и мод быстро', 'разошёлся по сети.',
  'В 2000 году', 'Valve выкупила проект,', 'наняла обоих авторов', 'и выпустила игру', 'как самостоятельный продукт.',
  'Counter-Strike стала', 'одной из самых', 'популярных онлайн-игр', 'в мире,', 'а серия живёт', 'до сих пор.',
];
