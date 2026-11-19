import React from 'react';
import { Composition } from 'remotion';
import { Video, SEC } from './Video';

export const Root: React.FC = () => (
  <Composition id="TLOU2" component={Video} width={1920} height={1080} fps={60} durationInFrames={Math.round(SEC * 60)} />
);
