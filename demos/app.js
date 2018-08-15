const Handlebars = require('handlebars');
const helpers = require('./helpers');
const express = require('@financial-times/n-internal-tool');
const chalk = require('chalk');
const fixtures = require('./fixtures');
const errorHighlight = chalk.bold.red;
const highlight = chalk.bold.green;

Handlebars.registerHelper(helpers);

const app = module.exports = express({
	name: 'public',
	systemCode: 'n-myft-ui-demo',
	withFlags: false,
	withHandlebars: true,
	withNavigation: false,
	withAnonMiddleware: false,
	hasHeadCss: false,
	layoutsDir: 'demos/templates',
	viewsDirectory: '/demos/templates',
	partialsDirectory: [
		process.cwd(),
		'demos/templates'
	],
	directory: process.cwd(),
	demo: true,
	s3o: false
});

app.get('/', (req, res) => {
	res.render('demo', Object.assign({
		title: 'n-myft-ui demo',
		layout: 'demo-layout',
		flags: {
			myFtApi: true,
			myFtApiWrite: true
		}
	}, fixtures.followButton, fixtures.saveButton, fixtures.collections));
});

function runPa11yTests () {
	const spawn = require('child_process').spawn;
	const pa11y = spawn('pa11y-ci');

	pa11y.stdout.on('data', (data) => {
		console.log(highlight(`${data}`)); //eslint-disable-line
	});

	pa11y.stderr.on('data', (error) => {
		console.log(errorHighlight(`${error}`)); //eslint-disable-line
	});

	pa11y.on('close', (code) => {
		process.exit(code);
	});
}

const listen = app.listen(5005);

if (process.env.PA11Y === 'true') {
	listen.then(runPa11yTests);
}
