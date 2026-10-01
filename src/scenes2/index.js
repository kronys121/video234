import { build as s01 } from './s01_room.js';
import { build as s02 } from './s02_twitch.js';
import { build as s03 } from './s03_crowd.js';
import { build as s04 } from './s04_quantum.js';
import { build as s05 } from './s05_bars.js';
import { build as s06 } from './s06_storm.js';
import { build as s07 } from './s07_record.js';
import { build as s08 } from './s08_colleague.js';
import { build as s09 } from './s09_police.js';
import { build as s10 } from './s10_phone.js';
import { buildWide as s11, buildClose as s12 } from './s11_board.js';
import { build as s13 } from './s13_home.js';
import { build as s14 } from './s14_fbi.js';
import { build as s15 } from './s15_bots.js';
import { buildCards as s16, buildTransfer as s18, buildOffer as s19 } from './s16_den.js';
import { build as s17 } from './s17_cash.js';
import { build as s20 } from './s18_blame.js';
import { build as s21 } from './s19_enjoy.js';
import { build as s22 } from './s20_seized.js';

// Shot list for the streamer story. start/end follow pauses and sense breaks in the narration.
export const SHOTS = [
  { id: 'room', start: 0.0, end: 3.0, trans: 'cut', build: s01 },
  { id: 'twitch', start: 3.0, end: 5.15, trans: 'flash', build: s02 },
  { id: 'crowd', start: 5.15, end: 9.6, trans: 'whip', build: s03 },
  { id: 'quantum', start: 9.6, end: 13.0, trans: 'flash', build: s04 },
  { id: 'bars', start: 13.0, end: 16.05, trans: 'cut', build: s05 },
  { id: 'storm', start: 16.05, end: 19.05, trans: 'whip', build: s06 },
  { id: 'record', start: 19.05, end: 22.7, trans: 'flash', build: s07 },
  { id: 'colleague', start: 22.7, end: 26.9, trans: 'split', build: s08 },
  { id: 'police', start: 26.9, end: 29.6, trans: 'flash', build: s09 },
  { id: 'phone', start: 29.6, end: 32.25, trans: 'whip', build: s10 },
  { id: 'boardWide', start: 32.25, end: 35.25, trans: 'cut', build: s11 },
  { id: 'boardClose', start: 35.25, end: 38.1, trans: 'whip', whipDir: -1, build: s12 },
  { id: 'home', start: 38.1, end: 42.1, trans: 'flash', build: s13 },
  { id: 'fbi', start: 42.1, end: 44.65, trans: 'whip', build: s14 },
  { id: 'bots', start: 44.65, end: 47.8, trans: 'flash', build: s15 },
  { id: 'cards', start: 47.8, end: 51.65, trans: 'whip', whipDir: -1, build: s16 },
  { id: 'cashout', start: 51.65, end: 56.45, trans: 'flash', build: s17 },
  { id: 'transfer', start: 56.45, end: 58.95, trans: 'whip', build: s18 },
  { id: 'offer', start: 58.95, end: 61.6, trans: 'cut', build: s19 },
  { id: 'blame', start: 61.6, end: 64.1, trans: 'flash', build: s20 },
  { id: 'enjoy', start: 64.1, end: 66.15, trans: 'whip', build: s21 },
  { id: 'seized', start: 66.15, end: 68.6, trans: 'flash', build: s22 },
];
export const CHUNKS = [
  'В 2018 году', 'одним из самых', 'популярных направлений', 'на Twitch', 'были спидраны.',
  'Спидранеры собирали', 'десятки тысяч', 'зрителей и неплохо', 'зарабатывали на донатах,',
  'но особенно', 'выделялся один', 'стример по имени', 'Квантум.',
  'Зрителей у него', 'было не так', 'много, как у', 'топовых спидранеров,', 'зато донаты', 'приходили просто', 'сумасшедшие',
  'за один стрим', 'по спидрану Марио', 'он собирал', 'десятки тысяч долларов,', 'тогда как коллега', 'с десятью тысячами', 'зрителей зарабатывал', 'куда меньше.',
  'Примерно в это', 'же время', 'в полицию стали', 'обращаться люди,', 'с чьих карт', 'списывали крупные', 'суммы денег.',
  'Между всеми', 'пострадавшими', 'нашлось кое-что', 'общее:',
  'все они якобы', 'донатили этому', 'стримеру.',
  'Загвоздка была', 'в том, что', 'ни один', 'из них никогда', 'не смотрел', 'Twitch.',
  'За канал взялось', 'ФБР,', 'и выяснилось, что', 'практически весь', 'онлайн на стриме', 'был накручен ботами,', 'а все донаты', 'поступали именно', 'с этих ворованных', 'карт.',
  'Стример при этом', 'честно выводил деньги,', 'платил с них', 'налоги,', 'забирал свою часть,',
  'а остальное переводил', 'хакерам,', 'которые изначально', 'и предложили ему', 'эту схему заработка.',
  'В итоге крайним', 'оказался именно', 'стример',
  'он неплохо заработал', 'на этой схеме,', 'но в конце', 'концов все деньги', 'у него изъяли.',
];
