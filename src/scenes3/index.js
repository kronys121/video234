import { buildIntro as s01, buildGiant as s02, buildWarn as s03, buildHit as s04 } from './s01_snow.js';
import { buildFlight as s05, buildBug as s06 } from './s05_space.js';
import { buildDevs as s07, buildRelease as s17 } from './s07_office.js';
import { buildExterior as s08, buildBucket as s09, buildBlind as s10, buildLoot as s11 } from './s08_shop.js';
import { buildInterview as s12, buildExplain as s13, buildFun as s14, buildKeep as s15, buildStrategy as s16 } from './s12_studio.js';
import { build as s18 } from './s18_final.js';

// Shot list for the Skyrim bugs story. trans = transition INTO the shot.
export const SHOTS = [
  { id: 'intro', start: 0.0, end: 2.86, trans: 'cut', build: s01 },
  { id: 'giant', start: 2.86, end: 5.4, trans: 'flash', build: s02 },
  { id: 'warn', start: 5.4, end: 7.75, trans: 'whip', build: s03 },
  { id: 'hit', start: 7.75, end: 10.1, trans: 'cut', build: s04 },
  { id: 'flight', start: 10.1, end: 14.25, trans: 'flash', build: s05 },
  { id: 'bug', start: 14.25, end: 17.15, trans: 'whip', build: s06 },
  { id: 'devs', start: 17.15, end: 20.35, trans: 'flash', build: s07 },
  { id: 'shopExt', start: 20.35, end: 22.75, trans: 'whip', build: s08 },
  { id: 'bucket', start: 22.75, end: 27.25, trans: 'cut', build: s09 },
  { id: 'blind', start: 27.25, end: 29.55, trans: 'whip', whipDir: -1, build: s10 },
  { id: 'loot', start: 29.55, end: 32.1, trans: 'cut', build: s11 },
  { id: 'interview', start: 32.1, end: 34.65, trans: 'flash', build: s12 },
  { id: 'explain', start: 34.65, end: 37.55, trans: 'cut', build: s13 },
  { id: 'fun', start: 37.55, end: 42.2, trans: 'split', build: s14 },
  { id: 'keep', start: 42.2, end: 45.5, trans: 'whip', build: s15 },
  { id: 'strategy', start: 45.5, end: 48.25, trans: 'flash', build: s16 },
  { id: 'release', start: 48.25, end: 52.95, trans: 'whip', whipDir: -1, build: s17 },
  { id: 'final', start: 52.95, end: 56.8, trans: 'flash', build: s18 },
];
export const CHUNKS = [
  'Если вы играли', 'в Skyrim,', 'то наверняка помните:',
  'великан в самом', 'начале игры', 'весьма доходчиво', 'объясняет,', 'что с ним', 'лучше не шутить.',
  'Один его удар', 'и персонаж улетает', 'в буквальном смысле', 'на другую планету,', 'кувыркаясь где-то', 'в стратосфере.',
  'Это был', 'очевидный баг физики,', 'но игрокам', 'он так понравился,', 'что разработчики', 'решили его', 'не трогать.',
  'Похожая история', 'случилась с другим', 'багом:',
  'если зайти', 'в лавку торговца', 'и надеть ему', 'на голову', 'обычное деревянное', 'ведро,',
  'продавец переставал', 'видеть, как', 'покупатель спокойно', 'обчищает его', 'собственный магазин.',
  'Глава студии', 'Bethesda', 'Тодд Говард', 'в интервью', 'объяснял общий', 'подход студии', 'довольно просто:',
  'если баг', 'никому не мешает,', 'а его исправление', 'сделало бы игру', 'менее весёлой,',
  'такие баги', 'в студии предпочитают', 'просто оставлять', 'как есть.',
  'И в этом', 'на самом деле', 'отличная стратегия:',
  'можно выпустить игру,', 'а дальше чинить', 'только то, что', 'действительно раздражает', 'игроков,',
  'и бережно сохранять', 'то, что им,', 'наоборот, искренне', 'нравится.',
];
