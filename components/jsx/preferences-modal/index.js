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

const preferenceModalShowAndHide = ({ event, preferencesModal }) => {
	preferencesModal.classList.toggle('n-myft-ui__preferences-modal--show');

	if (preferencesModal.classList.contains('n-myft-ui__preferences-modal--show')) {
		positionModal({ event, preferencesModal });
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

const getAlertsPreferences = ({ event, preferencesModal }) => {
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

	const alertsEnabledText = preferencesList.innerHTML + addedTextBuffer.join(',') + '.';
	const alertsDisabledText = 'You have disabled all instant alerts';

	preferencesList.innerHTML = addedTextBuffer.length > 0 ? alertsEnabledText : alertsDisabledText;
}

const setCheckboxForAlertConcept = ({ event, preferencesModal }) => {
	const conceptId = preferencesModal.dataset.conceptId;
	const instantAlertsCheckbox = preferencesModal.querySelector('[data-component-id="myft-preferences-modal-checkbox"]');
	// search through all the concepts that the user has followed and check whether
	// 1. the concept which this instant alert modal controls is within them, AND;
	// 2. the said concept has instant alert enabled
	// if so, check the checkbox within the modal
	const currentConcept = event.detail.items.find(item => item && item.uuid === conceptId);
	if (currentConcept && currentConcept._rel && currentConcept._rel.instant) {
		instantAlertsCheckbox.checked = true;
	} else {
		instantAlertsCheckbox.checked = false;
	}
};

export default () => {
	/**
	 * This feature is part of a test
	 * Therefore we have built it to work within the known parameters of that test
	 * For example we know it will only once appear in the page next to the primary add button on articles
	 * If this was to be used in other locations it would need some additional work to avoid being singleton
	 */
	const preferencesModal = document.querySelector('[data-component-id="myft-preferences-modal"]');
	const conceptId = preferencesModal.dataset.conceptId;

	if (!preferencesModal || !conceptId) {
		return;
	}

	const removeTopicButton = preferencesModal.querySelector('[data-component-id="myft-preference-modal-remove"]');

	removeTopicButton.addEventListener('click', event => removeTopic({ event, conceptId, preferencesModal }));

	document.addEventListener('myft.preference-modal.show-hide.toggle', event => preferenceModalShowAndHide({ event, preferencesModal }));

	document.addEventListener('myft.user.preferred.preference.load', event => getAlertsPreferences({ event, preferencesModal }));

	document.body.addEventListener('myft.user.followed.concept.load', (event) => setCheckboxForAlertConcept({ event, preferencesModal }));
};
