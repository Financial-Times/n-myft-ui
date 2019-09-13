function dispatchEvent (detail) {
	const event = new CustomEvent('oTracking.event', {
		detail,
		bubbles: true
	});

	document.body.dispatchEvent(event);
}

export function onVisibilityChange (state) {
	document.body.dispatchEvent(new CustomEvent('oTracking.event',
		{
			detail: {
				action: `browser-tab-${document.hidden?'hidden':'visible'}`,
				category: 'myFT',
				faviconHasDot: state.faviconHasDot,
				numberInTitle: state.numberInTitle
			},
			bubbles: true
		}));
}

export const countShown = (count, newArticlesSinceTime) => dispatchEvent({
	category: 'unread-articles-indicator',
	action: 'render',
	count,
	newArticlesSinceTime
});
