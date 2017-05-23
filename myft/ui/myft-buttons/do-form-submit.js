import myFtClient from 'next-myft-client';
import relationshipConfigs from '../lib/relationship-config';
import getDataFromInputs from './get-data-from-inputs';
import * as collections from './collections';

function formButtonIsDisabled (formEl) {
	return formEl.querySelector('button').hasAttribute('disabled');
}

function getAction (formEl) {
	const isPressed = formEl.querySelector('button').getAttribute('aria-pressed') === 'true';
	return isPressed ? 'remove' : 'add';
}

function getFormData (formEl) {
	const button = formEl.querySelector('button');
	const hiddenFields = formEl.querySelectorAll('input[type="hidden"]');
	const formInputs = [
		button,
		...hiddenFields
	];
	return getDataFromInputs(formInputs);
}

export default function (relationshipName, formEl) {
	if (formButtonIsDisabled(formEl)) {
		return;
	} else {
		formEl.querySelector('button').setAttribute('disabled', '');
	}

	const action = getAction(formEl);

	// note that where the actor is a user, the actorId may be null, in which case myFT client will fill
	// in the userId from the session 😕
	const actorId = formEl.getAttribute('data-actor-id');

	const formData = getFormData(formEl);

	if (collections.formIsFollowCollection(relationshipName, formEl)) {
		return collections.doAction(action, actorId, formEl, formData);
	} else {
		const relConfig = relationshipConfigs[relationshipName];
		const subjectId = formEl.getAttribute(relConfig.idProperty);
		const subectType = relConfig.subjectType;
		const actorType = relConfig.actorType;
		return myFtClient[action](actorType, actorId, relationshipName, subectType, subjectId, formData);
	}
}
