import Delegate from 'ftdomdelegate';
import myftApiClient from 'next-myft-client';

const delegate = new Delegate(document.body);

const trackPinningAction = ({ action }) =>
	new CustomEvent('oTracking.event', {
		detail: {
			category: 'component',
			messaging: 'myft-onboarding-pinning-promo',
			action
		},
		bubbles: true
	});

const findButton = element =>
	element.dataset && element.dataset.hasOwnProperty('prioritiseButton')
		? element
		: findButton(element.parentNode);

const setLoading = element =>
	element && element.classList.contains('myft-pin-button-wrapper')
		? element.classList.add('loading')
		: setLoading(element.parentNode);

const togglePrioritised = element => {
	const { conceptId, prioritised } = element.dataset;

	if (prioritised === 'true') {
		myftApiClient.remove('user', null, 'prioritised', 'concept', conceptId);
	} else {
		myftApiClient.add('user', null, 'prioritised', 'concept', conceptId);
	}

	// These custom events are used by envoy so we know when to show or hide promos
	document.body.dispatchEvent(trackPinningAction({
		action: 'act'
	}));
};

export default () => {
	delegate.on('click', 'button[data-prioritise-button]', event => {
		event.preventDefault();

		setLoading(event.target);
		togglePrioritised(findButton(event.target));
	});
};
