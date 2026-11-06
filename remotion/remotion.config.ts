import { Config } from '@remotion/cli/config';

// WebGL в ролике не используется; angle оставлен на случай, если эффекты Remotion вернутся
Config.setChromiumOpenGlRenderer('angle');
Config.setVideoImageFormat('jpeg');
Config.setCrf(20);
