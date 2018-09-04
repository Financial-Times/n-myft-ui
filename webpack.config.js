'use strict';

const nWebpack = require('@financial-times/n-webpack');

module.exports = nWebpack({
	withBabelPolyfills: false,
	withHeadCss: false,
	entry: {
		'./public/main-without-n-ui.js': [
			'./myft/index.js',
			'./myft-common/index.js'
		],
		'./public/main.css': './myft/main.scss'
	},
	includes: [
		__dirname
	],
	exclude: [/node_modules/]
});
