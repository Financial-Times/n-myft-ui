import myFtClient from 'next-myft-client';

export default () => {
	const preferencesModal = document.querySelector('[data-component-id="preferences-modal"]');
	if (!preferencesModal) return;
	preferencesModal.classList.add('n-myft-ui__preferences-modal-live');

	const instantAlertsToggle = document.querySelector('[data-component-id="receive-instant-alerts"]');
	const removeFromMyFTButton = document.querySelector('[data-component-id="remove-from-myft"]');

	//TODO: make sure the concept Id and the CSRF token have better targetting
	const conceptId = document.querySelector('[name="conceptId"]');
	const token = document.querySelector('[data-myft-csrf-token="true"]');

	//toggle instant alerts when clicking on the instant alerts toggle checkbox
	instantAlertsToggle.addEventListener('click', async () => {
		const data = {
			token: token.value,
		};
		if (instantAlertsToggle.checked) {
			data._rel = {instant: 'true'};
		} else {
			data._rel = {instant: 'false'};
		}
		await myFtClient.updateRelationship('user', null, 'followed', 'concept', conceptId.value, data);
	});

	document.body.addEventListener('myft.user.followed.concept.load', (event)=> {
		const currentConcept = event.detail.items.find(item => item.uuid === conceptId.value);

		if (currentConcept._rel.instant === 'true') {
			instantAlertsToggle.checked = true;
		}
	});

	document.addEventListener('toggleAlertsOnboardingPopup', () => {
		preferencesModal.classList.toggle('n-myft-ui__preferences-modal__hide');
	});

	removeFromMyFTButton.addEventListener('click', async () => {
		await myFtClient.remove('user', null, 'followed', 'concept', conceptId.value, {token: token.value});
		instantAlertsToggle.checked = false;
		const toggleAlertsOnboardingPopupEvent = new CustomEvent('toggleAlertsOnboardingPopup');
		document.dispatchEvent(toggleAlertsOnboardingPopupEvent);
	});
};
