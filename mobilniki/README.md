# Первые мобильные телефоны — видео 1920×1080

Видео (11:01, 1920×1080, H.264, ~4,5 Мбит/с, 383 МБ) разрезано на 4 части,
потому что GitHub не принимает файлы больше 100 МБ. Части — это куски одного файла,
по отдельности они не проигрываются. После сборки получается точная копия исходного `mobilniki.mp4`.

## Как собрать

**Windows:** скачай все 4 файла `mobilniki.mp4.001` … `mobilniki.mp4.004` и `sobrat.bat` в одну папку,
запусти `sobrat.bat` двойным щелчком — рядом появится `mobilniki.mp4`.

Вручную (командная строка в этой папке):

    copy /b mobilniki.mp4.001 + mobilniki.mp4.002 + mobilniki.mp4.003 + mobilniki.mp4.004 mobilniki.mp4

Или в 7-Zip: правой кнопкой по `mobilniki.mp4.001` → 7-Zip → «Объединить файлы».

**macOS / Linux:**

    cat mobilniki.mp4.001 mobilniki.mp4.002 mobilniki.mp4.003 mobilniki.mp4.004 > mobilniki.mp4

Проверка (SHA-256 собранного файла):
`d9a1030e9ee8c7fdc88972170cbec6813d2b04dc5347cc838d1add1df6280262`

`preview.jpg` — обложка 1280×720.
