#!/bin/sh
# Скачивает официальные арты и скриншоты GTA 6 с gtabase.com (повторно, если контейнер пересоздан)
cd "$(dirname "$0")"
UA="Mozilla/5.0"
mkdir -p art_src shots_src
curl -sSL -A "$UA" https://www.gtabase.com/gta-6/artworks/ | grep -o 'href="/igallery/gta-6-artworks/[^"]*"' | sort -u | sed 's/href="//;s/"$//' > art_src/list.txt
for s in 0 100 200 300; do curl -sSL -A "$UA" "https://www.gtabase.com/gta-6/screenshots/?thumb_limitstart=$s&limit=100"; done | grep -o 'href="/igallery/[^"]*"' | sort -u | sed 's/href="//;s/"$//' > shots_src/list.txt
for d in art_src shots_src; do while read p; do f="$d/$(basename "$p")"; [ -s "$f" ] || curl -sSL -A "$UA" -o "$f" "https://www.gtabase.com$p"; done < $d/list.txt; done
