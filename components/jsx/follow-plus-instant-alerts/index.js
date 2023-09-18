const toggleInstantAlertsClass = ({ instantAlertsOn,followPlusInstantAlerts }) => {
	// Update the button icon to reflect the instant alert preference
	if (instantAlertsOn) {
		followPlusInstantAlerts.classList.add('n-myft-follow-button--instant-alerts--on');
	} else {
		followPlusInstantAlerts.classList.remove('n-myft-follow-button--instant-alerts--on');
	}
};

const instantAlertsIconLoad = ({ event, followPlusInstantAlerts }) => {
	const modalConceptId = followPlusInstantAlerts.dataset && followPlusInstantAlerts.dataset.conceptId;

	if (!event || !modalConceptId) {
		return;
	}

	const currentConcept = event.detail.items
		.find(item => item && item.uuid === modalConceptId);

	if (!currentConcept) {
		return;
	}


	const instantAlertsOn = Boolean(currentConcept && currentConcept._rel && currentConcept._rel.instant);
	toggleInstantAlertsClass({instantAlertsOn, followPlusInstantAlerts });
};

const instantAlertsIconUpdate = ({ event, followPlusInstantAlerts }) => {
	const modalConceptId = followPlusInstantAlerts.dataset && followPlusInstantAlerts.dataset.conceptId;

	if (!event || !modalConceptId) {
		return;
	}

	const currentConcept = event.detail.results
		.find(item => item && item.subject && item.subject.properties && item.subject.properties.uuid === modalConceptId);

	if (!currentConcept) {
		return;
	}

	const instantAlertsOn = Boolean(currentConcept && currentConcept.rel && currentConcept.rel.properties && currentConcept.rel.properties.instant);
	toggleInstantAlertsClass({instantAlertsOn, followPlusInstantAlerts });
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

	document.body.addEventListener('myft.user.followed.concept.load', (event) => instantAlertsIconLoad({event, followPlusInstantAlerts}));
	document.body.addEventListener('myft.user.followed.concept.update', (event) => instantAlertsIconUpdate({event, followPlusInstantAlerts}));
};
