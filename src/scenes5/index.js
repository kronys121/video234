import { buildIntro as s01, buildPrice as s02, buildFame as s03, buildHit as s06, buildStudio as s07, buildHuge as s11, buildBillions as s13 } from './s01_world.js';
import { buildRoom as s04, buildSolo as s05, buildCritics as s08, buildAttention as s09, buildBlog as s10, buildDeal as s12, buildExit as s14 } from './s04_room.js';

// Shot list for the Minecraft / Notch story. trans = transition INTO the shot.
export const SHOTS = [
  { id: 'intro', start: 0.0, end: 3.0, trans: 'cut', build: s01 },
  { id: 'price', start: 3.0, end: 5.2, trans: 'flash', build: s02 },
  { id: 'fame', start: 5.2, end: 7.42, trans: 'whip', build: s03 },
  { id: 'room', start: 7.42, end: 10.2, trans: 'cut', build: s04 },
  { id: 'solo', start: 10.2, end: 12.62, trans: 'flash', build: s05 },
  { id: 'hit', start: 12.62, end: 15.15, trans: 'whip', build: s06 },
  { id: 'studio', start: 15.15, end: 18.05, trans: 'flash', build: s07 },
  { id: 'critics', start: 18.05, end: 20.45, trans: 'whip', whipDir: -1, build: s08 },
  { id: 'attention', start: 20.45, end: 22.48, trans: 'cut', build: s09 },
  { id: 'blog', start: 22.48, end: 25.75, trans: 'flash', build: s10 },
  { id: 'huge', start: 25.75, end: 29.42, trans: 'whip', build: s11 },
  { id: 'deal', start: 29.42, end: 32.3, trans: 'cut', build: s12 },
  { id: 'billions', start: 32.3, end: 34.8, trans: 'flash', build: s13 },
  { id: 'exit', start: 34.8, end: 37.0, trans: 'split', build: s14 },
];
export const CHUNKS = [
  'Парень, который', 'сделал Minecraft,', 'продал свою компанию', 'за 2,5 миллиарда', 'долларов,', 'потому что', 'устал быть знаменитым.',
  'Маркус Перссон,', 'известный как Нотч,', 'начал делать', 'Minecraft в 2009', 'году в одиночку.',
  'Игра быстро выросла', 'в мировой хит,', 'а его студия Mojang', 'стала одной из', 'самых известных', 'в индустрии.',
  'Но вместе с успехом', 'пришли критика,', 'давление и постоянное', 'внимание.',
  'В 2014 году', 'Перссон написал,', 'что не чувствует себя', 'подходящим человеком', 'для руководства', 'таким огромным проектом.',
  'В сентябре', 'того же года', 'Mojang купила', 'Microsoft', 'за 2,5 миллиарда', 'долларов,', 'а сам Нотч', 'ушёл из компании.',
];
