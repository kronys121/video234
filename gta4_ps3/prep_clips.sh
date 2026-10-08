#!/bin/sh
# Разбивает клипы на кадры для детерминированного рендера (кадры в git не хранятся).
cd "$(dirname "$0")"
mkdir -p clips/ps3_gameplay_run && rm -f clips/ps3_gameplay_run/*.jpg
ffmpeg -v error -y -i clips/ps3_gameplay_run.mp4 -vf "crop=1240:900:440:180,scale=996:724" -q:v 3 clips/ps3_gameplay_run/%04d.jpg
mkdir -p clips/ps3_run_big && rm -f clips/ps3_run_big/*.jpg
ffmpeg -v error -y -i clips/ps3_gameplay_run.mp4 -vf "crop=1240:900:440:180,scale=1100:798" -q:v 2 clips/ps3_run_big/%04d.jpg
mkdir -p clips/crash1 clips/crash2 && rm -f clips/crash1/*.jpg clips/crash2/*.jpg
ffmpeg -v error -y -i clips/crash1.mp4 -vf "crop=1050:720:230:0,scale=880:604" -q:v 2 clips/crash1/%04d.jpg
ffmpeg -v error -y -i clips/crash2.mp4 -vf "crop=860:720:210:0,scale=720:603" -q:v 2 clips/crash2/%04d.jpg
