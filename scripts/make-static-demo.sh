#!/bin/sh

node demos/app &

pid="$!"

sleep 10

curl http://localhost:5005 | sed 's#/public/main.css#main.css#' | sed 's#href="/"#href="index.html"#' > public/index.html

mv public/* .

kill $pid
