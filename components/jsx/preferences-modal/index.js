import myFtClient from 'next-myft-client';
import getToken from '../../../myft/ui/lib/get-csrf-token';

const csrfToken = getToken();

const renderError = ({ message, preferencesModal }) => {
	const errorElement = preferencesModal.querySelector('[data-component-id="myft-preference-modal-error"]');

	errorElement.innerHTML = message;
};

/**
 * This preference modal is part of a test
 * Therefore we have built the positioning function to work within the known parameters of that test
 * For example we know it will only appear next to the primary add button on articles
 * If this was to be used in other locations this function would need further improvements
 */
const positionModal = ({ event, preferencesModal } = {}) => {
	const eventTrigger = event.target;

	if (!eventTrigger) {
		return;
	}

	const modalHorizontalCentering = (eventTrigger.offsetLeft + (eventTrigger.offsetWidth / 2)) - (preferencesModal.offsetWidth / 2);
	const verticalPadding = 15;
	const leftPadding = '5px';

	preferencesModal.style.top = `${eventTrigger.offsetTop + eventTrigger.offsetHeight + verticalPadding}px`;
	preferencesModal.style.left = `${modalHorizontalCentering}px`;

	const modalPositionRelativeToScreen = preferencesModal.getBoundingClientRect();

	if (modalPositionRelativeToScreen.left < 0) {
		preferencesModal.style.left = leftPadding;
	}

	if (modalPositionRelativeToScreen.right > window.screen.width) {
		const triggerRightPosition = eventTrigger.offsetLeft + eventTrigger.offsetWidth;
		const modalShiftLeftPosition = triggerRightPosition - preferencesModal.offsetWidth;

		preferencesModal.style.left = modalShiftLeftPosition > 0
			? `${modalShiftLeftPosition}px`
			: leftPadding;
	}
};

const toggleCheckboxStatus = ({ instantAlertsCheckbox, isChecked }) => {
	if (isChecked) {
		instantAlertsCheckbox.dataset.trackable = 'pop-up-box|set-instant-alert-off';
		instantAlertsCheckbox.checked = true;
	} else {
		instantAlertsCheckbox.dataset.trackable = 'pop-up-box|set-instant-alert-on';
		instantAlertsCheckbox.checked = false;
	}
}

const tracking = (conceptId) => {
	const trackingData = {
		category: 'component',
		action: 'view',
		concept_id: conceptId,
		component: {
			type: 'component',
			name: 'pop-up-box',
			id: '72de123e-5082-11ee-be56-0242ac120002',
		}
	}

	const trackingEvent = new CustomEvent('oTracking.event', {
		detail: trackingData,
		bubbles: true
	});

	document.body.dispatchEvent(trackingEvent);
};

const preferenceModalHide = ({ event, preferencesModal }) => {
	if (!preferencesModal.contains(event.detail.targetElement)) {
		preferencesModal.classList.remove('n-myft-ui__preferences-modal--show');
	}
};

const preferenceModalShowAndHide = ({ event, preferencesModal, conceptId }) => {
	preferencesModal.classList.toggle('n-myft-ui__preferences-modal--show');

	if (preferencesModal.classList.contains('n-myft-ui__preferences-modal--show')) {
		positionModal({ event, preferencesModal });

		tracking(conceptId);

	} else {
		// Remove existing errors when hiding the modal
		renderError({
			message: '',
			preferencesModal,
		});
	}
};

const removeTopic = async ({ event, conceptId, preferencesModal }) => {
	event.target.setAttribute('disabled', true);

	try {
		await myFtClient.remove('user', null, 'followed', 'concept', conceptId, { token: csrfToken });
		preferenceModalShowAndHide({ preferencesModal });
	} catch (error) {
		renderError({ message: 'Sorry, we are unable to remove this topic. Please try again later or try from <a href="/myft">myFT</a>', preferencesModal });
	}

	event.target.removeAttribute('disabled');
};

const getAlertsPreferenceText = (addedTextBuffer) => {
	const alertsEnabledText = `Your delivery channels: ${addedTextBuffer.join(', ')}.`;
	return Array.isArray(addedTextBuffer) && addedTextBuffer.length > 0 ? alertsEnabledText : '';
};

const getAlertsPreferences = async ({ event, preferencesModal }) => {
	const preferencesList = preferencesModal.querySelector('[data-component-id="myft-preferences-modal-list"]');

	if (!preferencesList) {
		return;
	}
	const addedTextBuffer = [];

	event.detail.items.forEach(item => {
		if (item.uuid === 'email-instant') {
			addedTextBuffer.push(' email');
		}
		else if (item.uuid === 'app-instant') {
			addedTextBuffer.push(' app');
		}
	});

	preferencesList.innerHTML = getAlertsPreferenceText(addedTextBuffer);

	try {
		// We need the service worker registration to check for a subscription
		const serviceWorkerRegistration = await navigator.serviceWorker.ready;
		const subscription = await serviceWorkerRegistration.pushManager.getSubscription();
		if (subscription) {
			addedTextBuffer.push('browser');
		}
	} catch (error) {
		// eslint-disable-next-line no-console
		console.warn('There was an error fetching the browser notification preferences', error);
	}

	preferencesList.innerHTML = getAlertsPreferenceText(addedTextBuffer);
};

const setCheckboxForAlertConcept = ({ event, preferencesModal }) => {
	const conceptId = preferencesModal.dataset.conceptId;
	const instantAlertsCheckbox = preferencesModal.querySelector('[data-component-id="myft-preferences-modal-checkbox"]');

	// search through all the concepts that the user has followed and check whether
	// 1. the concept which this instant alert modal controls is within them, AND;
	// 2. the said concept has instant alert enabled
	// if so, check the checkbox within the modal
	const currentConcept = event.detail.items.find(item => item && item.uuid === conceptId);
	const isChecked = currentConcept && currentConcept._rel && currentConcept._rel.instant;
	toggleCheckboxStatus({
		instantAlertsCheckbox,
		isChecked,
	});
};

const toggleInstantAlertsPreference = async ({ event, conceptId, preferencesModal }) => {
	const instantAlertsCheckbox = event.target;

	if (!instantAlertsCheckbox) {
		return;
	}

	instantAlertsCheckbox.setAttribute('disabled', true);

	const data = {
		token: csrfToken
	};

	toggleCheckboxStatus({
		instantAlertsCheckbox,
		isChecked: instantAlertsCheckbox.checked,
	});
	if (instantAlertsCheckbox.checked) {
		data._rel = {instant: 'true'};
	} else {
		data._rel = {instant: 'false'};
	}

	try {
		await myFtClient.updateRelationship('user', null, 'followed', 'concept', conceptId, data);
	} catch (error) {
		renderError({
			message: 'Sorry, we are unable to change your instant alert preference. Please try again later or try from <a href="/myft">myFT</a>',
			preferencesModal
		});

		instantAlertsCheckbox.checked = instantAlertsCheckbox.checked
			? false
			: true;
	}

	instantAlertsCheckbox.removeAttribute('disabled');
};

const setCheckboxForAlertConceptToOff =  ({ event, preferencesModal }) => {
	const conceptId = preferencesModal.dataset.conceptId;
	const instantAlertsCheckbox = preferencesModal.querySelector('[data-component-id="myft-preferences-modal-checkbox"]');

	const currentConcept = event.detail.subject === conceptId;
	if (!currentConcept) {
		return;
	}

	toggleCheckboxStatus({
		instantAlertsCheckbox,
		isChecked: false,
	});
}

export default () => {
	/**
	 * This feature is part of a test
	 * Therefore we have built it to work within the known parameters of that test
	 * For example we know it will only once appear in the page next to the primary add button on articles
	 * If this was to be used in other locations it would need some additional work to avoid being singleton
	 */
	const preferencesModal = document.querySelector('[data-component-id="myft-preferences-modal"]');

	if (!preferencesModal) {
		return;
	}
	const conceptId = preferencesModal.dataset.conceptId;

	if (!conceptId) {
		return;
	}

	const removeTopicButton = preferencesModal.querySelector('[data-component-id="myft-preference-modal-remove"]');
	const instantAlertsCheckbox = preferencesModal.querySelector('[data-component-id="myft-preferences-modal-checkbox"]');

	if (!removeTopicButton || !instantAlertsCheckbox) {
		return;
	}

	removeTopicButton.addEventListener('click', event => removeTopic({ event, conceptId, preferencesModal }));

	instantAlertsCheckbox.addEventListener('change', event => toggleInstantAlertsPreference({ event, conceptId, preferencesModal }));

	document.addEventListener('myft.preference-modal.show-hide.toggle', event => preferenceModalShowAndHide({ event, preferencesModal, conceptId }));

	document.addEventListener('myft.preference-modal.hide', event => preferenceModalHide({ event, preferencesModal }));

	document.addEventListener('myft.user.preferred.preference.load', (event) => getAlertsPreferences({ event, preferencesModal }));

	document.body.addEventListener('myft.user.followed.concept.load', (event) => setCheckboxForAlertConcept({ event, preferencesModal }));
	document.body.addEventListener('myft.user.followed.concept.remove', (event) => setCheckboxForAlertConceptToOff({ event, preferencesModal }));
};
