node_modules/@financial-times/n-gage/index.mk:
	npm install @financial-times/n-gage
	touch $@

-include node_modules/@financial-times/n-gage/index.mk

NODE_VERSION := $(shell node --version)
NODE_MAJOR_VERSION := $(shell echo $(NODE_VERSION) | cut -c2-3)
ifeq ($(NODE_MAJOR_VERSION),18)
	NODE_OPTS := "--openssl-legacy-provider --dns-result-order=ipv4first"
endif

run:
	node _test-server/app

demo-build:
	@rm -rf node_modules/@financial-times/n-myft-ui
	@mkdir node_modules/@financial-times/n-myft-ui
	@mkdir node_modules/@financial-times/n-myft-ui/myft
	@cp -r components node_modules/@financial-times/n-myft-ui/components/
	@sass demos/src/demo.scss public/main.css --load-path node_modules
	@$(DONE)

demo: demo-build
	@node demos/app

static-demo: demo-build
	@scripts/make-static-demo.sh

test-build:
	@NODE_OPTIONS=$(NODE_OPTS) webpack --mode=development

test-unit:
	@NODE_OPTIONS=$(NODE_OPTS) karma start

a11y: demo-build
	@node .pa11yci.js
	@PA11Y=true node demos/app
	@$(DONE)

test:
	make verify
	make test-unit
	make test-build
	make a11y

transpile-jsx:
	@npx cross-env BABEL_ENV=custom babel components/jsx --out-dir dist --extensions .jsx
