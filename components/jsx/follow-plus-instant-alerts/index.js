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

	const preferenceModalToggleEvent = new CustomEvent('myft.preference-modal.show-hide.toggle', { bubbles: true });
	followPlusInstantAlerts.addEventListener('click', () => {
		followPlusInstantAlerts.dispatchEvent(preferenceModalToggleEvent);
	});
};
