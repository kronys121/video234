#!/bin/bash
# renders the 40 s vertical short (720x1280, 30 fps) in 4 workers, then encodes moscow_short.mp4
cd "$(dirname "$0")"; rm -rf frames_mshort; mkdir -p frames_mshort tmp
for i in 0 1 2 3; do W=720 H=1280 PART=mshort node render.mjs frames_mshort $i 4 30 > tmp/wmshort_$i.log 2>&1 & done; wait
ffmpeg -v error -y -framerate 30 -i frames_mshort/%05d.jpg -c:v libx264 -pix_fmt yuv420p -crf 21 -preset slow -movflags +faststart moscow_short.mp4 && echo ENCODEDMSHORT
