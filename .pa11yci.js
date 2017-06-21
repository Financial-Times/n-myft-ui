const viewports = [
	{
		width: 768,
		height: 1024
	},
	{
		width: 490,
		height: 732
	},
	{
		width: 320,
		height: 480
	}
];

const urls = [
	'http://localhost:5005/',
	'http://localhost:5005/short-copy'
];

const config = {
	defaults: {
		page: {
			headers: {
				'Cookie': 'next-flags=ads:off,cookieMessage:off; secure=true'
			}
		},
		timeout: 25000,
		rules: ['Principle1.Guideline1_3.1_3_1_AAA']
	},
	urls: []
};

for (const viewport of viewports) {
	for (const url of urls) {

		const path = `${url.substring(url.lastIndexOf('/'))}@${viewport.width}x${viewport.height}`;

		config.urls.push({
			url: url,
			page: {
				viewport: viewport
			},
			screenCapture: `./pa11y_screenCapture/${path}.png`
		});
	}
};

module.exports = config;
