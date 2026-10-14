# Видеопрокат — видео 1920×1080

Видео (9:50, 1920×1080, H.264, ~4,5 Мбит/с, 347 МБ) разрезано на 4 части,
потому что GitHub не принимает файлы больше 100 МБ. Части — это куски одного файла,
по отдельности они не проигрываются. После сборки получается точная копия исходного `videoprokat.mp4`.

## Как собрать

**Windows:** скачай все 4 файла `videoprokat.mp4.001` … `videoprokat.mp4.004` и `sobrat.bat` в одну папку,
запусти `sobrat.bat` двойным щелчком — рядом появится `videoprokat.mp4`.

Вручную (командная строка в этой папке):

    copy /b videoprokat.mp4.001 + videoprokat.mp4.002 + videoprokat.mp4.003 + videoprokat.mp4.004 videoprokat.mp4

Или в 7-Zip: правой кнопкой по `videoprokat.mp4.001` → 7-Zip → «Объединить файлы».

**macOS / Linux:**

    cat videoprokat.mp4.001 videoprokat.mp4.002 videoprokat.mp4.003 videoprokat.mp4.004 > videoprokat.mp4

Проверка (SHA-256 собранного файла):
`0c61df7eef28cd887cecee67947d54c757b11edd5237c08b369b046a82a37bb7`

`preview.jpg` — обложка 1280×720.
