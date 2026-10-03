import { buildArcade as s01, buildJumpman as s02, buildDesigner as s03, buildLicense as s04, buildUSA as s05, buildName as s06, buildRename as s11, buildPauline as s18 } from './s01_arcade.js';
import { buildBook as s07, buildLandlord as s08, buildScold as s09, buildTime as s10, buildInterview as s12, buildJoke as s13, buildHermit as s14 } from './s07_warehouse.js';
import { buildConfirm as s15, buildHonor as s16, buildShrug as s17, buildWife as s19, buildShy as s20, buildDeeds as s21 } from './s15_final.js';

// Shot list for the "how Mario got his name" story. trans = transition INTO the shot.
export const SHOTS = [
  { id: 'arcade', start: 0.0, end: 2.55, trans: 'cut', build: s01 },
  { id: 'jumpman', start: 2.55, end: 4.55, trans: 'flash', build: s02 },
  { id: 'designer', start: 4.55, end: 7.05, trans: 'whip', build: s03 },
  { id: 'license', start: 7.05, end: 9.98, trans: 'cut', build: s04 },
  { id: 'usa', start: 9.98, end: 12.4, trans: 'whip', build: s05 },
  { id: 'name', start: 12.4, end: 16.3, trans: 'flash', build: s06 },
  { id: 'book', start: 16.3, end: 20.65, trans: 'split', build: s07 },
  { id: 'landlord', start: 20.65, end: 24.62, trans: 'whip', build: s08 },
  { id: 'scold', start: 24.62, end: 29.2, trans: 'cut', build: s09 },
  { id: 'time', start: 29.2, end: 31.55, trans: 'whip', whipDir: -1, build: s10 },
  { id: 'rename', start: 31.55, end: 33.7, trans: 'flash', build: s11 },
  { id: 'interview', start: 33.7, end: 38.45, trans: 'split', build: s12 },
  { id: 'joke', start: 38.45, end: 41.05, trans: 'whip', build: s13 },
  { id: 'hermit', start: 41.05, end: 44.15, trans: 'cut', build: s14 },
  { id: 'confirm', start: 44.15, end: 48.0, trans: 'flash', build: s15 },
  { id: 'honor', start: 48.0, end: 49.6, trans: 'cut', build: s16 },
  { id: 'shrug', start: 49.6, end: 51.45, trans: 'whip', build: s17 },
  { id: 'pauline', start: 51.45, end: 54.2, trans: 'flash', build: s18 },
  { id: 'wife', start: 54.2, end: 57.1, trans: 'whip', whipDir: -1, build: s19 },
  { id: 'shy', start: 57.1, end: 59.45, trans: 'cut', build: s20 },
  { id: 'deeds', start: 59.45, end: 62.5, trans: 'flash', build: s21 },
];
export const CHUNKS = [
  'Сначала прыгающего', 'через бочки', 'героя Donkey Kong', 'называли Jumpman.',
  'Сигэру Миямото', 'придумал его', 'в том числе', 'потому, что', 'Nintendo не смогла', 'получить лицензию', 'на Popeye.',
  'Когда игру', 'готовили к выходу', 'в США,', 'герою понадобилось', 'нормальное имя,', 'и тут появляются', 'две версии.',
  'По первой,', 'известной из книги', 'Дэвида Шеффа', '1993 года,',
  'владелец склада', 'Марио Сегале', 'пришёл за', 'просроченной арендой',
  'и отчитал', 'президента Nintendo', 'of America', 'Минору Аракаву', 'прямо перед', 'сотрудниками,', 'но дал время', 'найти деньги,', 'а героя потом', 'переименовали в Марио.',
  'По второй,', 'которую в 2012 году', 'рассказал бывший', 'менеджер склада', 'Дон Джеймс,',
  'имя дали', 'в шутку,', 'потому что Сегале', 'был таким затворником,', 'что никто', 'из сотрудников', 'его ни разу', 'не видел.',
  'Сам Миямото', 'в 2015 году', 'подтвердил, что', 'Марио назван', 'именно в честь', 'Сегале,',
  'но не рассказал,', 'как это вышло.',
  'Подруга героя', 'Полин, кстати,', 'получила имя', 'от жены', 'одного из сотрудников', 'Nintendo of America.',
  'Сам Сегале', 'не любил известности', 'и хотел, чтобы', 'о нём помнили', 'по его делам,', 'а не по игре.',
];
