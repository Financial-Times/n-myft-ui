import relationshipConfig from './relationship-config';
import * as loadedRelationships from './loaded-relationships';
import * as nextButtons from '../../../myft-common';
import setTokens from './set-tokens';

export function toggleButton (buttonEl, pressed) {
	const alreadyPressed = buttonEl.getAttribute('aria-pressed') === 'true';
	if (pressed !== alreadyPressed) {
		nextButtons.toggleState(buttonEl);
	}
	buttonEl.removeAttribute('disabled');
}

export function setStateOfManyButtons (relationshipName, subjectIds, state, context = document, data = {}, announcement='') {
	if (!relationshipConfig[relationshipName]) {
		return;
	}

	const buttonsSelector = relationshipConfig[relationshipName].uiSelector;
	const idProperty = relationshipConfig[relationshipName].idProperty;
	const forms = Array.from(context.querySelectorAll(buttonsSelector))
		.map(buttonEl => buttonEl.closest('form'));

	forms.forEach(el => {
		if (subjectIds.includes(el.getAttribute(idProperty))) {
			updateFollowedRelationships(relationshipName, subjectIds[0], state, data);
			toggleButton(el.querySelector('button'), state);
			const screenReaderAnnouncement = el.querySelector('.n-myft-ui__announce-follow');
			if( announcement && screenReaderAnnouncement ) {
				screenReaderAnnouncement.innerHTML = announcement;
			}
			setTokens({
				container: el
			});
		}
	});
}

export function setStateOfButton (relationshipName, subjectId, state, context = document, data = {}, announcement='') {
	return setStateOfManyButtons(relationshipName, [subjectId], state, context, data, announcement);
}

function updateFollowedRelationships (relationshipName, uuid, state, data = {}) {
	if (relationshipName === 'followed' && true === state && data.subject && data.subject.properties) {
		loadedRelationships.addRelationship(relationshipName, data.subject.properties);
	}

	if (relationshipName === 'followed' && false === state) {
		loadedRelationships.removeRelationship(relationshipName, uuid);
	}
}
