import { Config } from '@remotion/cli/config';

// эффекты (цветокоррекция, зерно, засветы) работают через WebGL
Config.setChromiumOpenGlRenderer('angle');
Config.setVideoImageFormat('jpeg');
Config.setCrf(20);
