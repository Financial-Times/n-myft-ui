import myFtClient from 'next-myft-client';
import Delegate from 'ftdomdelegate';
import Overlay from 'o-overlay';
import * as myFtUiButtonStates from './lib/button-states';
import nNotification from 'n-notification';
import { uuid } from 'n-ui-foundations';
import getToken from './lib/get-csrf-token';

const delegate = new Delegate(document.body);
const csrfToken = getToken();


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
		});
}


function setUpSaveToExistingListListeners (overlay, contentId) {

	const saveToExistingListButton = overlay.content.querySelector('.js-save-to-existing-list');
	const listSelect = overlay.content.querySelector('.js-list-select');

	if (saveToExistingListButton) {
		saveToExistingListButton.addEventListener('click', event => {
			event.preventDefault();

			if (!listSelect.value) {
				const nameFormGroup = overlay.content.querySelector('.js-uuid-group');
				nameFormGroup.className += ' o-forms--error n-myft-ui__error--no-name';
				return;
			}

			const listId = listSelect.options[listSelect.selectedIndex].value;
			myFtClient.add('list', listId, 'contained', 'content', contentId, {token: csrfToken})
				.then(detail => {
					updateAfterAddToList(detail.actorId, detail.subjectId, !!detail.results);
					overlay.close();
				});
		});
	}
}

function setUpCreateListListeners (overlay, contentId) {

	const createListButton = overlay.content.querySelector('.js-create-list');
	const nameInput = overlay.content.querySelector('.js-name');

	createListButton.addEventListener('click', event => {
		event.preventDefault();

		if (!nameInput.value) {
			const nameFormGroup = overlay.content.querySelector('.js-name-group');
			nameFormGroup.className += ' o-forms--error n-myft-ui__error--no-name';
			return;
		}

		const createListData = {
			token: csrfToken,
			name: nameInput.value
		};

		myFtClient.add('user', null, 'created', 'list', uuid(), createListData)
			.then(detail => {
				if (contentId) {
					return myFtClient.add('list', detail.subject, 'contained', 'content', contentId, {token: csrfToken});
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


function showListsOverlay (overlayTitle, formHtmlUrl, contentId) {
	myFtClient.personaliseUrl(formHtmlUrl)
		.then(url => fetch(url, {
			credentials: 'same-origin'
		}))
		.then(res => res.text())
		.then(html => openOverlay(html, { title: overlayTitle }))
		.then(overlay => {
			setUpSaveToExistingListListeners(overlay, contentId);
			setUpCreateListListeners(overlay, contentId);
		});

}

function showCopyToListOverlay (contentId, excludeList) {
	showListsOverlay('Copy to list', `/myft/list?fragment=true&copy=true&contentId=${contentId}&excludeList=${excludeList}`, contentId);
}

function showCreateListOverlay () {
	showListsOverlay('Create list', '/myft/list?fragment=true');
}

function showArticleSavedOverlay (contentId) {
	showListsOverlay('Article saved', `/myft/list?fragment=true&fromArticleSaved=true&contentId=${contentId}`, contentId);
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

function initialEventListeners () {

	document.body.addEventListener('myft.user.saved.content.add', event => {
		const contentId = event.detail.subject;
		handleArticleSaved(contentId);
	});

	delegate.on('click', '[data-myft-ui="copy-to-list"]', event => {
		event.preventDefault();
		showCopyToListOverlay(event.target.getAttribute('data-content-id'), event.target.getAttribute('data-actor-id'));
	});
	delegate.on('click', '[data-myft-ui="create-list"]', ev => {
		ev.preventDefault();
		showCreateListOverlay();
	});
}

export function init () {
	initialEventListeners();
}
