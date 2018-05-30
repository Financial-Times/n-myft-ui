function dispatchEvent (detail) {
	const event = new CustomEvent('oTracking.event', {
		detail,
		bubbles: true
	});

	document.body.dispatchEvent(event);
}

export const digestRendered = () => dispatchEvent({
	category: 'component',
	action: 'render',
	messaging: 'myft-digest'
});

export const digestOpened = () => dispatchEvent({
	category: 'component',
	action: 'open',
	messaging: 'myft-digest'
});

export const digestClosed = () => dispatchEvent({
	category: 'component',
	action: 'close',
	messaging: 'myft-digest'
});

export const digestLinkClicked = (link) => dispatchEvent({
	category: 'element',
	action: 'click',
	messaging: 'myft-digest-link',
	contentID: link.dataset.contentId
});

export const tooltipClosed = () => dispatchEvent({
	category: 'component',
	action: 'close',
	messaging: 'myft-digest-tooltip'
});
