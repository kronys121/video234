# Doom на Nintendo Switch — полный ролик с рекламой ggsel (Remotion, 1920×1080, 60 к/с)

Монтаж в том же стиле, что GTA 6 и Crysis: светлая студия, вырезки, обложки, геймплей в карточках, подписи — всё под твою озвучку.
Ролик 9:37 + реклама ggsel на 2:07,7 (подводка твоим голосом + основной блок) = **10:17**.

## Как запустить (Windows)

1. Установи Node.js 18 или новее: https://nodejs.org
2. Дважды кликни **render.bat** — поставит зависимости (один раз), нарежет клипы в кадры и отрендерит `out\doom_final.mp4`.
   **studio.bat** — предпросмотр с ползунком.

Рендер идёт на видеокарте (настройка `angle` в `remotion.config.ts`).
Если компьютер тормозит — уменьши `--concurrency=8` в `package.json`; если мощный — подними до 12–14.

## Что где

- `src/Full.tsx` — склейка: ролик до 2:07,7, реклама, ролик дальше; одна звуковая дорожка.
- `public/site/doom/beats.js` — все 123 сцены с таймингами по словам; `engine.js` — анимации; `img/` — вырезки и обложки.
- `public/media/mix.m4a` — звук: голос, музыка, эффекты, реклама. `public/media/doom_ggsel.mp4` — реклама.

## В описание видео (музыка CC BY)

```
Music: "Electro Cabello", "Cut and Run", "Getting it Done", "Raving Energy" — Kevin MacLeod (incompetech.com)
Licensed under Creative Commons: By Attribution 4.0 License
http://creativecommons.org/licenses/by/4.0/
```
Звуковые эффекты — BigSoundBank и OpenGameArt (CC0), подпись не нужна.
