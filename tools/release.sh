#!/bin/bash

if [[ $1 == "" ]]; then
    echo "Usage: $0 vX.X.X"
    exit 1
fi

cd $(git rev-parse --show-toplevel)

VERSION=$1
PREVIOUS=$(git describe --tags --abbrev=0)

export NFIG_VERSION=$VERSION

(
echo "## $VERSION ($(date -I))"
echo
git --no-pager log $PREVIOUS..HEAD --format="- %s"
echo
cat CHANGELOG.md
) > CHANGELOG.new.md

$EDITOR CHANGELOG.new.md

mv CHANGELOG.new.md CHANGELOG.md
git add CHANGELOG.md

PREVIOUSesc=$(echo $PREVIOUS | sed 's/\./\\./g')

sed -i "s/$PREVIOUSesc/$VERSION/g" README.md

git add README.md
git commit -m $VERSION
git tag $VERSION

echo "don't forget to git push --tags before you git push"
