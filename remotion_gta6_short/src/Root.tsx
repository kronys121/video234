import React from 'react';
import { Composition } from 'remotion';
import { Short, FPS, ShortData } from './Short';
import s1 from './data/short1.json';
import s2 from './data/short2.json';
import s3 from './data/short3.json';

// 1 — «GTA 6 не должна была работать на PS5», 2 — «Полиция GTA 6 тебя запомнит», 3 — «Как Rockstar обманывает PS5»
const list: [string, ShortData, string][] = [
  ['GTA6Short', s1 as ShortData, 'media/short1_audio.m4a'],
  ['GTA6Short2', s2 as ShortData, 'media/short2_audio.m4a'],
  ['GTA6Short3', s3 as ShortData, 'media/short3_audio.m4a'],
];
export const Root: React.FC = () => (
  <>
    {list.map(([id, data, audio]) => (
      <Composition key={id} id={id} component={Short} width={1080} height={1920} fps={FPS} durationInFrames={Math.round(data.total * FPS)} defaultProps={{ data, audio }} />
    ))}
  </>
);
