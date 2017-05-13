//TODO: refactor the massive out of this

const myFtUiButtonStates = require('./button-states');
const myFtStuffOnPageLoad = require('./myft-stuff-on-page-load');
const nNotification = require('n-notification');
const myftClient = require('next-myft-client');
const Delegate = require('ftdomdelegate');
const lists = require('./lists');

const delegate = new Delegate(document.body);
const $$ = require('n-ui-foundations').$$

const subscribeUrl = '/products?segID=400863&segmentID=190b4443-dc03-bd53-e79b-b4b6fbd04e64';
const signInLink = '/login';

let flags;
let initialised;

const actorsMap = require('./relationship-maps/actors');
const uiSelectorsMap = require('./relationship-maps/ui-selectors');
const idPropertiesMap = require('./relationship-maps/id-properties');
const typesMap = require('./relationship-maps/types');

const nNotificationMsgs = {
	followAnon: `Please <a href="${subscribeUrl}" data-trackable="Subscribe">subscribe</a> or <a href="${signInLink}" data-trackable="Sign In">sign in</a> to add this topic to myFT.`,
	saveAnon: `Please <a href="${subscribeUrl}" data-trackable="Subscribe">subscribe</a> or <a href="${signInLink}" data-trackable="Sign In">sign in</a> to save this article.`,
	opted: 'You‘ve opted into our new site. You can return to FT.com at any time.'
};

function getRelationshipFromEvent (ev) {
	return ev.type.replace('myft.', '').split('.')[1];
}

function actionFromEvent (ev) {
	const eventType = ev.type.split('.');
	return eventType[eventType.length - 1];
}

function updateAfterIO (relationship, detail) {
	myFtUiButtonStates.setStateOfButton(relationship, detail.subject, !!detail.results);

	if(relationship === 'saved' && detail.results && flags.get('myftLists')) {
		lists.handleArticleSaved(detail.subject)
	}
}

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
					return myftClient[action](actorsMap.get(relationship), actorId, relationship, type, conceptId, singleMeta);
				});

				Promise.all(followPromises)
					.then(() => myFtUiButtonStates.toggleButton(button, action === 'add'));

			} else {
				myftClient[action](actorsMap.get(relationship), actorId, relationship, type, id, meta);
			}

		} else {
			myftClient[action](relationship, type, id, meta);
		}
	};
}

export function init (opts) {
	if (initialised) {
		return;
	}
	initialised = true;
	flags = opts.flags;

	if (opts && opts.anonymous) {
		['follow', 'save'].forEach(action => {
			delegate.on('submit', `.n-myft-ui--${action}`, ev => {
				ev.preventDefault();
				nNotification.show({
					content: nNotificationMsgs[`${action}Anon`],
					trackable: 'myft-anon'
				});
			});
		});
	} else {
		personaliseLinks();

		for (let [relationship, uiSelector] of uiSelectorsMap) {
			myFtStuffOnPageLoad.waitForMyFtStuffToLoad(relationship)
				.then(() => {
					const loadedRelationships = myFtStuffOnPageLoad.getMyFtStuff(relationship);
					if(loadedRelationships) {
						const subjectIds = loadedRelationships.items.map(item => item.uuid);
						myFtUiButtonStates.setStateOfManyButtons(relationship, subjectIds, true);
					}
				});

			document.body.addEventListener(`myft.${actorsMap.get(relationship)}.${relationship}.${typesMap.get(relationship)}.add`, ev => updateAfterIO(getRelationshipFromEvent(ev), ev.detail, actionFromEvent(ev)));
			document.body.addEventListener(`myft.${actorsMap.get(relationship)}.${relationship}.${typesMap.get(relationship)}.remove`, ev => updateAfterIO(getRelationshipFromEvent(ev), ev.detail, actionFromEvent(ev)));
			document.body.addEventListener(`myft.${actorsMap.get(relationship)}.${relationship}.${typesMap.get(relationship)}.update`, ev => updateAfterIO(getRelationshipFromEvent(ev), ev.detail, actionFromEvent(ev)));

			delegate.on('submit', uiSelector, getInteractionHandler(relationship));
		}

		if(flags.get('myftLists')) {
			lists.init();
		}
	}
}

export function updateUi (contextEl, ignoreLinks) {
	if (!ignoreLinks) {
		personaliseLinks(contextEl);
	}

	for (let relationship of uiSelectorsMap.keys()) {
		const loadedRelationships = myFtStuffOnPageLoad.getMyFtStuff(relationship);
		if (loadedRelationships) {
			const subjectIds = loadedRelationships.items.map(item => item.uuid) // todo not sure if this is right ???
			myFtUiButtonStates.setStateOfManyButtons(relationship, subjectIds, true, contextEl);
		}
	}
}

export function personaliseLinks (el) {
	const links = (el && el.nodeName === 'A') ? [el] : $$('a[href^="/myft"]', el);
	links.forEach(link => {
		myftClient.personaliseUrl(link.getAttribute('href'))
			.then(personalisedUrl => link.setAttribute('href', personalisedUrl));
	});
}
