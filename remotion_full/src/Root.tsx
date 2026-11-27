import React from 'react';
import { Composition } from 'remotion';
import { Full, TOTAL_FRAMES, FPS } from './Full';

export const Root: React.FC = () => (
  <Composition id="TLOU2" component={Full} width={1920} height={1080} fps={FPS} durationInFrames={TOTAL_FRAMES} />
);
