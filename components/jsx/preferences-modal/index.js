/**
 * This preference modal is part of a test
 * Therefore we have built the positioning function to work within the known parameters of that test
 * For example we know it will only appear next to the primary add button on articles
 * If this was to be used in other locations this function would need further improvements
 */
const positionModal = ({ eventTrigger, preferencesModal }) => {
	const modalHorizontalCentering = (eventTrigger.offsetLeft + (eventTrigger.offsetWidth / 2)) - (preferencesModal.offsetWidth / 2);
	const verticalPadding = 16;
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
	if (!event.target) {
		return;
	}

	preferencesModal.classList.toggle('n-myft-ui__preferences-modal--show');

	if (preferencesModal.classList.contains('n-myft-ui__preferences-modal--show')) {
		positionModal({ eventTrigger: event.target, preferencesModal });
	}
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
};

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

	document.addEventListener('myft.preference-modal.show-hide.toggle', event => preferenceModalShowAndHide({ event, preferencesModal }));

	document.addEventListener('myft.user.preferred.preference.load', event => getAlertsPreferences({ event, preferencesModal }));

	document.body.addEventListener('myft.user.followed.concept.load', (event) => {
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
	});
};
