# Remotion: пилот

Первые 31 секунда TLOU2 с той же озвучкой и сценами, собранные на Remotion.

```
cd remotion
npm install
npm run assets   # копирует клипы, картинки, шрифты и озвучку в public/
npx remotion studio src/index.ts --browser-executable=/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell
npx remotion render src/index.ts Pilot out/remotion_pilot_30s.mp4 --concurrency=4 --crf=20 --browser-executable=/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell
```

- `src/engine.ts`: математика движка v2 (появление, камера, тайминг по словам, правило HOLD).
- `src/components.tsx`: карточки, клипы, печатающиеся подписи, плашки.
- `src/Pilot.tsx`: сцены.
