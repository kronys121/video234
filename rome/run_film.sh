#!/bin/bash
# renders the 4-minute film in 4 parallel workers, then encodes rome_film.mp4
cd "$(dirname "$0")"; FPS=${1:-24}; rm -rf frames_film; mkdir -p frames_film tmp
for i in 0 1 2 3; do PART=film node render.mjs frames_film $i 4 $FPS > tmp/wfilm_$i.log 2>&1 & done; wait
ffmpeg -v error -y -framerate $FPS -i frames_film/%05d.jpg -c:v libx264 -pix_fmt yuv420p -crf 22 -preset slow rome_film.mp4 && echo ENCODEDFILM
