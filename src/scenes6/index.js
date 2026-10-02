import { buildIntro as s01, buildMenu as s02 } from './s01_cheat.js';
import { buildBoss as s03, buildPolice as s04, buildOdds as s05 } from './s03_corp.js';
import { buildDetectives as s06, buildUndercover as s07, buildChat as s08, buildBoard as s09, buildMap as s10 } from './s06_det.js';
import { buildCrypto as s11, buildFound as s12 } from './s11_money.js';
import { buildKnock as s13, buildOptions as s14, buildChoice as s15, buildBroke as s16, buildDoor2 as s17 } from './s13_lawyers.js';

// Shot list for the GTA Online / Luna cheat story. trans = transition INTO the shot.
export const SHOTS = [
  { id: 'intro', start: 0.0, end: 3.0, trans: 'cut', build: s01 },
  { id: 'menu', start: 3.0, end: 5.85, trans: 'whip', build: s02 },
  { id: 'boss', start: 5.85, end: 8.4, trans: 'flash', build: s03 },
  { id: 'police', start: 8.4, end: 11.3, trans: 'whip', build: s04 },
  { id: 'odds', start: 11.3, end: 14.55, trans: 'cut', build: s05 },
  { id: 'detectives', start: 14.55, end: 18.95, trans: 'flash', build: s06 },
  { id: 'undercover', start: 18.95, end: 22.4, trans: 'whip', build: s07 },
  { id: 'chat', start: 22.4, end: 27.2, trans: 'cut', build: s08 },
  { id: 'board', start: 27.2, end: 30.75, trans: 'flash', build: s09 },
  { id: 'map', start: 30.75, end: 33.15, trans: 'whip', whipDir: -1, build: s10 },
  { id: 'crypto', start: 33.15, end: 37.95, trans: 'flash', build: s11 },
  { id: 'found', start: 37.95, end: 42.0, trans: 'cut', build: s12 },
  { id: 'knock', start: 42.0, end: 45.85, trans: 'whip', build: s13 },
  { id: 'options', start: 45.85, end: 50.6, trans: 'flash', build: s14 },
  { id: 'choice', start: 50.6, end: 52.0, trans: 'cut', build: s15 },
  { id: 'broke', start: 52.0, end: 55.35, trans: 'whip', build: s16 },
  { id: 'door2', start: 55.35, end: 57.8, trans: 'split', build: s17 },
];
export const CHUNKS = [
  'В 2021 году', 'самым популярным', 'читом для', 'GTA Online', 'было читменю Luna.',
  'Rockstar это', 'очень не нравилось,', 'но обращаться', 'в полицию', 'смысла не было:', 'такими делами', 'там почти', 'не занимаются,', 'а успех', 'был бы маловероятен.',
  'Поэтому компания', 'наняла частных', 'детективов,', 'бывших агентов ФБР.',
  'Они под видом', 'обычных игроков', 'общались с', 'разработчиками чита', 'в Discord,', 'а те', 'в разговорах упоминали', 'то погоду,', 'то отключения', 'электричества.',
  'Детективы всё', 'записывали и сверяли', 'с местными новостями,', 'и круг поиска', 'постепенно сужался.',
  'Разработчики продавали', 'читы за', 'криптовалюту', 'и гоняли деньги', 'через сотню кошельков,',
  'но детективы', 'нашли тот,', 'с которого средства', 'выводились на', 'личные карты.',
  'Вскоре к каждому', 'пришли юристы Rockstar', 'с двумя вариантами:',
  'либо все', 'заработанные деньги', 'уходят на', 'благотворительность,', 'либо будет больно.',
  'Выбрали первый.',
  'Они остались', 'без денег', 'и теперь под', 'постоянным наблюдением,', 'на случай если', 'понадобится', 'второй вариант.',
];
