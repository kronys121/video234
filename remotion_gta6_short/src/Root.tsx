import React from 'react';
import { Composition } from 'remotion';
import { Short, FPS, ShortData } from './Short';
import s1 from './data/short1.json';
import s2 from './data/short2.json';
import s3 from './data/short3.json';
import s4 from './data/short4.json';
import s5 from './data/short5.json';
import s6 from './data/short6.json';
import s7 from './data/short7.json';
import s8 from './data/short8.json';

// 1 — «GTA 6 не должна была работать на PS5», 2 — «Полиция GTA 6 тебя запомнит», 3 — «Как Rockstar обманывает PS5»,
// 4 — утечки, 5 — почему 13 лет, 6 — физика, 7 — только в цифре, 8 — живой мир
const list: [string, ShortData, string][] = [
  ['GTA6Short', s1 as ShortData, 'media/short1_audio.m4a'],
  ['GTA6Short2', s2 as ShortData, 'media/short2_audio.m4a'],
  ['GTA6Short3', s3 as ShortData, 'media/short3_audio.m4a'],
  ['GTA6Short4', s4 as ShortData, 'media/short4_audio.m4a'],
  ['GTA6Short5', s5 as ShortData, 'media/short5_audio.m4a'],
  ['GTA6Short6', s6 as ShortData, 'media/short6_audio.m4a'],
  ['GTA6Short7', s7 as ShortData, 'media/short7_audio.m4a'],
  ['GTA6Short8', s8 as ShortData, 'media/short8_audio.m4a'],
];
export const Root: React.FC = () => (
  <>
    {list.map(([id, data, audio]) => (
      <Composition key={id} id={id} component={Short} width={1080} height={1920} fps={FPS} durationInFrames={Math.round(data.total * FPS)} defaultProps={{ data, audio }} />
    ))}
  </>
);
