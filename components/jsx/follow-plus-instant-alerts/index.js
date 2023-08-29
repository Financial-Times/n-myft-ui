import myFtClient from 'next-myft-client';

// TODO: DOUBLE CHECK THERE ARE NO UNNECESSARY NETWORK REQUESTS BECAUSE OF THIS WORK
export default () => {
	const addToMyFTButton = document.querySelector('[data-component-id="follow-plus-instant-alerts"]');
	if (!addToMyFTButton) return;

	//TODO: make sure the concept Id and the CSRF token have better targetting
	const token = document.querySelector('[data-myft-csrf-token="true"]');
	const conceptId = document.querySelector('[name="conceptId"]');

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
		//TODO: check the event was triggered by the currentConcept
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

			//TODO: removing event listeners may not be needed anymore as the myft.user.followed.concept.load should only be triggering once
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
