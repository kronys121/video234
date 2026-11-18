# GTA 6 на PS5 — полный ролик с рекламой ggsel (рендер через Remotion, 60 к/с)

Монтаж в стиле референса: светлая студия, вырезки, иконки, подписи, геймплей в карточках, всё под твою озвучку.
Ролик 10:59 + реклама ggsel на 2:54,9 (подводка с твоим голосом + основной блок) = **11:37**, 1920×1080, 60 к/с.

## Как запустить

Нужен Node.js 18 или новее: https://nodejs.org

```
npm install
npm run render     # готовое видео: out/gta6_final.mp4 (8 потоков)
npm run studio     # предпросмотр с ползунком
```

При первом запуске клипы из `clips_src/` нарезаются в кадры (папка `public/site/gta6/clips`, ~2,2 ГБ) — пара минут, дальше пропускается.
Если на компьютере меньше 8 потоков — поменяй `--concurrency=8` в `package.json` на своё число.

## Что где

- `src/Full.tsx` — склейка: ролик до 2:54,9, реклама, ролик дальше; одна звуковая дорожка.
- `public/site/gta6/` — страница монтажа: `beats.js` (все 150 сцен с таймингами по словам), `engine.js` (анимации), `img/` (вырезки и картинки).
- `public/media/mix.m4a` — звук: голос, музыка (идёт без пауз, и под рекламой тоже), эффекты и звук рекламы.
- `public/media/gta6_ggsel.mp4` — реклама.

## В описание видео (музыка по лицензии CC BY)

```
Music: "Electro Cabello", "Cut and Run", "Getting it Done", "Raving Energy" — Kevin MacLeod (incompetech.com)
Licensed under Creative Commons: By Attribution 4.0 License
http://creativecommons.org/licenses/by/4.0/
```

Звуковые эффекты — BigSoundBank и OpenGameArt (CC0), подпись не нужна.
