import myFtClient from 'next-myft-client';
import buttons from '../../myft-common';
import getToken from '../../myft/ui/lib/get-csrf-token';
import superstore from 'superstore-sync';
const STORAGE_KEY = 'n-myft-digest-promo-seen';

const CLASSES = {
	ctaBtn:'.n-myft-digest-promo__cta-btn',
	dismissBtn:'.n-myft-digest-promo__dismiss-btn',
	promoComponent:'.n-myft-digest-promo',
	promoEnabled:'n-myft-digest-promo--enabled'
};

let btn;
let element;
let conceptId;

function bindListeners () {
	const btn = document.querySelector(CLASSES.ctaBtn);
	const dismissBtn = document.querySelector(CLASSES.dismissBtn);

	btn.addEventListener('click', addToDigest, false);

	if (dismissBtn) {
		dismissBtn.addEventListener('click', () => {
			hidePromo();
			setDismissState();
		}, false);
	}
}

function shouldShowPromo (conceptId) {
	return Promise.all([
		myFtClient.get('followed', 'concept', conceptId),
		myFtClient.get('preferred', 'preference', 'email-digest')
	]).then(([follows, prefers]) => {
		return follows.length === 0 && prefers.length === 0 && !getDismissState();
	});
}

function showPromo () {
	element = document.querySelector(CLASSES.promoComponent);
	element.classList.add(CLASSES.promoEnabled);
}

function hidePromo () {
	element = document.querySelector(CLASSES.promoComponent);
	element.classList.remove(CLASSES.promoEnabled);
}

function getDismissState () {
	return superstore.session.get(STORAGE_KEY);
}

function setDismissState () {
	superstore.session.set(STORAGE_KEY, 1);
}

function addToDigest () {
	const csrfToken = getToken();
	const metaConcept = {
		name: btn.getAttribute('data-title'),
	};

	const directType = btn.getAttribute('data-direct-type');

	if (directType) {
		metaConcept.directType = directType;
	}

	const metaEmail = {
		_rel: {
			type: 'daily',
			timezone: 'Europe/London'
		}
	};

	const promises = [myFtClient.add('user', null, 'preferred', 'preference', 'email-digest', Object.assign({}, {token: csrfToken}, metaEmail))];

	if (conceptId) {
		promises.push(myFtClient.add('user', null, 'followed', 'concept', conceptId, Object.assign({}, {token: csrfToken}, metaConcept)));
	}

	return Promise.all(promises).then(() => {
		buttons.toggleState(btn, true);
		btn.setAttribute('disabled', true);
		btn.setAttribute('aria-pressed', true);
	});
}

function init () {
	element = document.querySelector(CLASSES.promoComponent);
	if(!superstore.isPersisting() || !element) { return; }
	btn = document.querySelector(CLASSES.ctaBtn);
	conceptId = btn.getAttribute('data-concept-id');
	shouldShowPromo(conceptId).then(shouldShow => {
		if(shouldShow) {
			showPromo();
			bindListeners();
		}
	});
};

export { init };
