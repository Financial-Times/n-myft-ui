const buttonStates = require('./lib/button-states');
const loadedRelationships = require('./lib/loaded-relationships');
const relationshipConfig = require('./lib/relationship-config');
const nNotification = require('n-notification');
const myFtClient = require('next-myft-client');
const Delegate = require('ftdomdelegate');
const personaliseLinks = require('./personalise-links');

const delegate = new Delegate(document.body);
const $$ = require('n-ui-foundations').$$

let initialised;

// extract properties with _rel. prefix into nested object, as expected by the API for relationship props
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

function getInteractionHandler (relationshipName) {
	return function (ev, formEl) {
		ev.preventDefault();

		const button = formEl.querySelector('button');
		if (button.hasAttribute('disabled')) {
			return;
		}
		button.setAttribute('disabled', '');

		const isPressed = button.getAttribute('aria-pressed') === 'true';
		const action = isPressed ? 'remove' : 'add';
		const id = formEl.getAttribute(relationshipConfig[relationshipName].idProperty);
		const subectType = relationshipConfig[relationshipName].subjectType;

		const hiddenFields = $$('input[type="hidden"]', formEl);
		let meta = extractMetaData([button, ...hiddenFields]);

		if (~['add', 'remove'].indexOf(action)) {
			const actorId = formEl.getAttribute('data-actor-id');

			const isActionOnTopicCollection = subectType === 'concept' && id.includes(',');
			if (isActionOnTopicCollection) {
				const conceptIds = id.split(',');
				const taxonomies = meta.taxonomy.split(',');
				const names = meta.name.split(',');

				const followPromises = conceptIds.map((conceptId, i) => {
					const singleMeta = Object.assign({}, meta, {
						name: names[i],
						taxonomy: taxonomies[i]
					});
					const actorType = relationshipConfig[relationshipName].actorType;
					return myFtClient[action](actorType, actorId, relationshipName, subectType, conceptId, singleMeta);
				});

				Promise.all(followPromises)
					.then(() => buttonStates.toggleButton(button, action === 'add'));

			} else {
				const actorType = relationshipConfig[relationshipName].actorType;
				myFtClient[action](actorType, actorId, relationshipName, subectType, id, meta);
			}

		} else {
			myFtClient[action](relationshipName, subectType, id, meta);
		}
	};
}

function anonEventListeners () {

	const subscribeUrl = '/products?segID=400863&segmentID=190b4443-dc03-bd53-e79b-b4b6fbd04e64';
	const signInLink = '/login';
	const messages = {
		follow: `Please <a href="${subscribeUrl}" data-trackable="Subscribe">subscribe</a> or <a href="${signInLink}" data-trackable="Sign In">sign in</a> to add this topic to myFT.`,
		save: `Please <a href="${subscribeUrl}" data-trackable="Subscribe">subscribe</a> or <a href="${signInLink}" data-trackable="Sign In">sign in</a> to save this article.`
	}
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
			})

		delegate.on('submit', uiSelector, getInteractionHandler(relationshipName));
	});
}

export function init (opts) {
	if (initialised) {
		return;
	} else {
		initialised = true;

		if (opts && opts.anonymous) {
			anonEventListeners()
		} else {
			signedInEventListeners();
			personaliseLinks();
		}
	}
}
