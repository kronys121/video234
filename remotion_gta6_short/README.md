# GTA 6 — 3 шорта для TikTok / Shorts / Reels (Remotion, 1080×1920, 60 к/с)

1. **GTA6Short** — «GTA 6 не должна была работать на PS5» (1:03) → `out/gta6_short1.mp4`
2. **GTA6Short2** — «Полиция GTA 6 тебя запомнит»: свидетели, значки, GPS-трекеры, профиль, NPC (1:03) → `out/gta6_short2_police.mp4`
3. **GTA6Short3** — «Как Rockstar обманывает PS5»: осколки, пот 32 КБ, вода, острова и мосты (1:11) → `out/gta6_short3_tricks.mp4`

Те же анимации, что в полном ролике. Для каждой сцены заранее подобраны масштаб и центр окна,
чтобы все элементы (эмодзи, вырезки, подписи, карточки) целиком помещались в вертикальный кадр — проверено по каждому кадру.
Сверху крючок, снизу субтитры по словам, в конце «ПРОДОЛЖЕНИЕ НА КАНАЛЕ @kronyscs».

## Как запустить (Windows)

1. Node.js 18 или новее: https://nodejs.org
2. **render.bat** — рендерит все три шорта в `out\`. **studio.bat** — предпросмотр (слева выбор шорта).
   Один шорт: `npm run render1` / `render2` / `render3`.

## Что где

- `src/Short.tsx` — вёрстка: окно монтажа с камерой по сценам, крючок, субтитры, финальная карточка.
- `src/data/short1..3.json` — куски озвучки, слова субтитров (текст можно поправить), камера по сценам.
- `public/site/gta6/` — движок монтажа из полного ролика; `public/media/` — звук каждого шорта.

## В описание (музыка CC BY)

```
Music: "Electro Cabello" — Kevin MacLeod (incompetech.com)
Licensed under Creative Commons: By Attribution 4.0 License
http://creativecommons.org/licenses/by/4.0/
```
