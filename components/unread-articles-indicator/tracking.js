function dispatchEvent (detail) {
	const event = new CustomEvent('oTracking.event', {
		detail,
		bubbles: true
	});

	document.body.dispatchEvent(event);
}

export const countShown = (count, newArticlesSinceTime, cause) => dispatchEvent({
	category: 'unread-articles-indicator',
	action: 'update',
	count,
	newArticlesSinceTime,
	cause
});
