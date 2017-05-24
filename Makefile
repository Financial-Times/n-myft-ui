node_modules/@financial-times/n-gage/index.mk:
	npm install @financial-times/n-gage
	touch $@

-include node_modules/@financial-times/n-gage/index.mk

IGNORE_A11Y = true
demo: run

run:
	rm -rf bower_components/n-ui
	mkdir bower_components/n-ui
	cp -rf $(shell cat _test-server/template-copy-list.txt) bower_components/n-ui
	node _test-server/app

test-build:
	webpack --config webpack.config.js

test-unit:
	karma start karma.conf.js

# test-unit-dev is only for development environments.
test-unit-dev:
	$(info *)
	$(info * Developers note: This test will never "complete". It's meant to run in a separate tab. It'll automatically rerun tests whenever one of your files changes.)
	$(info *)
	karma start karma.conf.js --single-run false --auto-watch true

# Note: `run` executes `node _test-server/app`, which fires up exchange, then deploys
# a test static site to s3, then exits, freeing the process to execute `nightwatch a11y`.
test: verify test-unit test-build

# Test-dev is only for development environments.
test-dev: verify test-unit-dev
