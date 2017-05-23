import * as buttonStates from '../lib/button-states';
import * as loadedRelationships from '../lib/loaded-relationships';
import relationshipConfig from '../lib/relationship-config';
import nNotification from 'n-notification';
import Delegate from 'ftdomdelegate';
import personaliseLinks from '../personalise-links';
import doFormSubmit from './do-form-submit';

const delegate = new Delegate(document.body);
let initialised;


function getInteractionHandler (relationshipName) {
	return (ev, formEl) => {
		ev.preventDefault();
		return doFormSubmit(relationshipName, formEl);
	};
}

function anonEventListeners () {

	const subscribeUrl = '/products?segID=400863&segmentID=190b4443-dc03-bd53-e79b-b4b6fbd04e64';
	const signInLink = '/login';
	const messages = {
		follow: `Please <a href="${subscribeUrl}" data-trackable="Subscribe">subscribe</a> or <a href="${signInLink}" data-trackable="Sign In">sign in</a> to add this topic to myFT.`,
		save: `Please <a href="${subscribeUrl}" data-trackable="Subscribe">subscribe</a> or <a href="${signInLink}" data-trackable="Sign In">sign in</a> to save this article.`
	};
	const actions = ['follow', 'save'];

	actions.forEach(action => {
		delegate.on('submit', `.n-myft-ui--${action}`, event => {
			event.preventDefault();
			nNotification.show({
				content: messages[action],
				trackable: 'myft-anon'
			});
		});
	});
}

function signedInEventListeners () {
	Object.keys(relationshipConfig).forEach(relationshipName => {
		const uiSelector = relationshipConfig[relationshipName].uiSelector;
		loadedRelationships.waitForRelationshipsToLoad(relationshipName)
			.then(() => {
				const relationships = loadedRelationships.getRelationships(relationshipName);
				if (relationships.length > 0) {
					const subjectIds = relationships.map(item => item.uuid);
					buttonStates.setStateOfManyButtons(relationshipName, subjectIds, true);
				}
			});

		['add', 'remove', 'update']
			.forEach(action => {
				const actorType = relationshipConfig[relationshipName].actorType;
				const subjectType = relationshipConfig[relationshipName].subjectType;
				const eventName = `myft.${actorType}.${relationshipName}.${subjectType}.${action}`;
				document.body.addEventListener(eventName, event => {
					buttonStates.setStateOfButton(relationshipName, event.detail.subject, !!event.detail.results);
				});
			});

		delegate.on('submit', uiSelector, getInteractionHandler(relationshipName));
	});
}

export default function (opts) {
	if (initialised) {
		return;
	} else {
		initialised = true;

		if (opts && opts.anonymous) {
			anonEventListeners();
		} else {
			signedInEventListeners();
			personaliseLinks();
		}
	}
}