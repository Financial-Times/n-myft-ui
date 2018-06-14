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

const findAncestor = (el, classname) => el.classList.contains(classname)
	? el
	: el.parentNode && findAncestor(el.parentNode);

const setLoading = el => el && el.classList.add('loading');

const togglePrioritised = (conceptId, prioritised) => {
	if (prioritised) {
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

		const { conceptId, prioritised } = event.target.dataset;
		const wrapper = findAncestor(event.target, 'myft-pin-button-wrapper');

		setLoading(wrapper);
		togglePrioritised(conceptId, prioritised === 'true');
	});
};
