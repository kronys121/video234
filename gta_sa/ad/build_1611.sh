#!/bin/sh
cd "$(dirname "$0")/../.."
cat tlou2/_head.js tlou2/_helpers.js gta_sa/ad/beats_ad_1611.js tlou2/_tail.js \
  | sed "s#fetch('/tlou2/words.json')#fetch('/gta_sa/ad/sa_ad_words_1611.json')#; s/window.DUR = 700.3;/window.DUR = 14.6;/" > gta_sa/ad/ad_1611.js
sed 's#src="tlou2.js"#src="ad_1611.js"#; s#<title>.*</title>#<title>GTA SA · ggsel 16.11</title>#' tlou2/tlou2.html > gta_sa/ad/ad_1611.html
