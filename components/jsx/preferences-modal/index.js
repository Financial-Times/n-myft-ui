import myFtClient from 'next-myft-client';
import getToken from '../../../myft/ui/lib/get-csrf-token';

const csrfToken = getToken();

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

const renderError = ({ message, preferencesModal }) => {
	const errorElement = preferencesModal.querySelector('[data-component-id="myft-preference-modal-error"]');

	errorElement.innerHTML = message;
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

};
