const buttonStates = require('./lib/button-states');
const myFtStuffOnPageLoad = require('./lib/myft-stuff-on-page-load');
const nNotification = require('n-notification');
const myFtClient = require('next-myft-client');
const Delegate = require('ftdomdelegate');
const actorsMap = require('./lib/relationship-maps/actors');
const uiSelectorsMap = require('./lib/relationship-maps/ui-selectors');
const idPropertiesMap = require('./lib/relationship-maps/id-properties');
const typesMap = require('./lib/relationship-maps/types');
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

function getInteractionHandler (relationship) {
	return function (ev, formEl) {
		ev.preventDefault();

		const button = formEl.querySelector('button');
		if (button.hasAttribute('disabled')) {
			return;
		}
		button.setAttribute('disabled', '');

		const isPressed = button.getAttribute('aria-pressed') === 'true';
		const action = isPressed ? 'remove' : 'add';
		const id = formEl.getAttribute(idPropertiesMap.get(relationship));
		const type = typesMap.get(relationship);

		const hiddenFields = $$('input[type="hidden"]', formEl);
		let meta = extractMetaData([button, ...hiddenFields]);

		if (~['add', 'remove'].indexOf(action)) {
			const actorId = formEl.getAttribute('data-actor-id');

			const isActionOnTopicCollection = type === 'concept' && id.includes(',');
			if (isActionOnTopicCollection) {
				const conceptIds = id.split(',');
				const taxonomies = meta.taxonomy.split(',');
				const names = meta.name.split(',');

				const followPromises = conceptIds.map((conceptId, i) => {
					const singleMeta = Object.assign({}, meta, {
						name: names[i],
						taxonomy: taxonomies[i]
					});
					return myFtClient[action](actorsMap.get(relationship), actorId, relationship, type, conceptId, singleMeta);
				});

				Promise.all(followPromises)
					.then(() => buttonStates.toggleButton(button, action === 'add'));

			} else {
				myFtClient[action](actorsMap.get(relationship), actorId, relationship, type, id, meta);
			}

		} else {
			myFtClient[action](relationship, type, id, meta);
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
	for (let [relationship, uiSelector] of uiSelectorsMap) {
		myFtStuffOnPageLoad.waitForMyFtStuffToLoad(relationship)
			.then(() => {
				const loadedRelationships = myFtStuffOnPageLoad.getMyFtStuff(relationship);
				if (loadedRelationships) {
					const subjectIds = loadedRelationships.items.map(item => item.uuid);
					buttonStates.setStateOfManyButtons(relationship, subjectIds, true);
				}
			});

		['add', 'remove', 'update']
			.forEach(action => {
				const eventName = `myft.${actorsMap.get(relationship)}.${relationship}.${typesMap.get(relationship)}.${action}`;
				document.body.addEventListener(eventName, event => {
					const relationship = event.type.replace('myft.', '').split('.')[1];
					buttonStates.setStateOfButton(relationship, event.detail.subject, !!event.detail.results);
				});
			})

		delegate.on('submit', uiSelector, getInteractionHandler(relationship));
	}
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