const myftApiClient = require('next-myft-client');
const trackingMessageId = 'myft-onboarding-pinning-promo';

const trackPinningAction = ({action}) =>
	new CustomEvent('oTracking.event', {
		detail: {
			category: 'component',
			messaging: trackingMessageId,
			action
		},
		bubbles: true
	});

const prioritise = uuid =>
	myftApiClient.add('user', null, 'prioritised', 'concept', uuid);

const unprioritise = uuid =>
	myftApiClient.remove('user', null, 'prioritised', 'concept', uuid);

export const findButton = element =>
	element.dataset && element.dataset.hasOwnProperty('prioritiseButton')
		? element
		: findButton(element.parentNode);

export const setLoading = element =>
	element && element.classList.contains('myft-pin-button-wrapper')
		? element.classList.add('loading')
		: setLoading(element.parentNode);

export default node => {
	const uuid = node.dataset.conceptId;
	const action =
		node.dataset.prioritised === 'true' ? unprioritise : prioritise;
	action(uuid);

	// These custom events are used by envoy so we know when to show or hide promos
	document.body.dispatchEvent(trackPinningAction({
		action: 'act'
	}));
};
