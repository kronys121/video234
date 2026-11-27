# sheets.sh <video> <prefix> <step> : контактные листы 8x6 с таймкодом
V=$1; P=$2; ST=${3:-8}; S=/tmp/claude-0/-home-user-video234/b7cd2455-73e1-534d-ab20-0a526604a9d1/scratchpad
ffmpeg -v error -y -i "$V" -vf "fps=1/$ST,scale=240:-2,drawtext=text='%{pts\:hms}':x=3:y=3:fontsize=15:fontcolor=yellow:box=1:boxcolor=black@0.6,tile=8x6" -vsync vfr "$S/${P}_%02d.jpg" 2>&1 | grep -v "buffer state\|Last message\|mmco" | head -3
ls $S/${P}_*.jpg
