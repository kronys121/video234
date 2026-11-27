#!/bin/bash
# кадры клипов (30 fps, 1280x720) -> uncharted3/clips/<name>/NNNN.jpg  (не в git)
cd "$(dirname "$0")"
declare -A M=( [net]="cargo_net.mp4" [plane]="самолет.mp4" [storm1]="буря.mp4" [storm2]="буря2.mp4" [ship1]="1010(1).mp4" [ship2]="волны.mp4" [water]="вода.mp4" [jungle]="поездд.mp4" [mocap]="1010(2).mp4" [cut]="катсцена.mp4" )
for k in "${!M[@]}"; do
  mkdir -p clips/$k; rm -f clips/$k/*.jpg
  ffmpeg -v error -y -i "clips_src/${M[$k]}" -an -vf "fps=30,scale=1280:720" -q:v 3 clips/$k/%04d.jpg &
done
wait
for k in "${!M[@]}"; do echo "$k $(ls clips/$k | wc -l)"; done
