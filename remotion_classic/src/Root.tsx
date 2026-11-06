import React from 'react';
import { Composition } from 'remotion';
import { Pilot, PILOT_SEC } from './Pilot';

export const FPS = 60;
export const Root: React.FC = () => (
  <Composition id="TLOU2" component={Pilot} width={1920} height={1080} fps={FPS} durationInFrames={Math.round(PILOT_SEC * FPS)} />
);
