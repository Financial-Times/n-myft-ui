import myFtClient from 'next-myft-client';
import getToken from '../../../myft/ui/lib/get-csrf-token';

const csrfToken = getToken();

/**
 * This feature is part of a test
 * Therefore we have built it to work within the known parameters of that test
 * For example we know it will only once appear in the page next to the primary add button on articles
 * If this was to be used in other locations it would need some additional work to avoid being singleton
 */
const preferencesModal = document.querySelector('[data-component-id="myft-preferences-modal"]');
const conceptId = preferencesModal.dataset.conceptId;

/**
 * This preference modal is part of a test
 * Therefore we have built the positioning function to work within the known parameters of that test
 * For example we know it will only appear next to the primary add button on articles
 * If this was to be used in other locations this function would need further improvements
 */
const positionModal = (event) => {
	if (!event.target) {
		return;
	}
	const eventTrigger = event.target;
	const modalHorizontalCentering = (eventTrigger.offsetLeft + (eventTrigger.offsetWidth / 2)) - (preferencesModal.offsetWidth / 2);
	const verticalPadding = 20;
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

const preferenceModalShowAndHide = (event) => {
	preferencesModal.classList.toggle('n-myft-ui__preferences-modal--show');

	if (preferencesModal.classList.contains('n-myft-ui__preferences-modal--show')) {
		positionModal(event);
	}
};

const renderError = ( message ) => {
	const errorElement = document.createElement('span');
	errorElement.innerHTML = message;
	errorElement.setAttribute('aria-live', 'polite');
	errorElement.classList.add('n-myft-ui__preferences-modal-error');

	preferencesModal.insertBefore(errorElement, preferencesModal.firstChild);
};

const removeTopic = async (event) => {
	event.target.setAttribute('disabled', true);

	try {
		await myFtClient.remove('user', null, 'followed', 'concept', conceptId, { token: csrfToken });

		preferenceModalShowAndHide();

	} catch (error) {
		renderError( 'Sorry, we are unable to remove this topic. Please try again later or try from ft.com/myft');
	}

	event.target.removeAttribute('disabled');

};

const toggleInstantAlerts = async (event) => {
	const instantAlertsToggle = event.target;

	instantAlertsToggle.setAttribute('disabled', true);

	const data = {
		token: csrfToken
	};

	if (instantAlertsToggle.checked) {
		data._rel = {instant: 'true'};
	} else {
		data._rel = {instant: 'false'};
	}

	try {
		await myFtClient.updateRelationship('user', null, 'followed', 'concept', conceptId, data);
	} catch (error) {
		renderError( 'Sorry, we are unable to change your instant alert preference. Please try again later or try from ft.com/myft');
	}

	instantAlertsToggle.removeAttribute('disabled');
};

export default () => {
	if (!preferencesModal || !conceptId) {
		return;
	}

	const removeTopicButton = preferencesModal.querySelector('[data-component-id="myft-preference-modal-remove"]');
	const instantAlertsCheckbox = preferencesModal.querySelector('[data-component-id="myft-preference-modal-instant-alerts"]');

	removeTopicButton.addEventListener('click', removeTopic);
	instantAlertsCheckbox.addEventListener('change', toggleInstantAlerts);

	document.addEventListener('myft.preference-modal.show-hide.toggle', preferenceModalShowAndHide);
};
