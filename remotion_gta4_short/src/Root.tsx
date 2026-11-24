import React from 'react';
import { Composition } from 'remotion';
import { Short, FPS, ShortData } from './Short';
import q1 from './data/q1.json';
import q2 from './data/q2.json';
import q3 from './data/q3.json';
import q4 from './data/q4.json';
import q5 from './data/q5.json';
import q6 from './data/q6.json';
import q7 from './data/q7.json';
import q8 from './data/q8.json';

// Шорты по ролику «GTA 4»
const list: [string, ShortData, string][] = [
  ['GTA4Short1', q1 as ShortData, 'media/q1_audio.m4a'],
  ['GTA4Short2', q2 as ShortData, 'media/q2_audio.m4a'],
  ['GTA4Short3', q3 as ShortData, 'media/q3_audio.m4a'],
  ['GTA4Short4', q4 as ShortData, 'media/q4_audio.m4a'],
  ['GTA4Short5', q5 as ShortData, 'media/q5_audio.m4a'],
  ['GTA4Short6', q6 as ShortData, 'media/q6_audio.m4a'],
  ['GTA4Short7', q7 as ShortData, 'media/q7_audio.m4a'],
  ['GTA4Short8', q8 as ShortData, 'media/q8_audio.m4a'],
];
export const Root: React.FC = () => (
  <>
    {list.map(([id, data, audio]) => (
      <Composition key={id} id={id} component={Short} width={1080} height={1920} fps={FPS} durationInFrames={Math.round(data.total * FPS)} defaultProps={{ data, audio }} />
    ))}
  </>
);
