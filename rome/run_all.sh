#!/bin/bash
# usage: ./run_all.sh <part>   renders 900 frames in 4 parallel workers, then encodes rome_part<part>.mp4
cd "$(dirname "$0")"; P=${1:-1}; rm -rf frames_p$P; mkdir -p frames_p$P tmp
for i in 0 1 2 3; do PART=$P node render.mjs frames_p$P $((i*225)) $(((i+1)*225)) > tmp/w${P}_$i.log 2>&1 & done; wait
ffmpeg -v error -y -framerate 30 -i frames_p$P/%04d.jpg -c:v libx264 -pix_fmt yuv420p -crf 21 -preset slow rome_part$P.mp4 && echo ENCODED$P
