# Школьная столовая — видео 1920×1080

Видео (10:14, 1920×1080, H.264, ~4,5 Мбит/с, 340 МБ) разрезано на 4 части,
потому что GitHub не принимает файлы больше 100 МБ. Части — это куски одного файла,
по отдельности они не проигрываются. После сборки получается точная копия исходного `stolovaya.mp4`.

## Как собрать

**Windows:** скачай все 4 файла `stolovaya.mp4.001` … `stolovaya.mp4.004` и `sobrat.bat` в одну папку,
запусти `sobrat.bat` двойным щелчком — рядом появится `stolovaya.mp4`.

Вручную (командная строка в этой папке):

    copy /b stolovaya.mp4.001 + stolovaya.mp4.002 + stolovaya.mp4.003 + stolovaya.mp4.004 stolovaya.mp4

Или в 7-Zip: правой кнопкой по `stolovaya.mp4.001` → 7-Zip → «Объединить файлы».

**macOS / Linux:**

    cat stolovaya.mp4.001 stolovaya.mp4.002 stolovaya.mp4.003 stolovaya.mp4.004 > stolovaya.mp4

Проверка (SHA-256 собранного файла):
`fda0d595db7a09908f195f9dca7bcfbc098d6250f96644cd0f169e2be695a6bf`

`preview.jpg` — обложка 1280×720.
