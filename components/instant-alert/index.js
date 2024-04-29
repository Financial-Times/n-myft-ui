import * as nNotification from '@financial-times/n-notification/main';
import Delegate from 'ftdomdelegate';
import myftClient from 'next-myft-client';
import { $, $$ } from 'n-ui-foundations/main';
import * as nextButtons from '../../myft-common';

const delegate = new Delegate(document.body);
const subscribeUrl = '/products?segID=400863&segmentID=190b4443-dc03-bd53-e79b-b4b6fbd04e64';
const signInLink = '/login';
const UI_HOOK = '[data-myft-ui="instant"]';
let config;

// until API is updated to return modelled response data from create calls, fallback to old raw format
function getNewInstantState (response) {
	if(!response._rel && !(response.results && response.results[0])) {
		return false;
	}
	return Boolean(response._rel ? response._rel.instant : response.results[0].rel.properties.instant);
}

function updateConceptData (subjectId, data) {
	myftClient.updateRelationship('user', null, 'followed', 'concept', subjectId, data);
}

function toggleButton (buttonEl, state) {
	const isPressed = buttonEl.getAttribute('aria-pressed') === 'true';

	if (state !== isPressed) {
		nextButtons.toggleState(buttonEl);
		const name = buttonEl.getAttribute('data-name');
		if (isPressed) {
			buttonEl.setAttribute('aria-label', 'Alerts ' + name + ' currently disabled, change to enable');
		} else {
			buttonEl.setAttribute('aria-label', 'Alerts ' + name + ' currently enabled, change to disable');
		}
	}

	buttonEl.removeAttribute('disabled');
	buttonEl.setAttribute('value', !state);
}

function updateButtons (subjectId, newState) {
	const affectedButtons = $$(`${UI_HOOK}[data-concept-id="${subjectId}"] button`);
	affectedButtons.forEach((button) => {
		toggleButton(button, newState);
	});
}

function conceptRemoved (conceptData) {
	updateButtons(conceptData.subject, false);
}

function conceptUpdated (conceptData) {
	const newState = getNewInstantState(conceptData);
	updateButtons(conceptData.subject, newState);
}

function showAnonNotification () {
	nNotification.show({
		content: `Please <a href="${subscribeUrl}" data-trackable="Subscribe">subscribe</a> or <a href="${signInLink}" data-trackable="Sign In">sign in</a> to receive instant alerts.`,
		trackable: 'myft-anon'
	});
}

function extractMetaData (inputs) {
	const meta = {};

	inputs.forEach((input) => {
		if (input.name.startsWith('_rel.')) {
			const key = input.name.slice('_rel.'.length);
			meta._rel = meta._rel || {};
			meta._rel[key] = input.value;

		} else if (input.type === 'hidden') {
			meta[input.name] = input.value;
		}
	});

	return meta;
}

function formSubmitted (event, element) {
	event.preventDefault();
	if (config && config.anonymous) {
		showAnonNotification();
	} else {
		const subjectId = element.getAttribute('data-concept-id');
		const submitEl = $('button', element);
		const inputs = $$('input', element);
		inputs.push(submitEl);
		updateConceptData(subjectId, extractMetaData(inputs));
	}
}

// update UI to show real state of instant alerts
// until we have ESI, we cannot do this server-side as it could cache the wrong state
function applyModel () {
	if (myftClient.loaded && myftClient.loaded['followed.concept']) {
		myftClient.loaded['followed.concept'].items.forEach((item) => {
			if (item._rel.instant) {
				updateButtons(item.uuid, true);
			}
		});
	}
}

function eventListeners () {
	document.body.addEventListener('myft.user.followed.concept.load', applyModel);
	document.body.addEventListener('myft.user.followed.concept.remove', ev => conceptRemoved(ev.detail));
	document.body.addEventListener('myft.user.followed.concept.update', ev => conceptUpdated(ev.detail));
	delegate.on('submit', `${UI_HOOK}`, formSubmitted);
}

// delegate is listening to the whole body therefore events look for forms across the whole page rather than setting up instances
// if we used instances we could reduce the amount of DOM queries that we do
export function init (opts) {
	const instantAlertForms = $$(UI_HOOK);
	config = opts;
	if (instantAlertForms.length > 0) {
		applyModel();
		eventListeners();
		// Tracking is implicitly handled in myft/ui/myft-buttons/init.js and myft/ui/lib/tracking.js
	}
}
