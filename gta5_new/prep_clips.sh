#!/bin/sh
# Кадры клипов для детерминированного рендера (в git не храним).
cd "$(dirname "$0")"
for n in night_street beach_quad mountain_view gas_station city_traffic online_bike online_deadline online_sumo; do
  mkdir -p clips/$n && rm -f clips/$n/*.jpg
  ffmpeg -v error -y -i clips/$n.mp4 -vf "scale=960:540" -r 30 -q:v 3 clips/$n/%04d.jpg
done
mkdir -p clips/switch && rm -f clips/switch/*.jpg
ffmpeg -v error -y -i clips/switch.mp4 -vf "scale=800:450" -r 30 -q:v 3 clips/switch/%04d.jpg
