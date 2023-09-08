const setBellForAlertConcept = ({ event, followPlusInstantAlerts }) => {

	if (!event) {
		return;
	}

	/**
	 * There are two types of event we receive
	 * update - happens when the user changes their follows/instant alert
	 * load - happens when the page loads and contains all follow data
	 * The payload of those events are different so we need to handle them differently
	 */
	const isUpdateEvent = event.type === 'myft.user.followed.concept.update';
	const modalConceptId = followPlusInstantAlerts.dataset.conceptId;

	// Search through the event payload to see if any data relates to this modal
	const currentConcept = isUpdateEvent
		? event.detail.results.find(item => item && item.subject && item.subject.properties.uuid === modalConceptId)
		: event.detail.items.find(item => item && item.uuid === modalConceptId);

	if (!currentConcept) {
		return;
	}

	// Does the event indicate that instant alerts are turned on
	const isTurningAlertsOn = isUpdateEvent
		? currentConcept.rel && currentConcept.rel.properties && currentConcept.rel.properties.instant
		: currentConcept._rel && currentConcept._rel.instant;

	// Update the button icon to reflect the instant alert preference
	if (isTurningAlertsOn) {
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
	document.body.addEventListener('myft.user.followed.concept.update', (event) => setBellForAlertConcept({event, followPlusInstantAlerts}));
};
