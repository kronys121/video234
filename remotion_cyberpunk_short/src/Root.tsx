import React from 'react';
import { Composition } from 'remotion';
import { Short, FPS, ShortData } from './Short';
import k1 from './data/k1.json';
import k2 from './data/k2.json';
import k3 from './data/k3.json';
import k4 from './data/k4.json';
import k5 from './data/k5.json';
import k6 from './data/k6.json';
import k7 from './data/k7.json';
import k8 from './data/k8.json';
import k9 from './data/k9.json';
import k10 from './data/k10.json';

// Шорты по ролику «Cyberpunk 2077»
const list: [string, ShortData, string][] = [
  ['CyberpunkShort1', k1 as ShortData, 'media/k1_audio.m4a'],
  ['CyberpunkShort2', k2 as ShortData, 'media/k2_audio.m4a'],
  ['CyberpunkShort3', k3 as ShortData, 'media/k3_audio.m4a'],
  ['CyberpunkShort4', k4 as ShortData, 'media/k4_audio.m4a'],
  ['CyberpunkShort5', k5 as ShortData, 'media/k5_audio.m4a'],
  ['CyberpunkShort6', k6 as ShortData, 'media/k6_audio.m4a'],
  ['CyberpunkShort7', k7 as ShortData, 'media/k7_audio.m4a'],
  ['CyberpunkShort8', k8 as ShortData, 'media/k8_audio.m4a'],
  ['CyberpunkShort9', k9 as ShortData, 'media/k9_audio.m4a'],
  ['CyberpunkShort10', k10 as ShortData, 'media/k10_audio.m4a'],
];
export const Root: React.FC = () => (
  <>
    {list.map(([id, data, audio]) => (
      <Composition key={id} id={id} component={Short} width={1080} height={1920} fps={FPS} durationInFrames={Math.round(data.total * FPS)} defaultProps={{ data, audio }} />
    ))}
  </>
);
