import React from 'react';
import { Composition } from 'remotion';
import { Short, FPS, ShortData } from './Short';
import sa1 from './data/sa1.json';
import sa2 from './data/sa2.json';
import sa3 from './data/sa3.json';
import sa4 from './data/sa4.json';
import sa5 from './data/sa5.json';
import sa6 from './data/sa6.json';
import sa7 from './data/sa7.json';

// Шорты по ролику GTA San Andreas на PS2:
// 1 — 32 МБ, 2 — стриминг, 3 — туман и копии, 4 — карта меньше, чем кажется, 5 — всё в одной игре, 6 — CJ толстеет, 7 — Hot Coffee
const list: [string, ShortData, string][] = [
  ['GTASAShort1', sa1 as ShortData, 'media/sa1_audio.m4a'],
  ['GTASAShort2', sa2 as ShortData, 'media/sa2_audio.m4a'],
  ['GTASAShort3', sa3 as ShortData, 'media/sa3_audio.m4a'],
  ['GTASAShort4', sa4 as ShortData, 'media/sa4_audio.m4a'],
  ['GTASAShort5', sa5 as ShortData, 'media/sa5_audio.m4a'],
  ['GTASAShort6', sa6 as ShortData, 'media/sa6_audio.m4a'],
  ['GTASAShort7', sa7 as ShortData, 'media/sa7_audio.m4a'],
];
export const Root: React.FC = () => (
  <>
    {list.map(([id, data, audio]) => (
      <Composition key={id} id={id} component={Short} width={1080} height={1920} fps={FPS} durationInFrames={Math.round(data.total * FPS)} defaultProps={{ data, audio }} />
    ))}
  </>
);
