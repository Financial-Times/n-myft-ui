import myFtClient from 'next-myft-client';
import Delegate from 'ftdomdelegate';
import Overlay from '@financial-times/o-overlay';
import * as myFtUiButtonStates from './lib/button-states';
import nNotification from '@financial-times/n-notification';
import { uuid } from 'n-ui-foundations';
import getToken from './lib/get-csrf-token';
import isMobile from './lib/is-mobile';
import oForms from '@financial-times/o-forms';
import openSaveArticleToListVariant from './save-article-to-list-variant';
import stringToHTMLElement from './lib/convert-string-to-html-element';

const delegate = new Delegate(document.body);
const csrfToken = getToken();


function openOverlay (html, { name = 'myft-ui', title = '&nbsp;', shaded = false, trigger = false }) {
	// If an overlay already exists of the same name destroy it.
	const overlays = Overlay.getOverlays();
	const existingOverlay = overlays[name];
	if (existingOverlay) {
		existingOverlay.destroy();
	}
	// Create a new overlay.
	const overlay = new Overlay(name, {
		heading: { title, shaded },
		html,
	});

	overlay.open();

	if (trigger) {
		document.body.addEventListener('oOverlay.destroy', () => trigger.focus(), true);
	}

	return new Promise(resolve => {
		document.body.addEventListener('oOverlay.ready', () => resolve(overlay));
	});
}

function updateAfterAddToList (listId, contentId, wasAdded) {

	myFtUiButtonStates.setStateOfButton('contained', contentId, wasAdded);

	return myFtClient.personaliseUrl(`/myft/list/${listId}`)
		.then(personalisedUrl => {
			const message = `
				<a href="/myft" class="myft-ui__logo" data-trackable="myft-logo"><abbr title="myFT" class="myft-ui__icon"></abbr></a>
					${wasAdded ? `Article added to your list.
				<a href="${personalisedUrl}" data-trackable="alerts">View list</a>` : 'Article removed from your list'}
			`;

			if (!message) {
				return;
			}
			nNotification.show({
				content: message,
				trackable: 'myft-feedback-notification'
			});

			document.body.dispatchEvent(new CustomEvent('oTracking.event', {
				detail: {
					category: 'list',
					action: 'copy-success',
					article_id: contentId,
					list_id: listId,
					content: {
						uuid: contentId
					},
					teamName: 'customer-products-us-growth',
					amplitudeExploratory: true
				},
				bubbles: true
			}));
		});
}


function setUpSaveToExistingListListeners (overlay, contentId) {

	const saveToExistingListButton = overlay.content.querySelector('.js-save-to-existing-list');
	const listSelect = overlay.content.querySelector('.js-list-select');

	if (saveToExistingListButton) {
		saveToExistingListButton.addEventListener('click', event => {
			event.preventDefault();

			if (!listSelect.value) {
				return;
			}

			const listId = listSelect.options[listSelect.selectedIndex].value;
			myFtClient.add('list', listId, 'contained', 'content', contentId, { token: csrfToken })
				.then(detail => {
					updateAfterAddToList(detail.actorId, detail.subject, !!detail.results);
					overlay.close();
				});
		});
	}
}

function setUpCreateListListeners (overlay, contentId) {

	const createListButton = overlay.content.querySelector('.js-create-list');
	const nameInput = overlay.content.querySelector('.js-name');

	if (!createListButton) {
		return;
	}

	createListButton.addEventListener('click', event => {
		event.preventDefault();

		if (!nameInput.value) {
			return;
		}

		const createListData = {
			token: csrfToken,
			name: nameInput.value
		};

		myFtClient.add('user', null, 'created', 'list', uuid(), createListData)
			.then(detail => {
				if (contentId) {
					return myFtClient.add('list', detail.subject, 'contained', 'content', contentId, { token: csrfToken });
				} else {
					return detail;
				}

			})
			.then(detail => {
				if (contentId) {
					updateAfterAddToList(detail.actorId, contentId, !!detail.results);
				}
				overlay.close();
			})
			.catch(err => {
				nNotification.show({
					content: contentId ? 'Error adding article to new list' : 'Error creating new list',
					type: 'error'
				});
				throw err;
			});
	});

}


function showListsOverlay (overlayTitle, formHtmlUrl, contentId, trigger) {
	myFtClient.personaliseUrl(formHtmlUrl)
		.then(url => fetch(url, {
			credentials: 'same-origin'
		}))
		.then(res => {
			if (res.ok) {
				return res.text();
			} else {
				throw new Error(`Unexpected response: ${res.statusText}`);
			}
		})
		.then(html => openOverlay(html, { name: 'myft-lists', title: overlayTitle, trigger }))
		.then(overlay => {
			oForms.init(overlay.content);
			setUpSaveToExistingListListeners(overlay, contentId);
			setUpCreateListListeners(overlay, contentId);
		})
		.catch(err => {
			nNotification.show({
				content: 'Sorry, something went wrong',
				type: 'error'
			});
			throw err;
		});

}

function showCopyToListOverlay (contentId, excludeList, trigger) {
	showListsOverlay('Copy to list', `/myft/list?fragment=true&copy=true&contentId=${contentId}&excludeList=${excludeList}`, contentId, trigger);
}

function showCreateListOverlay (trigger) {
	showListsOverlay('Create list', '/myft/list?fragment=true', null, trigger);
}

function showArticleSavedOverlay (contentId) {
	showListsOverlay('Article saved', `/myft/list?fragment=true&fromArticleSaved=true&contentId=${contentId}`, contentId);
}

function showCreateListAndAddArticleOverlay (contentId, config) {
	const options = {
		name: 'myft-ui-create-list-variant',
		...config
	};

	return openSaveArticleToListVariant(contentId, options);
}

function handleArticleSaved (contentId) {
	return myFtClient.getAll('created', 'list')
		.then(createdLists => createdLists.filter(list => !list.isRedirect))
		.then(createdLists => {
			if (createdLists.length) {
				showArticleSavedOverlay(contentId);
			}
		});
}

function openCreateListAndAddArticleOverlay (contentId, config) {
	return myFtClient.getAll('created', 'list')
		.then(createdLists => createdLists.filter(list => !list.isRedirect))
		.then(() => {
			return showCreateListAndAddArticleOverlay(contentId, config);
		});
}

function handleRemoveToggleSubmit (event) {
	event.preventDefault();

	const formEl = event.target;
	const submitBtnEl = formEl.querySelector('button[type="submit"]');

	if (submitBtnEl.hasAttribute('disabled')) {
		return;
	}

	const isSubmitBtnPressed = submitBtnEl.getAttribute('aria-pressed') === 'true';
	const action = isSubmitBtnPressed ? 'remove' : 'add';
	const contentId = formEl.dataset.contentId;
	const listId = formEl.dataset.actorId;
	const csrfToken = formEl.elements.token;

	if (!csrfToken || !csrfToken.value) {
		document.body.dispatchEvent(new CustomEvent('oErrors.log', {
			bubbles: true,
			detail: {
				error: new Error('myFT form submitted without a CSRF token'),
				info: {
					action,
					actorType: 'list',
					actorId: listId,
					relationshipName: 'contained',
					subjectType: 'content',
					subjectId: contentId,
				},
			},
		}));
	}

	submitBtnEl.setAttribute('disabled', '');

	myFtClient[action]('list', listId, 'contained', 'content', contentId, { token: csrfToken.value })
		.then(() => {
			myFtUiButtonStates.toggleButton(submitBtnEl, !isSubmitBtnPressed);

			document.body.dispatchEvent(new CustomEvent('oTracking.event', {
				detail: {
					category: 'list',
					action: action === 'add' ? 'add-success' : 'remove-success',
					article_id: contentId,
					list_id: listId,
					content: {
						uuid: contentId
					},
					teamName: 'customer-products-us-growth',
					amplitudeExploratory: true
				},
				bubbles: true
			}));
		})
		.catch(error => {
			setTimeout(() => submitBtnEl.removeAttribute('disabled'));
			throw error;
		});
}

function initialEventListeners () {

	document.body.addEventListener('myft.user.saved.content.add', event => {
		const contentId = event.detail.subject;

		// Checks if the createListAndSaveArticle variant is active
		// and will show the variant overlay if the user has no lists,
		// otherwise it will show the classic overlay
		const newListDesign = event.currentTarget.querySelector('[data-myft-ui-save-new="manageArticleLists"]');
		if (newListDesign) {
			const configKeys = newListDesign.dataset.myftUiSaveNewConfig.split(',');
			const config = configKeys.reduce((configObj, key) => (key ? { ...configObj, [key]: true} : configObj), {});

			// Temporary events on the public toggle feature.
			// These will be used to build a sanity check dashboard, and will be removed after we get clean-up this test.
			document.body.dispatchEvent(new CustomEvent('oTracking.event', {
				detail: {
					category: 'publicToggle',
					action: 'savedArticle',
					article_id: contentId,
					teamName: 'customer-products-us-growth',
					amplitudeExploratory: true
				},
				bubbles: true
			}));

			return openCreateListAndAddArticleOverlay(contentId, config);
		}

		handleArticleSaved(contentId);
	});

	document.body.addEventListener('myft.user.saved.content.remove', event => {
		const contentId = event.detail.subject;

		const newListDesign = event.currentTarget.querySelector('[data-myft-ui-save-new="manageArticleLists"]');
		if (newListDesign) {
			return showUnsavedNotification(contentId);
		}
	});

	delegate.on('click', '[data-myft-ui="copy-to-list"]', event => {
		event.preventDefault();
		showCopyToListOverlay(event.target.getAttribute('data-content-id'), event.target.getAttribute('data-actor-id'), event.target);
	});
	delegate.on('click', '[data-myft-ui="create-list"]', event => {
		event.preventDefault();
		showCreateListOverlay(event.target);
	});

	delegate.on('submit', '[data-myft-ui="contained"]', handleRemoveToggleSubmit);
}

function showUnsavedNotification () {
	const parentSelector = isMobile() ? '.o-share--horizontal' : '.o-share--vertical';
	const parentNode = document.querySelector(parentSelector);

	// We're not supporting multiple notifications for now
	// If a notification is present, we'll silently avoid showing another
	if (document.querySelector('.myft-notification') || !parentNode) {
		return;
	}

	const content = `
		<p role="alert">Removed from <a href="https://www.ft.com/myft/saved-articles">saved articles</a> in myFT</p>
	`;

	const contentNode = stringToHTMLElement(content);

	const container = document.createElement('div');
	container.className = 'myft-notification';
	container.appendChild(contentNode);

	parentNode.appendChild(container);

	setTimeout(
		() => parentNode.removeChild(container),
		5 * 1000
	);
}

export function init () {
	initialEventListeners();
}
