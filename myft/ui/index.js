//TODO: refactor the massive out of this

const nextButtons = require('../../myft-common');
const nNotification = require('n-notification');
const Overlay = require('o-overlay');
const myftClient = require('next-myft-client');
const Delegate = require('ftdomdelegate');

const delegate = new Delegate(document.body);
const uuid = require('n-ui-foundations').uuid;
const $$ = require('n-ui-foundations').$$

const subscribeUrl = '/products?segID=400863&segmentID=190b4443-dc03-bd53-e79b-b4b6fbd04e64';
const signInLink = '/login';

let flags;
let results = {};
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

function getUuid (item) {
	return item.UUID || item.uuid;
}

function toggleButton (buttonEl, pressed) {
	const alreadyPressed = buttonEl.getAttribute('aria-pressed') === 'true';

	if (pressed !== alreadyPressed) {
		nextButtons.toggleState(buttonEl);
	}
	buttonEl.removeAttribute('disabled');
}

function updateUiForRelationship (opts) {
	if (!uiSelectorsMap.get(opts.relationship)) {
		return;
	}

	const featureForms = $$(uiSelectorsMap.get(opts.relationship), opts.context);
	const idProperty = idPropertiesMap.get(opts.relationship);
	const uuids = opts.subjects.map(getUuid);

	// if there are multiple buttons, use the button with the same value as the rel property
	// if there are no multiple buttons, use opts.state
	featureForms.forEach(form => {
		const index = uuids.indexOf(form.getAttribute(idProperty));
		if (index > -1) {
			const relBtns = form.querySelectorAll('button[name^="_rel."]');
			const hasRelBtns = (relBtns.length > 0);
			let activeMultiButton;

			// if the form has _rel.foo buttons, but there is no _rel.foo in the subject object nor an 'off' ('delete') button, then go to next iteration
			// this is for when 1 item is changed on a page with > 1 form, and the returned rel object only has a property for the changed item
			if (hasRelBtns) {
				activeMultiButton = getActiveMultiButton(relBtns, form, opts.subjects[index]);
				if (!activeMultiButton) {
					return;
				}
			}

			$$('button', form).forEach(button => {
				const newButtonState = (hasRelBtns) ? (button === activeMultiButton) : opts.state;
				toggleButton(button, newButtonState);
			});

			// add a BEM modifier for on/off-only styling of the form (e.g. show RSS link if RSS pref is on)
			form.classList.toggle(`myft-ui--${opts.relationship}-on`, !!opts.state);
		}
	});
}

function getActiveMultiButton (relBtns, form, subject) {
	const relName = relBtns[0].getAttribute('name').replace('_rel.', '');
	const relValue = subject._rel && subject._rel[relName];
	// can remove delete button part once old myft alerts page is retired
	const activeButton = form.querySelector(`button[value="${relValue || 'delete'}"]`);
	return activeButton;
}

function openOverlay (html, { name = 'myft-ui', title = '&nbsp;', shaded = true }) {
	const overlay = new Overlay(name, {
		heading: { title, shaded },
		html
	});

	overlay.open();

	return new Promise(resolve => {
		document.body.addEventListener('oOverlay.ready', () => resolve(overlay));
	});
}

function setUpSaveToExistingListListeners (overlay, contentId) {

	const saveToExistingListButton = overlay.content.querySelector('.js-save-to-existing-list');
	const listSelect = overlay.content.querySelector('.js-list-select');

	if (saveToExistingListButton) {
		saveToExistingListButton.addEventListener('click', ev => {
			ev.preventDefault();

			if (!listSelect.value) {
				const nameFormGroup = overlay.content.querySelector('.js-uuid-group');
				nameFormGroup.className += ' o-forms--error n-myft-ui__error--no-name';
				return;
			}

			const listId = listSelect.options[listSelect.selectedIndex].value;
			myftClient.add('list', listId, 'contained', 'content', contentId)
				.then(detail => {
					updateAfterIO('contained', detail);
					overlay.close();
				});
		});
	}
}

function setUpNewListListeners (overlay, contentId) {

	const createListButton = overlay.content.querySelector('.js-create-list');
	const nameInput = overlay.content.querySelector('.js-name');
	const descriptionInput = overlay.content.querySelector('.js-description');

	createListButton.addEventListener('click', ev => {
		ev.preventDefault();

		if (!nameInput.value) {
			const nameFormGroup = overlay.content.querySelector('.js-name-group');
			nameFormGroup.className += ' o-forms--error n-myft-ui__error--no-name';
			return;
		}

		const createListData = {
			name: nameInput.value,
			description: descriptionInput.value
		};

		myftClient.add('user', null, 'created', 'list', uuid(), createListData)
			.then(detail => {
				if (contentId) {
					return myftClient.add('list', detail.subject, 'contained', 'content', contentId);
				} else {
					return detail;
				}

			})
			.then(detail => {
				if (contentId) {
					updateAfterIO('contained', detail);
				}
				overlay.close();
			})
			.catch(err => {

				// TODO: this should use some formalised system for handling generic errors (context: https://github.com/Financial-Times/next-myft-ui/pull/65)
				nNotification.show({
					content: contentId ? 'Error adding article to new list' : 'Error creating new list',
					type: 'error'
				});
				throw err;
			});
	});

}

function showListsOverlay (overlayTitle, formHtmlUrl, contentId) {

	myftClient.personaliseUrl(formHtmlUrl)
		.then(url => fetch(url, {
			credentials: 'same-origin'
		}))
		.then(res => res.text())
		.then(html => openOverlay(html, { title: overlayTitle }))
		.then(overlay => {
			setUpSaveToExistingListListeners(overlay, contentId);
			setUpNewListListeners(overlay, contentId);
		});

}

function showCopyToListOverlay (contentId, excludeList) {
	showListsOverlay('Copy to list', `/myft/list?fragment=true&copy=true&contentId=${contentId}&excludeList=${excludeList}`, contentId)
}

function showArticleSavedOverlay (contentId) {
	showListsOverlay('Article saved', `/myft/list?fragment=true&fromArticleSaved=true&contentId=${contentId}`, contentId)
}

function showCreateListOverlay () {
	showListsOverlay('Create list', '/myft/list?fragment=true');
}

function getMessage (relationship, detail, href) {
	detail.data = detail.data || {};

	const messages = {
		followed:
		`<a href="/myft" class="myft-ui__logo" data-trackable="myft-logo"><abbr title="myFT" class="myft-ui__icon"></abbr></a>
			${detail.results ? 'You are following' : 'You unfollowed'} <b>${detail.data.name}</b>.
			<a href="${href}" data-trackable="alerts">Manage topics</a>`,
		saved:
		`<a href="/myft" class="myft-ui__logo" data-trackable="myft-logo"><abbr title="myFT" class="myft-ui__icon"></abbr></a>
			${detail.results ? 'Article added to your' : 'Article removed from your'}
			<a href="${href}" data-trackable="saved-cta">saved articles</a>`,
		contained:
		`<a href="/myft" class="myft-ui__logo" data-trackable="myft-logo"><abbr title="myFT" class="myft-ui__icon"></abbr></a>
			${detail.results ? `Article added to your list.
			<a href="${href}" data-trackable="alerts">View list</a>` : 'Article removed from your list'}`
	};

	return (messages.hasOwnProperty(relationship)) ? messages[relationship] : '';
}

function getPersonaliseUrlPromise (page, relationship, detail) {
	return myftClient.personaliseUrl(`/myft/${page}`)
		.then(personalisedUrl => ({
			type: 'default',
			message: getMessage(relationship, detail, personalisedUrl)
		}));
}

function updateAfterIO (relationship, detail) {

	updateUiForRelationship({
		relationship,
		subjects: [{ uuid: detail.subject, '_rel': detail.data && detail.data._rel }],
		state: !!detail.results
	});

	let messagePromise = Promise.resolve({});

	switch (relationship) {
		case 'saved':
			if (flags.get('myftLists') && detail.results) {
				messagePromise = myftClient.getAll('created', 'list')
					.then(createdLists => createdLists.filter(list => !list.isRedirect))
					.then(createdLists => {
						if (createdLists.length) {
							showArticleSavedOverlay(detail.subject);
							return { message: null };
						}
						return {};
					});
			}
			break;
		case 'contained':
			messagePromise = getPersonaliseUrlPromise(`list/${detail.actorId}`, 'contained', detail);
			break;
	}

	messagePromise
		.then(({ message = null, type = null }) => {
			if (!message) {
				return;
			}
			nNotification.show({
				content: message,
				type,
				trackable: 'myft-feedback-notification'
			});
		});

}

function onLoad (ev) {
	const relationship = getRelationshipFromEvent(ev);
	results[relationship] = ev.detail.Items || ev.detail.items || [];

	updateUiForRelationship({
		relationship,
		subjects: results[relationship],
		state: true
	});
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

			if (type === 'concept' && id.includes(',')) {

				// follow collection

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
					.then(() => toggleButton(activeButton, action === 'add'));

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
			if (myftClient.loaded[`${relationship}.${typesMap.get(relationship)}`]) {
				results[relationship] = myftClient.loaded[`${relationship}.${typesMap.get(relationship)}`];

				updateUiForRelationship({
					relationship,
					subjects: results[relationship],
					state: true
				});

			} else {
				document.body.addEventListener(`myft.user.${relationship}.${typesMap.get(relationship)}.load`, onLoad);
			}

			document.body.addEventListener(`myft.${actorsMap.get(relationship)}.${relationship}.${typesMap.get(relationship)}.add`, ev => updateAfterIO(getRelationshipFromEvent(ev), ev.detail, actionFromEvent(ev)));
			document.body.addEventListener(`myft.${actorsMap.get(relationship)}.${relationship}.${typesMap.get(relationship)}.remove`, ev => updateAfterIO(getRelationshipFromEvent(ev), ev.detail, actionFromEvent(ev)));
			document.body.addEventListener(`myft.${actorsMap.get(relationship)}.${relationship}.${typesMap.get(relationship)}.update`, ev => updateAfterIO(getRelationshipFromEvent(ev), ev.detail, actionFromEvent(ev)));

			delegate.on('submit', uiSelector, getInteractionHandler(relationship));
		}

		//copy from list to list
		delegate.on('click', '[data-myft-ui="copy-to-list"]', ev => {
			ev.preventDefault();
			showCopyToListOverlay(ev.target.getAttribute('data-content-id'), ev.target.getAttribute('data-actor-id'));
		});

		delegate.on('click', '[data-myft-ui="create-list"]', ev => {
			ev.preventDefault();
			showCreateListOverlay();
		});
	}
}

export function updateUi (el, ignoreLinks) {
	if (!ignoreLinks) {
		personaliseLinks(el);
	}

	for (let relationship of uiSelectorsMap.keys()) {
		if (!results[relationship]) {
			return;
		}

		updateUiForRelationship({
			relationship,
			subjects: results[relationship],
			state: true,
			context: el
		});
	}
}

export function personaliseLinks (el) {
	const links = (el && el.nodeName === 'A') ? [el] : $$('a[href^="/myft"]', el);
	links.forEach(link => {
		myftClient.personaliseUrl(link.getAttribute('href'))
			.then(personalisedUrl => link.setAttribute('href', personalisedUrl));
	});
}
