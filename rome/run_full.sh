#!/bin/bash
# renders the whole film (all eras) in 4 parallel workers, then encodes rome_full.mp4
cd "$(dirname "$0")"; FPS=${1:-24}; rm -rf frames_full; mkdir -p frames_full tmp
for i in 0 1 2 3; do PART=full node render.mjs frames_full $i 4 $FPS > tmp/wf_$i.log 2>&1 & done; wait
ffmpeg -v error -y -framerate $FPS -i frames_full/%05d.jpg -c:v libx264 -pix_fmt yuv420p -crf 22 -preset slow rome_full.mp4 && echo ENCODEDFULL
