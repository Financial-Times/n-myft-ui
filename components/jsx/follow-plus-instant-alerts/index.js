import myFtClient from 'next-myft-client';

export default () => {
	const addToMyFTButton = document.querySelector('[data-component-id="follow-plus-instant-alerts"]');
	if (!addToMyFTButton) return;

	const conceptId = document.querySelector('[name="conceptId"]');
	const token = document.querySelector('[data-myft-csrf-token="true"]');
	const toggleAlertsOnboardingPopupEvent = new CustomEvent('toggleAlertsOnboardingPopup');

	const openPopUp = (event) => {
		event.preventDefault();
		document.dispatchEvent(toggleAlertsOnboardingPopupEvent);
	};

	const followAndOpenPopup = async (event) => {
		event.preventDefault();
		await myFtClient.add('user', null, 'followed', 'concept', conceptId.value, {token: token.value});
		document.dispatchEvent(toggleAlertsOnboardingPopupEvent);
	};

	//toggle bell in the add to myFT button when user toggles instant alerts
	document.body.addEventListener('myft.user.followed.concept.update', (event) => {
		if (event.detail.data._rel.instant === 'true') {
			addToMyFTButton.classList.add('n-myft-follow-button--instant-alerts--on');
		} else {
			addToMyFTButton.classList.remove('n-myft-follow-button--instant-alerts--on');
		}
	});

	document.body.addEventListener('myft.user.followed.concept.load', (event)=> {
		const currentConcept = event.detail.items.find(item => item.uuid === conceptId.value);
		if (currentConcept) {
			//open the instant alerts onboarding popup if user is following this topic already
			addToMyFTButton.removeEventListener('click', followAndOpenPopup);

			addToMyFTButton.addEventListener('click', openPopUp);
			//enable bell in the add to myFT button if user has instant alerts for this topic
			if (currentConcept._rel.instant) {
				addToMyFTButton.classList.add('n-myft-follow-button--instant-alerts--on');
			} else {
				addToMyFTButton.classList.remove('n-myft-follow-button--instant-alerts--on');
			}
		} else {
			//add topic to myFT and open the instant alerts onboarding popup if user is not following this topic already
			addToMyFTButton.removeEventListener('click', openPopUp);
			addToMyFTButton.addEventListener('click', followAndOpenPopup);
		}
	});

	document.body.addEventListener('myft.user.followed.concept.remove', (event) => {
		const currentConcept = event.detail.subject === conceptId.value;
		if (currentConcept) {
			addToMyFTButton.removeEventListener('click', openPopUp);
			addToMyFTButton.addEventListener('click', followAndOpenPopup);
			addToMyFTButton.classList.remove('n-myft-follow-button--instant-alerts--on');
		}
	});
};
