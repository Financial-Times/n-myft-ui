import myFtClient from 'next-myft-client';
import relationshipConfigs from '../lib/relationship-config';
import getDataFromInputs from './get-data-from-inputs';
import * as collections from '../../../components/collections';
import {offerInstantAlerts} from '../lib/push-notifications';

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

// Takes a data-myft-tracking value
// like "a=1, b=3, c = sausages, d, e"
// and returns an object like
// {a:1, b:3, c:"sausages", d:true, e:true}
function getTrackingInfo (formEl) {
	const trackingExpr = formEl.getAttribute('data-myft-tracking') || '';
	return trackingExpr
		.split(',')
		.map( kvExpr => kvExpr.split('=') )
		.reduce( (trackingInfo, [key,value]) => {
			const cleanKey = key && key.trim();
			const cleanValue = value && value.trim() || true;
			if (cleanKey && cleanValue) {
				trackingInfo[cleanKey] = cleanValue;
			}
			return trackingInfo;
		},
			{} );
}

export default function (relationshipName, formEl, pushNotifications) {
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

	const trackingInfo = getTrackingInfo(formEl);

	if (collections.formIsFollowCollection(relationshipName, formEl)) {
		return collections.doAction(action, actorId, formEl, formData, trackingInfo);
	} else if (formEl.getAttribute('data-myft-ui-variant') === 'followPlusDigestEmail' && action === 'add') {
		return myFtClient.followPlusDigestEmail(formEl.getAttribute('data-concept-id'), formData);
	} else {
		const relConfig = relationshipConfigs[relationshipName];
		const subjectId = formEl.getAttribute(relConfig.idProperty);
		const { actorType, subjectType } = relConfig;

		if( !formEl.elements.token || !formEl.elements.token.value ) {
			document.body.dispatchEvent(new CustomEvent('oErrors.log', {
				bubbles: true,
				detail: {
					error: Error('myFT form submitted without a CSRF token'),
					info: {action, actorType, actorId, relationshipName, subjectType, subjectId, formData}
				}
			}));
		}

		return myFtClient[action](actorType, actorId, relationshipName, subjectType, subjectId, formData, trackingInfo)
			.then( () => {
				if( pushNotifications ) {
					if (action === 'add' && relationshipName === 'followed') {
						offerInstantAlerts(subjectId);
					}
				}
			})
			.catch( e => {
				setTimeout(() => formEl.querySelector('button').removeAttribute('disabled'), 1000);
				throw e;
			});
	}
}
