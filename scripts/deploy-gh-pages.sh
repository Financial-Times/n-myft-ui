git config --global user.email "$GITHUB_EMAIL"
git config --global user.name "$GITHUB_NAME"

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
echo "script dir: $SCRIPT_DIR"

# hackily remove all identities, and later force the specific identity
# otherwise git keeps using the wrong boi
ssh-add -D

git --version

export GIT_SSH="$SCRIPT_DIR/ssh.sh"

git clone $CIRCLE_REPOSITORY_URL honk --single-branch

cd honk

git checkout -b gh-pages

mv ../node_modules .
cp ../scripts/* scripts/

./make-static-demo.sh

git add -A .

git commit -m "Update GitHub Pages ! [${CIRCLE_SHA1}]" --allow-empty

git push -f --no-verify origin gh-pages
