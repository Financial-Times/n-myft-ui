/* global expect */

function noWhitespace (str) {
	return str.replace(/\s/g, '');
}

describe('Personalise links', () => {

	let personaliseLinks;
	let container;

	const stubs = {
		personaliseUrlStub: (link) => Promise.resolve(`${link}/PERSONAL`)
	};

	beforeEach(() => {
		const personaliseLinksInjector = require('inject-loader!../../ui/personalise-links');
		personaliseLinks = personaliseLinksInjector({
			'next-myft-client': { personaliseUrl: stubs.personaliseUrlStub }
		});

		container = document.createElement('div');
	});

	it('should personalise the href passed in element if it is a link', () => {
		const link = document.createElement('a');
		link.setAttribute('href', '/myft');
		return personaliseLinks(link)
			.then(() => {
				expect(link.getAttribute('href')).to.equal('/myft/PERSONAL');
			});
	});

	it('should personalise all the myFT links nested in the passed in el if it is not a link', () => {

		container.innerHTML = `
			<a href="/whatever">One</a>
			<a href="/myft">Two</a>
			<a href="/myft/dogs">Three</a>
			<a href="/shrug">Four</a>
			<a href="/myft/cats">Five</a>
		`;
		return personaliseLinks(container)
			.then(() => {
				expect(noWhitespace(container.innerHTML)).to.equal(noWhitespace(`
					<a href="/whatever">One</a>
					<a href="/myft/PERSONAL">Two</a>
					<a href="/myft/dogs/PERSONAL">Three</a>
					<a href="/shrug">Four</a>
					<a href="/myft/cats/PERSONAL">Five</a>
				`));
			});
	});

	it('should not freak out if there are no myFT links', () => {

		container.innerHTML = `
			<a href="/whatever">One</a>
		`;
		return personaliseLinks(container)
			.then(() => {
				expect(noWhitespace(container.innerHTML)).to.equal(noWhitespace(`
					<a href="/whatever">One</a>
				`));
			});
	});

	it('should not freak out if there are no links', () => {

		container.innerHTML = `
			<p>No links here</p>
		`;
		return personaliseLinks(container)
			.then(() => {
				expect(noWhitespace(container.innerHTML)).to.equal(noWhitespace(`
					<p>No links here</p>
				`));
			});
	});
});
