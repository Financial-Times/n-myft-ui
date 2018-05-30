function dispatchEvent (document, detail) {
	const event = new CustomEvent('oTracking.event', {
		detail,
		bubbles: true
	});

	document.body.dispatchEvent(event);
}

export const digestRendered = (document) => dispatchEvent(document, {
	category: 'component',
	action: 'render',
	messaging: 'myft-digest'
});

export const digestOpened = (document) => dispatchEvent(document, {
	category: 'component',
	action: 'open',
	messaging: 'myft-digest'
});

export const digestClosed = (document) => dispatchEvent(document, {
	category: 'component',
	action: 'close',
	messaging: 'myft-digest'
});

export const digestLinkClicked = (document, link) => dispatchEvent(document, {
	category: 'element',
	action: 'click',
	messaging: 'myft-digest-link',
	contentID: link.dataset.contentId
});

export const tooltipClosed = (document) => dispatchEvent(document, {
	category: 'component',
	action: 'close',
	messaging: 'myft-digest-tooltip'
});
