const setBellForAlertConcept = ({ event, followPlusInstantAlerts }) => {
	const conceptId = followPlusInstantAlerts.dataset.conceptId;
	// search through all the concepts that the user has followed and check whether
	// 1. the concept which this instant alert modal controls is within them, AND;
	// 2. the said concept has instant alert enabled
	// if so, set the bell on in the button
	const currentConcept = event.detail.items.find(item => item && item.uuid === conceptId);
	if (currentConcept && currentConcept._rel && currentConcept._rel.instant) {
		followPlusInstantAlerts.classList.add('n-myft-follow-button--instant-alerts--on');
	} else {
		followPlusInstantAlerts.classList.remove('n-myft-follow-button--instant-alerts--on');
	}
};

const sendModalToggleEvent = ({ followPlusInstantAlerts }) => {
	const preferenceModalToggleEvent = new CustomEvent('myft.preference-modal.show-hide.toggle', { bubbles: true });
	followPlusInstantAlerts.dispatchEvent(preferenceModalToggleEvent);
	followPlusInstantAlerts.classList.toggle('n-myft-follow-button--instant-alerts--open');

};


export default () => {
	/**
	 * This feature is part of a test
	 * Therefore we have built it to work within the known parameters of that test
	 * For example we know it will only once appear in the page next to the primary add button on articles
	 * If this was to be used in other locations it would need some additional work to avoid being singleton
	 */
	const followPlusInstantAlerts = document.querySelector('[data-component-id="myft-follow-plus-instant-alerts"]');

	if (!followPlusInstantAlerts) {
		return;
	}

	followPlusInstantAlerts.addEventListener('click', () => sendModalToggleEvent({followPlusInstantAlerts}));

	document.body.addEventListener('myft.user.followed.concept.load', (event) => setBellForAlertConcept({event, followPlusInstantAlerts}));
};
