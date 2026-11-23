import React from 'react';
import { Composition } from 'remotion';
import { Short, TOTAL_FRAMES, FPS } from './Short';

export const Root: React.FC = () => (
  <Composition id="GTA6Short" component={Short} width={1080} height={1920} fps={FPS} durationInFrames={TOTAL_FRAMES} />
);
