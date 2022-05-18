import * as buttonStates from '../lib/button-states';
import * as tracking from '../lib/tracking';
import * as loadedRelationships from '../lib/loaded-relationships';
import relationshipConfig from '../lib/relationship-config';
import setTokens from '../lib/set-tokens';
import nNotification from '@financial-times/n-notification';
import Delegate from 'ftdomdelegate';
import personaliseLinks from '../personalise-links';
import doFormSubmit from './do-form-submit';
import enhanceActionUrls from './enhance-action-urls';

const delegate = new Delegate(document.body);
let initialised;

function getInteractionHandler (relationshipName) {
	return (ev, formEl) => {
		ev.preventDefault();
		return doFormSubmit(relationshipName, formEl);
	};
}

function anonEventListeners () {
	const currentPath = window.location.pathname;
	const subscribeUrl = '/products?segID=400863&segmentID=190b4443-dc03-bd53-e79b-b4b6fbd04e64';
	const signInLink = `/login${currentPath.length ? `?location=${currentPath}` : ''}`;
	const messages = {
		followed: `Please <a href="${subscribeUrl}" class="myft-ui-subscribe" data-trackable="Subscribe">subscribe</a> or <a href="${signInLink}" data-trackable="Sign In">sign in</a> to add this topic to myFT.`,
		saved: `Please <a href="${subscribeUrl}" class="myft-ui-subscribe" data-trackable="Subscribe">subscribe</a> or <a href="${signInLink}" data-trackable="Sign In">sign in</a> to save this article.`
	};

	['followed', 'saved'].forEach(action => {
		delegate.on('submit', relationshipConfig[action].uiSelector, event => {
			event.preventDefault();
			nNotification.show({
				content: messages[action],
				trackable: 'myft-anon',
				focusSelector: '.myft-ui-subscribe',
				returnFocusSelector: document.activeElement,
				duration: 0
			});
		});
	});
}

function signedInEventListeners () {
	Object.keys(relationshipConfig).forEach(relationshipName => {
		const uiSelector = relationshipConfig[relationshipName].uiSelector;

		if (uiSelector) {
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
						const resultData = event.detail.results && event.detail.results[0];
						const isPressed = !!event.detail.results;
						buttonStates.setStateOfButton(relationshipName, event.detail.subject, isPressed, undefined, resultData, true);
						tracking.custom({
							subjectType,
							action,
							subjectId: event.detail.subject,
							postedData: event.detail.data,
							resultData: resultData,
							trackingInfo: event.detail.trackingInfo
						});
					});
				});

			delegate.on('submit', uiSelector, getInteractionHandler(relationshipName));
		}
	});
}

export default function (opts) {
	if (!opts.anonymous) {
		setTokens();
	}

	if (!initialised) {
		initialised = true;
		enhanceActionUrls();

		if (opts && opts.anonymous) {
			anonEventListeners();
		} else {
			signedInEventListeners();
			personaliseLinks();
		}
	}
}
