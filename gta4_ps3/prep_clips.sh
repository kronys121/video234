#!/bin/sh
# Разбивает клипы на кадры для детерминированного рендера (кадры в git не хранятся).
cd "$(dirname "$0")"
mkdir -p clips/ps3_gameplay_run && rm -f clips/ps3_gameplay_run/*.jpg
ffmpeg -v error -y -i clips/ps3_gameplay_run.mp4 -vf "crop=1240:900:440:180,scale=996:724" -q:v 3 clips/ps3_gameplay_run/%04d.jpg
