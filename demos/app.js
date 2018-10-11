const express = require('@financial-times/n-internal-tool');
const chalk = require('chalk');
const errorHighlight = chalk.bold.red;
const highlight = chalk.bold.green;

const xHandlebars = require('@financial-times/x-handlebars');

const fixtures = {
	followButton: require('./fixtures/follow-button'),
	saveButton: require('./fixtures/save-button'),
	collections: require('./fixtures/collections'),
	conceptList: require('./fixtures/concept-list')
};

const app = module.exports = express({
	name: 'public',
	systemCode: 'n-myft-ui-demo',
	withFlags: true,
	withHandlebars: true,
	withNavigation: false,
	withAnonMiddleware: false,
	hasHeadCss: false,
	layoutsDir: 'demos/templates',
	viewsDirectory: '/demos/templates',
	partialsDirectory: process.cwd(),
	directory: process.cwd(),
	demo: true,
	s3o: false,
	helpers: {
		x: xHandlebars()
	}
});

app.get('/', (req, res) => {
	res.render('demo', Object.assign({
		title: 'n-myft-ui demo',
		layout: 'demo-layout',
		flags: {
			myFtApi: true,
			myFtApiWrite: true,
			xFollowButton: res.locals.flags.xFollowButton
		}
	}, fixtures));
});

app.get('/digest-on-follow', (req, res) => {
	res.render('digest-on-follow', Object.assign({
		title: 'n-myft-ui digest on follow',
		layout: 'demo-layout',
		flags: {
			myFtApi: true,
			myFtApiWrite: true,
		},
		appIsStreamPage: false
	}, fixtures.followButtonPlusDigest));
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
