git config --global user.email "$GITHUB_EMAIL"
git config --global user.name "$GITHUB_NAME"

# hackily remove all identities, and later force the specific identity
# otherwise git keeps using the wrong boi
ssh-add -D

git --version

export GIT_SSH="`pwd`/scripts/ssh.sh"

git clone $CIRCLE_REPOSITORY_URL honk --single-branch

cd honk

git checkout -b gh-pages

mv ../bower_components .
mv ../node_modules .
cp ../scripts/* scripts/

make static-demo

git add -A .

git commit -m "Update GitHub Pages ! [${CIRCLE_SHA1}]" --allow-empty

git push -f --no-verify origin gh-pages
