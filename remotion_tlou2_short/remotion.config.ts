import { Config } from '@remotion/cli/config';

Config.setVideoImageFormat('jpeg');
Config.setCrf(20);
// сколько ждать загрузки кадра клипа или картинки (по умолчанию 30 с)
Config.setDelayRenderTimeoutInMilliseconds(120000);
