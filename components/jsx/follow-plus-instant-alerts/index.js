export default () => {
	const addToMyFTButton = document.querySelector('[data-component-id="follow-plus-instant-alerts"]');
	if (!addToMyFTButton) return;

	const customEvent = new CustomEvent('instantAlertsOnboarding');

	addToMyFTButton.addEventListener('click', (event) => {
		event.preventDefault();
		document.dispatchEvent(customEvent);
	});
};
