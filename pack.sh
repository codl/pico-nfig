#!/bin/bash
cd $(dirname $0)

icon="data:image/png;base64,$(base64 src/icon.png | tr -d "\n")"
css="data:text/css,$(cat src/panel.css | sed "s~^\s\+~~" | tr -d "\n")"

mkdir -p lib
sed "s~icon\.png~$icon~;s~panel\.css~$css~" < src/nfig.js > lib/nfig.js
