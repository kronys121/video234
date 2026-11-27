#!/bin/sh
# Кадры клипов для детерминированного рендера (в git не храним).
cd "$(dirname "$0")"
for c in "beauty:scale=640:360" "trailer:scale=640:360" "enemies1:scale=960:540" "enemies2:scale=960:540" "flashlight:scale=960:540" "ellie_invisible:crop=560:316:40:22,scale=640:361"; do
  n=${c%%:*}; vf=${c#*:}; mkdir -p clips/$n && rm -f clips/$n/*.jpg
  ffmpeg -v error -y -i clips/$n.mp4 -vf "$vf" -r 30 -q:v 3 clips/$n/%04d.jpg
done
