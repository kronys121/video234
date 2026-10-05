#!/bin/bash
# renders 900 frames in 4 parallel workers, then encodes the mp4
cd "$(dirname "$0")"; rm -rf frames; mkdir frames
for i in 0 1 2 3; do node render.mjs frames $((i*225)) $(((i+1)*225)) > tmp/w$i.log 2>&1 & done; wait
ffmpeg -v error -y -framerate 30 -i frames/%04d.jpg -c:v libx264 -pix_fmt yuv420p -crf 17 -preset slow rome_timelapse.mp4 && echo ENCODED
