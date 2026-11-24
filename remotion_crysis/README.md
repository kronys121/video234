# Crysis на консолях — полный ролик с рекламой ggsel (Remotion, 1920×1080, 60 к/с)

Монтаж в том же стиле, что GTA 6: светлая студия, вырезки, обложки, геймплей в карточках, подписи — всё под твою озвучку.
Ролик 10:35 + реклама ggsel на 3:08,7 (подводка твоим голосом + основной блок) = **11:12**.

## Как запустить (Windows)

1. Установи Node.js 18 или новее: https://nodejs.org
2. Дважды кликни **render.bat** — поставит зависимости (один раз), нарежет клипы в кадры и отрендерит `out\crysis_final.mp4`.
   **studio.bat** — предпросмотр с ползунком.

Первая нарезка клипов в кадры (~1,5 ГБ) занимает пару минут, дальше пропускается.
Если компьютер слабый — уменьши `--concurrency=8` в `package.json`.

## Что где

- `src/Full.tsx` — склейка: ролик до 3:08,7, реклама, ролик дальше; одна звуковая дорожка.
- `public/site/crysis/beats.js` — все 118 сцен с таймингами по словам; `engine.js` — анимации; `img/` — вырезки и обложки.
- `public/media/mix.m4a` — звук: голос, музыка, эффекты, реклама. `public/media/crysis_ggsel.mp4` — реклама.

## В описание видео (музыка CC BY)

```
Music: "Electro Cabello", "Cut and Run", "Getting it Done", "Raving Energy" — Kevin MacLeod (incompetech.com)
Licensed under Creative Commons: By Attribution 4.0 License
http://creativecommons.org/licenses/by/4.0/
```
Звуковые эффекты — BigSoundBank и OpenGameArt (CC0), подпись не нужна.
