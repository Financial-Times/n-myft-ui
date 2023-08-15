export default () => {
	const preferencesModal = document.querySelector('[data-component-id="preferences-modal"]');
	if (!preferencesModal) return;
	preferencesModal.classList.add('n-myft-ui__preferences-modal-live');

	document.addEventListener('instantAlertsOnboarding', (event) => {
		event.preventDefault();
		preferencesModal.classList.toggle('n-myft-ui__preferences-modal__hide');
	});
};
