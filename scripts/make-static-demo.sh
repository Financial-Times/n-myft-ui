#!/bin/sh

function get () {
	curl "$1" | sed 's/\/public\/main.css/main.css/' | sed 's/href="\/"/href="index.html"/' | sed 's/\/digest-on-follow/digest-on-follow.html/' > "$2"
}

node demos/app &

pid="$!"

sleep 10

get http://localhost:5005 public/index.html

mv public/* .

kill $pid
