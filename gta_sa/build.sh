#!/bin/sh
# страница ролика GTA San Andreas: движок v2 (из tlou2) + сцены gta_sa/beats.js + слова основной дорожки
cd "$(dirname "$0")/.."
cat tlou2/_head.js tlou2/_helpers.js gta_sa/beats.js tlou2/_tail.js \
  | sed "s#fetch('/tlou2/words.json')#fetch('/gta_sa/voice/words.json')#; s/window.DUR = 700.3;/window.DUR = 475.0;/" > gta_sa/gta_sa.js
sed 's#src="tlou2.js"#src="gta_sa.js"#; s#<title>.*</title>#<title>GTA San Andreas · PS2</title>#' tlou2/tlou2.html > gta_sa/gta_sa.html
