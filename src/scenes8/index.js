import { buildModder as s01, buildMap as s02, buildIdea as s03, buildHandoff as s04, buildRecipes as s05, buildRiot as s06, buildInvite as s07, buildRefuse as s08 } from './s01_mod.js';
import { buildValve as s09, buildHire as s10, buildSoon as s11, buildTI as s12, buildPrize as s13, buildChamps as s14, buildCrowdfund as s15, buildForty as s16, buildShop as s17, buildEul as s18, buildVyse as s19 } from './s09_valve.js';

// Shot list for the DotA story. trans = transition INTO the shot.
export const SHOTS = [
  { id: 'modder', start: 0.0, end: 3.55, trans: 'cut', build: s01 },
  { id: 'map', start: 3.55, end: 6.0, trans: 'flash', build: s02 },
  { id: 'idea', start: 6.0, end: 8.8, trans: 'whip', build: s03 },
  { id: 'handoff', start: 8.8, end: 11.0, trans: 'cut', build: s04 },
  { id: 'recipes', start: 11.0, end: 13.05, trans: 'flash', build: s05 },
  { id: 'riot', start: 13.05, end: 17.0, trans: 'whip', build: s06 },
  { id: 'invite', start: 17.0, end: 19.1, trans: 'cut', build: s07 },
  { id: 'refuse', start: 19.1, end: 21.85, trans: 'whip', whipDir: -1, build: s08 },
  { id: 'valve', start: 21.85, end: 25.85, trans: 'flash', build: s09 },
  { id: 'hire', start: 25.85, end: 29.35, trans: 'cut', build: s10 },
  { id: 'soon', start: 29.35, end: 33.0, trans: 'whip', build: s11 },
  { id: 'ti', start: 33.0, end: 36.65, trans: 'flash', build: s12 },
  { id: 'prize', start: 36.65, end: 40.05, trans: 'cut', build: s13 },
  { id: 'champs', start: 40.05, end: 43.2, trans: 'flash', build: s14 },
  { id: 'crowd', start: 43.2, end: 46.15, trans: 'whip', build: s15 },
  { id: 'forty', start: 46.15, end: 49.9, trans: 'cut', build: s16 },
  { id: 'shop', start: 49.9, end: 53.65, trans: 'split', build: s17 },
  { id: 'eul', start: 53.65, end: 55.5, trans: 'flash', build: s18 },
  { id: 'vyse', start: 55.5, end: 57.7, trans: 'whip', build: s19 },
];
export const CHUNKS = [
  'В 2003 году', 'моддер Eul', 'сделал для', 'Warcraft III', 'пользовательскую карту', 'Defense of', 'the Ancients,', 'взяв за основу', 'идею карты', 'для StarCraft.',
  'Потом проект', 'перешёл к', 'другим авторам:', 'Guinsoo добавил', 'рецепты предметов,', 'а в 2005 году', 'ушёл в Riot Games', 'делать League', 'of Legends.',
  'Он звал IceFrog', 'с собой,', 'но тот отказался', 'и продолжил', 'развивать мод.',
  'К 2009 году', 'сотрудники Valve', 'сами играли', 'в DotA,', 'и компания', 'наняла IceFrog', 'делать отдельную', 'игру.',
  'В 2011 году,', 'ещё до выхода', 'Dota 2,', 'Valve провела', 'на Gamescom', 'первый турнир', 'The International', 'с призовым фондом', '1,6 миллиона', 'долларов,',
  'миллион из которых', 'достался команде', 'Natus Vincere.',
  'Потом фонд', 'стали пополнять', 'деньгами самих', 'игроков,', 'и в 2021 году', 'он дошёл', 'до 40 миллионов.',
  'В игре', 'до сих пор', 'остались предметы,', 'названные в честь', 'авторов мода:', "Eul's Scepter", 'of Divinity', 'и Scythe of Vyse', 'от Guinsoo.',
];
