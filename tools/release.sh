#!/bin/bash

if [[ $1 == "" ]]; then
    echo "Usage: $0 vX.X.X"
    exit 1
fi

cd $(git rev-parse --show-toplevel)

export VERSION=$1
PREVIOUS=$(git describe --tags --abbrev=0)

(
echo "## $VERSION ($(date -I))"
echo
git --no-pager log $PREVIOUS..HEAD --format="- %s"
) > RELEASE_NOTES.md

$EDITOR RELEASE_NOTES.md

(
cat RELEASE_NOTES.md
echo
cat CHANGELOG.md
) > CHANGELOG.new.md

mv CHANGELOG.new.md CHANGELOG.md
git add CHANGELOG.md

PREVIOUSesc=$(echo $PREVIOUS | sed 's/\./\\./g')

git commit -m $VERSION

sed -i '1 s/^[#\s]*//' RELEASE_NOTES.md
git tag $VERSION -a --cleanup=whitespace -F RELEASE_NOTES.md

rm RELEASE_NOTES.md

echo "don't forget to git push --tags before you git push"
