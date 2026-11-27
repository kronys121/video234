import { Config } from '@remotion/cli/config';

Config.setVideoImageFormat('jpeg');
Config.setCrf(16);
// качество промежуточных кадров: по умолчанию JPEG 80 — отсюда «зерно» на тексте и размытых фонах
Config.setJpegQuality(100);
Config.setX264Preset('slow');
// сколько ждать загрузки кадра клипа или картинки (по умолчанию 30 с)
Config.setDelayRenderTimeoutInMilliseconds(120000);
// рендер страниц на видеокарте (ANGLE): быстрее на компьютере с GPU
Config.setChromiumOpenGlRenderer('angle');
