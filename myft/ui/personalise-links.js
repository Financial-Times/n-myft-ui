const myFtClient = require('next-myft-client');
const $$ = require('n-ui-foundations').$$

export default function (el) {
	const links = (el && el.nodeName === 'A') ? [el] : $$('a[href^="/myft"]', el);
	return Promise.all(links.map(link => myFtClient.personaliseUrl(link.getAttribute('href'))
		.then(personalisedUrl => link.setAttribute('href', personalisedUrl)))
	);
}
