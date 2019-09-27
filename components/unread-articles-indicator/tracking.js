function dispatchEvent (detail) {
	const event = new CustomEvent('oTracking.event', {
		detail,
		bubbles: true
	});

	document.body.dispatchEvent(event);
}

export const onCountChange = (count, newArticlesSinceTime) => dispatchEvent({
	category: 'unread-articles-indicator',
	action: 'render',
	count,
	newArticlesSinceTime
});
