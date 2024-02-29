#!/bin/sh

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
PUBLIC_DIR="$SCRIPT_DIR/../public"


node "$SCRIPT_DIR/../demos/app" &

pid="$!"

sleep 10

curl http://localhost:5005 | sed 's#/public/main.css#main.css#' | sed 's#href="/"#href="index.html"#' > public/index.html

mv "$PUBLIC_DIR"/* .

kill $pid
