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
for c in "rag1:crop=1000:560:140:0,scale=760:426" "rag2:crop=1000:560:140:30,scale=760:426" "ps3_gameplay_lowres:crop=600:338:20:0,scale=760:428" "ps3_fps_counter:scale=960:540" "cmp_ps3_x360_street:scale=960:540" "cmp_ps3_x360_park:scale=960:540"; do
  n=${c%%:*}; vf=${c#*:}; mkdir -p clips/$n && rm -f clips/$n/*.jpg
  ffmpeg -v error -y -i clips/$n.mp4 -vf "$vf" -r 30 -q:v 3 clips/$n/%04d.jpg
done
