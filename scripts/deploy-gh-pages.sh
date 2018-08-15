# set git config from circle
git config --global user.email $GITHUB_EMAIL
git config --global user.name $GITHUB_NAME

# Add GitHub to known hosts to avoid an interactive prompt when cloning over SSH
mkdir -p ~/.ssh
ssh-keyscan -H github.com >> ~/.ssh/known_hosts

git clone $CIRCLE_REPOSITORY_URL honk --single-branch

cd honk

git checkout -b gh-pages

mv ../bower_components .
mv ../node_modules .

make static-demo

git add -A .
git commit -m "Automated deployment to GitHub Pages: ${CIRCLE_SHA1}" --allow-empty
git push -f --no-verify origin gh-pages
