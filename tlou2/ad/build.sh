#!/bin/sh
# собирает страницу графики интеграции: движок v2 + слова интеграции
cd "$(dirname "$0")/.."
cat _head.js _helpers.js ad/beats_ad.js _tail.js \
  | sed "s#fetch('/tlou2/words.json')#fetch('/tlou2/ad/ad_words.json')#; s/window.DUR = 700.3;/window.DUR = 11.2;/" > ad/ad.js
sed 's#src="tlou2.js"#src="ad.js"#; s#<title>.*</title>#<title>TLOU2 · ggsel</title>#' tlou2.html > ad/ad.html
