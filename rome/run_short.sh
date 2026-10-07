#!/bin/bash
# renders the 40 s vertical short (720x1280, 30 fps) in 4 workers, then encodes rome_short.mp4
cd "$(dirname "$0")"; rm -rf frames_short; mkdir -p frames_short tmp
for i in 0 1 2 3; do W=720 H=1280 PART=short node render.mjs frames_short $i 4 30 > tmp/wshort_$i.log 2>&1 & done; wait
ffmpeg -v error -y -framerate 30 -i frames_short/%05d.jpg -c:v libx264 -pix_fmt yuv420p -crf 21 -preset slow -movflags +faststart rome_short.mp4 && echo ENCODEDSHORT
