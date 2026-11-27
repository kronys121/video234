import React from 'react';
import { Composition } from 'remotion';
import { Minute, MINUTE_SEC } from './Minute';

export const FPS = 60;
export const Root: React.FC = () => (
  <Composition id="TLOU2-Minute" component={Minute} width={1920} height={1080} fps={FPS} durationInFrames={MINUTE_SEC * FPS} />
);
