import { buildSelect as s01, buildToBoss as s02, buildPatch as s03, buildAbilities as s04, buildPersuade as s05, buildCode as s06 } from './s01_patch.js';
import { buildReveal as s07, buildPit as s08, buildLevel as s09, buildLead as s10, buildRampage as s11, buildTowers as s12, buildEnemyBase as s13, buildHotfix as s14, buildLegend as s15 } from './s07_roshan.js';

// Shot list for the controllable-boss bug story. trans = transition INTO the shot.
export const SHOTS = [
  { id: 'select', start: 0.0, end: 3.3, trans: 'cut', build: s01 },
  { id: 'toboss', start: 3.3, end: 6.95, trans: 'whip', build: s02 },
  { id: 'patch', start: 6.95, end: 12.05, trans: 'flash', build: s03 },
  { id: 'abilities', start: 12.05, end: 15.3, trans: 'cut', build: s04 },
  { id: 'persuade', start: 15.3, end: 19.9, trans: 'whip', build: s05 },
  { id: 'code', start: 19.9, end: 22.9, trans: 'cut', build: s06 },
  { id: 'reveal', start: 22.9, end: 24.95, trans: 'flash', build: s07 },
  { id: 'pit', start: 24.95, end: 27.15, trans: 'cut', build: s08 },
  { id: 'level', start: 27.15, end: 29.95, trans: 'whip', build: s09 },
  { id: 'lead', start: 29.95, end: 32.55, trans: 'cut', build: s10 },
  { id: 'rampage', start: 32.55, end: 35.55, trans: 'flash', build: s11 },
  { id: 'towers', start: 35.55, end: 38.2, trans: 'whip', whipDir: -1, build: s12 },
  { id: 'enemy', start: 38.2, end: 41.65, trans: 'cut', build: s13 },
  { id: 'hotfix', start: 41.65, end: 45.45, trans: 'flash', build: s14 },
  { id: 'legend', start: 45.45, end: 48.8, trans: 'split', build: s15 },
];
export const CHUNKS = [
  'В Dota 2', 'был патч,', 'после которого', 'достаточно было', 'выбрать Chen', 'и дойти до', 'главного босса', 'карты,', 'чтобы почти', 'выиграть игру.',
  'В 2012 году', 'Valve выпустила', 'патч 6.75', 'и среди прочего', 'изменила способности', 'героя Chen.',
  'Его умение', 'Holy Persuasion', 'позволяет брать', 'под контроль', 'нейтральных крипов.',
  'Из-за ошибки', 'в коде', 'оно неожиданно', 'заработало', 'и на Рошане,', 'главном боссе', 'карты,', 'который обычно', 'сидит в своей', 'яме.',
  'Chen брал', 'Holy Persuasion', 'на первом уровне,', 'шёл к Рошану', 'и приводил его', 'на линию.',
  'Рошан бежал', 'за героем', 'и атаковал', 'всех подряд:', 'вражеских героев,', 'крипов и башни.',
  'Команде на', 'другом конце карты', 'приходилось совсем', 'несладко.',
  'Баг прожил', 'недолго:', 'Valve выпустила', 'хотфикс меньше', 'чем за сутки,', 'и контролируемый', 'Рошан остался', 'легендой.',
];
