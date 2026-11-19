#!/bin/sh
# страница графики интеграции ggsel для San Andreas: движок v2 (из tlou2) + слова этой записи
cd "$(dirname "$0")/../.."
cat tlou2/_head.js tlou2/_helpers.js gta_sa/ad/beats_ad.js tlou2/_tail.js \
  | sed "s#fetch('/tlou2/words.json')#fetch('/gta_sa/ad/sa_ad_words.json')#; s/window.DUR = 700.3;/window.DUR = 15.568;/" > gta_sa/ad/ad.js
sed 's#src="tlou2.js"#src="ad.js"#; s#<title>.*</title>#<title>GTA SA · ggsel</title>#' tlou2/tlou2.html > gta_sa/ad/ad.html
