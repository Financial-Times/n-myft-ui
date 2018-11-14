node_modules/@financial-times/n-gage/index.mk:
	npm install @financial-times/n-gage
	touch $@

-include node_modules/@financial-times/n-gage/index.mk

run:
	rm -rf bower_components/n-ui
	mkdir bower_components/n-ui
	cp -rf $(shell cat _test-server/template-copy-list.txt) bower_components/n-ui
	node _test-server/app

# copy project files into bower components so that we can reference component partials
# in the same way that apps that use the components do
demo-build:
	@rm -rf bower_components/n-myft-ui
	@mkdir bower_components/n-myft-ui
	@mkdir bower_components/n-myft-ui/myft
	@cp -r components bower_components/n-myft-ui/components/
	@node-sass demos/src/demo.scss public/main.css --include-path bower_components node_modules
	@$(DONE)

demo: demo-build
	@node demos/app

static-demo: demo-build
	@scripts/make-static-demo.sh

test-build:
	webpack --config webpack.config.js

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
