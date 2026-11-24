import React from 'react';
import { Composition } from 'remotion';
import { Short, FPS, ShortData } from './Short';
import c1 from './data/c1.json';
import c2 from './data/c2.json';
import c3 from './data/c3.json';
import c4 from './data/c4.json';
import c5 from './data/c5.json';
import c6 from './data/c6.json';
import c7 from './data/c7.json';
import c8 from './data/c8.json';
import c9 from './data/c9.json';
import c10 from './data/c10.json';
import c11 from './data/c11.json';

// Шорты по ролику «Crysis на консолях»: 1 — «А Crysis потянет?», 2 — Far Cry, 3 — Crysis 2007, 4 — игру не тянуло ничего,
// 5 — железо X360/PS3, 6 — CryEngine 3, 7 — консольная версия, 8 — ПК против консолей, 9 — вырезанный уровень, 10 — Switch, 11 — пресет
const list: [string, ShortData, string][] = [
  ['CrysisShort1', c1 as ShortData, 'media/c1_audio.m4a'],
  ['CrysisShort2', c2 as ShortData, 'media/c2_audio.m4a'],
  ['CrysisShort3', c3 as ShortData, 'media/c3_audio.m4a'],
  ['CrysisShort4', c4 as ShortData, 'media/c4_audio.m4a'],
  ['CrysisShort5', c5 as ShortData, 'media/c5_audio.m4a'],
  ['CrysisShort6', c6 as ShortData, 'media/c6_audio.m4a'],
  ['CrysisShort7', c7 as ShortData, 'media/c7_audio.m4a'],
  ['CrysisShort8', c8 as ShortData, 'media/c8_audio.m4a'],
  ['CrysisShort9', c9 as ShortData, 'media/c9_audio.m4a'],
  ['CrysisShort10', c10 as ShortData, 'media/c10_audio.m4a'],
  ['CrysisShort11', c11 as ShortData, 'media/c11_audio.m4a'],
];
export const Root: React.FC = () => (
  <>
    {list.map(([id, data, audio]) => (
      <Composition key={id} id={id} component={Short} width={1080} height={1920} fps={FPS} durationInFrames={Math.round(data.total * FPS)} defaultProps={{ data, audio }} />
    ))}
  </>
);
