# Как сделаны ролики под Remotion — для передачи в другой чат

Репозиторий: `kronys121/video234`, ветка `claude/dazzling-tesla-496s18`.
Канал: «Игры, которые вывели консоль за пределы возможностей». Голос — запись автора, графика — код.

## Главная идея

Сцены рисует **собственный движок v2** (HTML + JS, без React): страница с функцией `window.renderAt(t)`, которая детерминированно рисует кадр на момент `t` секунд.
Remotion используется только как **рендерер**: в композиции стоит `<iframe>` со страницей движка, на каждом кадре вызывается `renderAt(frame / fps)`, Remotion снимает кадр и собирает mp4 со звуком.
Так картинка 1-в-1 как в старых роликах, а рендер идёт у автора на ПК (Windows, Ryzen 7 5700X3D, 8 потоков).

## Где что лежит

| Путь | Что это |
|---|---|
| `tlou2/_head.js` | ядро движка: появление элементов (popIn), камера, подписи (`g.cap`), карточки/клипы (`g.card`), виджеты (BIGNUM, PLATE, GROW, MAPG, LODH, SLIDERS, RAMST и др.), поиск слова в озвучке `at()` |
| `tlou2/_helpers.js` | помощники поверх ядра: `BT(t, bg, fn, cam)` (сцена с правилом «элемент держится минимум 2 с»), `NUM`, `pl`, `SLAM`, `ARW`, `SOCC` и др. |
| `tlou2/_tail.js` | камера между сценами, фоны, `renderAt`, загрузка шрифтов |
| `tlou2/beats.js`, `gta_sa/beats.js` | **сцены конкретного ролика** (это главное, что пишется под каждый ролик) |
| `gta_sa/build.sh` | склейка страницы: `_head + _helpers + beats + _tail` → `gta_sa/gta_sa.js` + `gta_sa.html` |
| `gta_sa/voice/words.json` | слова озвучки с таймингом (faster-whisper small, `word_timestamps`) — по ним сцены привязаны к словам: `w('слово')` |
| `gta_sa/clips.py` | нарезка клипов из геймплея: 8 с, 30 к/с, 960×540, кадры jpg в `gta_sa/clips/<имя>/0001.jpg…` (у записей миссий 1280×720 срезаются чёрные полосы) |
| `gta_sa/check.mjs` | проверка страницы: не найденные слова, ошибки |
| `gta_sa/assets/` | вырезки (PS2, Си-Джей, Тенпенни, логотип Rockstar), обложки, карта |
| `gta_sa/ad/` | реклама ggsel: текст, графика подводки, `placement.json` (где вставлять) |
| `gta_sa/thumb/` | превью (`thumb.html` + `shoot.mjs`, Playwright) |
| `remotion_sa/` | **проект Remotion для GTA SA** (то, что отдаётся автору на рендер) |
| `remotion_full/` | то же для TLOU2 |
| `remotion_classic/` | ранний пилот: первая минута TLOU2, сцены переписаны на React (от этого подхода отказались) |
| `remotion_v3/` | эксперимент с другим монтажом (автор решил оставить старый) |
| `gta4_ps3/render.mjs` | старый рендерер (Playwright, кадры → ffmpeg); используется для проверочных кадров: `PAGE=../gta_sa/gta_sa.html node gta4_ps3/render.mjs stills 12.5 240` → `gta4_ps3/tmp/` |

## Проект Remotion (`remotion_sa/`)

- `src/Full.tsx` — композиция: `<iframe src=staticFile('site/gta_sa/gta_sa.html')>`, на кадр `delayRender` → `renderAt(t)` → `continueRender`.
  Реклама: `<Sequence from={AD_FROM}><OffthreadVideo src=media/gta_sa_ggsel.mp4/></Sequence>`, движок на это время скрыт, время ролика после рекламы сдвигается на длину рекламы.
  Голос: два `<Audio>` (до рекламы и после, `trimBefore`), без обрезки.
- `build-site.py` — собирает `public/site` из репозитория: копирует страницу движка, **переписывает абсолютные пути на относительные** (`/gta_sa/…` → `gta_sa/…`) и добавляет `<base href="../">`, иначе внутри Remotion файлы не находятся; кладёт шрифты, в т.ч. `NotoColorEmoji.ttf` (на Windows своих Noto-эмодзи нет); клипы перекодирует в короткие mp4 → `clips_src/`; копирует голос и рекламу в `public/media/`.
- `prepare-clips.mjs` — на ПК автора режет `clips_src/*.mp4` обратно в кадры jpg ffmpeg'ом **из пакета Remotion** (`node_modules/@remotion/compositor-*/ffmpeg(.exe)`); пересобирает клип, если mp4 поменялся.
- Автор запускает: `npm install` → `npm run render` (= `prepare-clips` + `remotion render … --concurrency=8`) → `out/gta_sa_final.mp4`.

## Грабли, на которые уже наступили (на Windows у автора)

- WebGL-эффекты Remotion (`@remotion/effects`) падают: лимит WebGL-контекстов → все эффекты делать на CSS/SVG.
- `HtmlInCanvasMotionBlur` падает («No cached paint record»), `CameraMotionBlur` + `<Video>` из `@remotion/media` → таймауты; видео внутри размытия не использовать. Клипы в движке — **последовательности jpg**, а не видео.
- Встроенный ffmpeg Remotion урезан: нет фильтра `fps` (и `npx remotion ffmpeg` портит аргументы с `=`) — исходники клипов сразу делать 30 к/с 960×540, при нарезке у автора фильтры не нужны.
- `Config.setConcurrency(8)` в конфиге ломает рендер на машинах с <8 ядрами — потоки задаются флагом в `npm run render`.
- Автор просил: голос не обрезать; элементы не должны появляться в конце сцены и сразу исчезать (правило HOLD = 2 с в `BT`); эмодзи как в Noto Color Emoji.

## Как сделать новый ролик

1. Сценарий → автор записывает голос → почистить дубли (скрипты в `gta_sa/voice/`: `clean.py`, `cut.py`, `pass2.py`) → `words.json`.
2. Нарезать клипы (`clips.py`), вырезать картинки (rembg, `birefnet-general`; по одному процессу — иначе нехватка памяти).
3. Написать `beats.js` (по образцу `gta_sa/beats.js`), `sh build.sh`, `node check.mjs`, проверочные кадры через `gta4_ps3/render.mjs stills`.
4. Скопировать `remotion_sa/` → новая папка, поправить в `src/Full.tsx` длину ролика, место и длину рекламы, путь страницы; в `build-site.py` — пути; `python3 build-site.py`; проверить кадры `npx remotion still` (в облаке нужен `--browser-executable` на headless-shell из `/opt/pw-browsers`).
5. Заархивировать без `node_modules`, `out` и кадров клипов, отдать автору.
