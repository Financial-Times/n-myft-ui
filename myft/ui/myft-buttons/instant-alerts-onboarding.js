export default function () {
	const addToMyFTButton = document.querySelector('[data-trackable="follow"]');//maybe need a better way to differentiate between 2 possible flavours of addToMyFT buttons

	const preferencesModal = document.querySelector('[data-component-id="preferences-modal"]');

	addToMyFTButton.addEventListener('click', (event) => {
		event.preventDefault();
		preferencesModal.classList.toggle('n-myft-ui__preferences-modal__hide');
	});

	document.addEventListener('click', (event) => {
		// Check if the clicked element is outside the preferencesModal
		if (!preferencesModal.contains(event.target) && event.target !== addToMyFTButton) {
		  preferencesModal.classList.add('n-myft-ui__preferences-modal__hide');
		}
	  });
}