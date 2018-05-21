import myFtClient from 'next-myft-client';
import { $$ as findElements } from 'n-ui-foundations';

export default function (el) {
	const links = (el && el.nodeName === 'A') ? [el] : findElements('a[href^="/myft"]', el);
	return Promise.all(links.map(link => myFtClient.personaliseUrl(link.getAttribute('href'))
		.then(personalisedUrl => link.setAttribute('href', personalisedUrl)))
	);
}
