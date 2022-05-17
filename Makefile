node_modules/@financial-times/n-gage/index.mk:
	npm install @financial-times/n-gage
	touch $@

-include node_modules/@financial-times/n-gage/index.mk

run:
	node _test-server/app

demo-build:
	@sass demos/src/demo.scss public/main.css --load-path node_modules
	@$(DONE)

demo: demo-build
	@node demos/app

static-demo: demo-build
	@scripts/make-static-demo.sh

test-build:
	webpack --mode=development

test-unit:
	karma start karma.conf.js

a11y: demo-build
	@node .pa11yci.js
	@PA11Y=true node demos/app
	@$(DONE)

test:
	make verify
	make test-unit
	make test-build
	make a11y
