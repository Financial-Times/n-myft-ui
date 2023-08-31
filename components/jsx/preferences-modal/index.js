const preferenceModalShowAndHide = ({ event, preferencesModal }) => {
	if (!event.target) {
		return;
	}

	preferencesModal.classList.toggle('n-myft-ui__preferences-modal--show');
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

	document.addEventListener('myft.preference-modal.show-hide.toggle', event => preferenceModalShowAndHide({ event, preferencesModal}));
};
