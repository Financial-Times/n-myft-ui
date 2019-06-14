import Delegate from 'ftdomdelegate';
import myftApiClient from 'next-myft-client';
import serialize from 'form-serialize';
import Tooltip from 'o-tooltip';

const delegate = new Delegate(document.body);

const trackPinningAction = ({ action }) =>
	new CustomEvent('oTracking.event', {
		detail: {
			category: 'n-messaging',
			messaging: 'myft-onboarding-pinning-promo',
			action
		},
		bubbles: true
	});

const setLoading = el => el && el.classList.add('loading');

const togglePrioritised = (conceptId, prioritised, formData) => {
	if (prioritised) {
		myftApiClient.remove('user', null, 'prioritised', 'concept', conceptId, formData);
	} else {
		myftApiClient.add('user', null, 'prioritised', 'concept', conceptId, formData);
	}

	// These custom events are used by envoy so we know when to show or hide promos
	document.body.dispatchEvent(trackPinningAction({
		action: 'act'
	}));
};

export default () => {
	myftApiClient.init()
		.then(() => {
			delegate.off();
			delegate.on('click', 'button[data-prioritise-button]', event => {
				event.preventDefault();

				const form = event.target.closest('[data-myft-prioritise]');
				const formData = form ? serialize(form, { hash: true }) : {};
				const { conceptId, prioritised } = event.target.dataset;
				const wrapper = event.target.closest('.myft-pin-button-wrapper');

				setLoading(wrapper);

				const isPinned = prioritised === 'true';
				togglePrioritised(conceptId, isPinned, formData);

				if (true) {
					const screenReaderAnnouncement = wrapper.querySelector('.n-myft-ui__announcement');
					if (screenReaderAnnouncement) {
						screenReaderAnnouncement.innerHTML = screenReaderAnnouncement.dataset[isPinned ? 'pressedText' : 'unpressedText'];
					}
				}
			});


		});

	[...document.querySelectorAll('.o-tooltip--myft-pin-button')].forEach(element => {
		new Tooltip(element);
	});
};
