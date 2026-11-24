import React from 'react';
import { Composition } from 'remotion';
import { Short, FPS, ShortData } from './Short';
import g1 from './data/g1.json';
import g2 from './data/g2.json';
import g3 from './data/g3.json';
import g4 from './data/g4.json';
import g5 from './data/g5.json';
import g6 from './data/g6.json';
import g7 from './data/g7.json';
import g8 from './data/g8.json';
import g9 from './data/g9.json';
import g10 from './data/g10.json';

// Шорты по ролику «GTA 5 на PS3»: 1 — безумие, 2 — карта, 3 — Cell, 4 — два крана, 5 — память, 6 — смена персонажа,
// 7 — живой мир, 8 — предсказание, 9 — цена, 10 — GTA Online
const list: [string, ShortData, string][] = [
  ['GTA5Short1', g1 as ShortData, 'media/g1_audio.m4a'],
  ['GTA5Short2', g2 as ShortData, 'media/g2_audio.m4a'],
  ['GTA5Short3', g3 as ShortData, 'media/g3_audio.m4a'],
  ['GTA5Short4', g4 as ShortData, 'media/g4_audio.m4a'],
  ['GTA5Short5', g5 as ShortData, 'media/g5_audio.m4a'],
  ['GTA5Short6', g6 as ShortData, 'media/g6_audio.m4a'],
  ['GTA5Short7', g7 as ShortData, 'media/g7_audio.m4a'],
  ['GTA5Short8', g8 as ShortData, 'media/g8_audio.m4a'],
  ['GTA5Short9', g9 as ShortData, 'media/g9_audio.m4a'],
  ['GTA5Short10', g10 as ShortData, 'media/g10_audio.m4a'],
];
export const Root: React.FC = () => (
  <>
    {list.map(([id, data, audio]) => (
      <Composition key={id} id={id} component={Short} width={1080} height={1920} fps={FPS} durationInFrames={Math.round(data.total * FPS)} defaultProps={{ data, audio }} />
    ))}
  </>
);
