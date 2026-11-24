import React from 'react';
import { Composition } from 'remotion';
import { Short, FPS, ShortData } from './Short';
import t1 from './data/t1.json';
import t2 from './data/t2.json';
import t3 from './data/t3.json';
import t4 from './data/t4.json';
import t5 from './data/t5.json';
import t6 from './data/t6.json';
import t7 from './data/t7.json';
import t8 from './data/t8.json';
import t9 from './data/t9.json';

// Шорты по ролику The Last of Us Part II на PS4:
// 1 — 7-летняя консоль, 2 — история мести, 3 — motion matching, 4 — враги, 5 — спрятанные загрузки,
// 6 — хитрости графики, 7 — звук, 8 — утечка сюжета, 9 — раскол аудитории
const list: [string, ShortData, string][] = [
  ['TLOU2Short1', t1 as ShortData, 'media/t1_audio.m4a'],
  ['TLOU2Short2', t2 as ShortData, 'media/t2_audio.m4a'],
  ['TLOU2Short3', t3 as ShortData, 'media/t3_audio.m4a'],
  ['TLOU2Short4', t4 as ShortData, 'media/t4_audio.m4a'],
  ['TLOU2Short5', t5 as ShortData, 'media/t5_audio.m4a'],
  ['TLOU2Short6', t6 as ShortData, 'media/t6_audio.m4a'],
  ['TLOU2Short7', t7 as ShortData, 'media/t7_audio.m4a'],
  ['TLOU2Short8', t8 as ShortData, 'media/t8_audio.m4a'],
  ['TLOU2Short9', t9 as ShortData, 'media/t9_audio.m4a'],
];
export const Root: React.FC = () => (
  <>
    {list.map(([id, data, audio]) => (
      <Composition key={id} id={id} component={Short} width={1080} height={1920} fps={FPS} durationInFrames={Math.round(data.total * FPS)} defaultProps={{ data, audio }} />
    ))}
  </>
);
