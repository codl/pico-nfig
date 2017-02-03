#!/bin/bash
cd $(dirname $0)

icon="data:image/png;base64,$(base64 src/icon.png | tr -d "\n")"
css="data:text/css;base64,$(cat src/panel.css | sed "s~^\s\+~~" | tr -d "\n" | base64 | tr -d "\n")"
svg="$(cat src/controller.svg | sed "s~^\s\+~~" | tr -d "\n")"
major=$(git describe --tags --abbrev=0 | sed "s/\..*//")

mkdir -p lib
sed "s~icon\.png~$icon~;s~panel\.css~$css~;s~{{SVG}}~$svg~;s~{{MAJOR_VERSION}}~$major~" < src/nfig.js > lib/nfig.js
