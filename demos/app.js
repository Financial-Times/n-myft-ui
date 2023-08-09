require('sucrase/register');

const nExpress = require('@financial-times/n-express');
const chalk = require('chalk');
const errorHighlight = chalk.bold.red;
const highlight = chalk.bold.green;
const path = require('path');
const handlebars = require('handlebars');
const { PageKitHandlebars, helpers } = require('@financial-times/dotcom-server-handlebars');

const fixtures = {
	followButton: require('./fixtures/follow-button'),
	saveButton: require('./fixtures/save-button'),
	collections: require('./fixtures/collections'),
	conceptList: require('./fixtures/concept-list'),
	pinButton: require('./fixtures/pin-button'),
	instantAlert: require('./fixtures/instant-alert'),
	followPlusInstantAlerts: require('./fixtures/jsx/follow-plus-instant-alerts')
};

const app = module.exports = nExpress({
	name: 'public',
	systemCode: 'n-myft-ui-demo',
	withFlags: true,
	withConsent: false,
	withServiceMetrics: false,
	withAnonMiddleware: false,
	hasHeadCss: false,
	partialsDirectory: process.cwd(),
	directory: process.cwd(),
	demo: true,
	withBackendAuthentication: false,
});

app.set('views', path.join(__dirname, '/templates'));
app.set('view engine', '.html');
app.engine('.html', new PageKitHandlebars({
	cache: false,
	handlebars,
	helpers: {
		...helpers
	}
}).engine);

app.use('/public', nExpress.static(path.join(__dirname, '../public'), { redirect: false }));

app.get('/', (req, res) => {
	res.locals.cacheablePersonalisedUrl = true;
	res.render('demo', Object.assign({
		title: 'n-myft-ui demo',
		flags: {
			myFtApi: true,
			myFtApiWrite: true
		}
	}, fixtures));
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
