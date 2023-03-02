import Overlay from '@financial-times/o-overlay';
import myFtClient from 'next-myft-client';
import { uuid } from 'n-ui-foundations';
import getToken from './lib/get-csrf-token';
import isMobile from './lib/is-mobile';
import stringToHTMLElement from './lib/convert-string-to-html-element';

const csrfToken = getToken();

let lists = [];
let haveLoadedLists = false;
let createListOverlay;
let scrolledOnOpen;
let listOverlayBottom;

export default async function openSaveArticleToListVariant (contentId, options = {}) {
	const { name, modal = false } = options;

	function createList (newList, cb) {
		if(!newList || !newList.name) {
			return restoreContent();
		}

		myFtClient.add('user', null, 'created', 'list', uuid(), { name: newList.name,	token: csrfToken, isPublic: newList.isPublic })
			.then(detail => {
				myFtClient.add('list', detail.subject, 'contained', 'content', contentId, { token: csrfToken }).then((data) => {
					const createdList = { name: newList.name, uuid: data.actorId, checked: true, isPublic: !!newList.isPublic };
					lists.unshift(createdList);
					const announceListContainer = document.querySelector('.myft-ui-create-list-variant-announcement');
					announceListContainer.textContent = `${newList.name} created`;
					cb(contentId, createdList);
				});
			})
			.catch(() => {
				return restoreContent();
			});
	}

	function addToList (list, cb) {
		if(!list) {
			return;
		}

		myFtClient.add('list', list.uuid, 'contained', 'content', contentId, { token: csrfToken }).then((addedList) => {
			cb();
			triggerAddToListEvent(contentId, addedList.actorId);
		});
	}

	function removeFromList (list, cb) {
		if(!list) {
			return;
		}

		myFtClient.remove('list', list.uuid, 'contained', 'content', contentId, { token: csrfToken }).then((removedList) => {
			cb();
			triggerRemoveFromListEvent(contentId, removedList.actorId);
		});
	}

	function restoreContent () {
		if (!lists.length) attachDescription();
		refreshListElement();
		showListElement();
		return restoreFormHandler();
	}

	if (!haveLoadedLists) {
		lists = await getLists(contentId);
		haveLoadedLists = true;
	}

	const overlays = Overlay.getOverlays();
	const existingOverlay = overlays[name];
	if (existingOverlay) {
		existingOverlay.destroy();
	}

	const headingElement = HeadingElement();
	let [contentElement, removeDescription, attachDescription, restoreFormHandler] = ContentElement(!lists.length, openFormHandler);
	const [listElement, refreshListElement, hideListElement, showListElement] = ListsElement(lists, addToList, removeFromList);

	createListOverlay = new Overlay(name, {
		modal,
		html: contentElement,
		heading: { title: headingElement.outerHTML },
		parentnode: isMobile() ? '.o-share--horizontal' : '.o-share--vertical',
		class: 'myft-ui-create-list-variant',
	});

	function outsideClickHandler (e) {
		const overlayContent = document.querySelector('.o-overlay__content');
		const overlayContainer = document.querySelector('.o-overlay');
		// we don't want to close the overlay if the click happened inside the
		// overlay, except if the click happened on the overlay close button
		const isTargetInsideOverlay = overlayContainer.contains(e.target) && !e.target.classList.contains('o-overlay__close');
		if(createListOverlay.visible && (!overlayContent || !isTargetInsideOverlay)) {
			createListOverlay.close();
		}
	}

	function onFormCancel () {
		showListElement();
		restoreFormHandler();
	}

	function onFormListCreated () {
		refreshListElement();
		showListElement();
		restoreFormHandler();
	}

	function openFormHandler () {
		hideListElement();
		const formElement = FormElement(createList, attachDescription, onFormListCreated, onFormCancel, modal);
		const overlayContent = document.querySelector('.o-overlay__content');
		removeDescription();
		overlayContent.insertAdjacentElement('beforeend', formElement);
	}

	createListOverlay.open();
	scrolledOnOpen = window.scrollY;

	const scrollHandler = getScrollHandler(createListOverlay.wrapper);
	const resizeHandler = getResizeHandler(createListOverlay.wrapper);

	createListOverlay.wrapper.addEventListener('oOverlay.ready', (data) => {
		const overlayContent = document.querySelector('.o-overlay__content');
		overlayContent.insertAdjacentElement('afterbegin', listElement);
		if (!lists.length) {
			hideListElement();
		}

		if (!modal) {
			positionOverlay(data.currentTarget);

			window.addEventListener('oViewport.resize', resizeHandler);
			window.addEventListener('scroll', scrollHandler);
		}

		listOverlayBottom = document.querySelector('.myft-ui-create-list-variant').getBoundingClientRect().bottom;

		restoreFormHandler();

		document.body.addEventListener('click', outsideClickHandler);


	});

	createListOverlay.wrapper.addEventListener('oOverlay.destroy', () => {
		window.removeEventListener('scroll', scrollHandler);

		window.removeEventListener('oViewport.resize', resizeHandler);

		document.body.removeEventListener('click', outsideClickHandler);
	});
}

function getScrollHandler (target) {
	return realignOverlay(window.scrollY, target);
}

function getResizeHandler (target) {
	return function resizeHandler () {
		positionOverlay(target);
	};
}

function FormElement (createList, attachDescription, onListCreated, onCancel, modal=false) {
	const formString = `
	<form class="myft-ui-create-list-variant-form">
		<label class="myft-ui-create-list-variant-form-name o-forms-field">
			<span class="o-forms-input o-forms-input--text">
				<input class="myft-ui-create-list-variant-text" type="text" name="list-name">
				<div class="myft-ui-create-list-variant-label">List name</div>
			</span>
		</label>

		<div class="myft-ui-create-list-variant-form-public o-forms-field" role="group">
			<span class="o-forms-input o-forms-input--toggle">
				<label>
					<input class="myft-ui-create-list-variant-form-toggle" type="checkbox" name="is-public" value="public" checked data-trackable="private-link" text="private">
					<span class="myft-ui-create-list-variant-form-toggle-label o-forms-input__label">
						<span class="o-forms-input__label__main">
							Public
						</span>
						<span id="myft-ui-create-list-variant-form-public-description" class="o-forms-input__label__prompt">
							Your profession & list will be visible to others
						</span>
					</span>
				</label>
			</span>
		</div>

		<div class="myft-ui-create-list-variant-form-buttons">
			<button class="o-buttons o-buttons--primary o-buttons--inverse o-buttons--big" type="button" data-trackable="cancel-link" text="cancel">
			Cancel
			</button>
			<button class="o-buttons o-buttons--big o-buttons--secondary" type="submit">
			Add
			</button>
		</div>
	</form>
	`;

	const formElement = stringToHTMLElement(formString);

	function handleSubmit (event) {
		event.preventDefault();
		event.stopPropagation();
		const inputListName = formElement.querySelector('input[name="list-name"]');
		const inputIsPublic = formElement.querySelector('input[name="is-public"]');

		const newList = {
			name: inputListName.value,
			isPublic: inputIsPublic ? inputIsPublic.checked : false
		};

		createList(newList, ((contentId, createdList) => {
			triggerCreateListEvent(contentId, createdList.uuid);
			triggerAddToListEvent(contentId, createdList.uuid);
			if (!modal) {
				positionOverlay(createListOverlay.wrapper);
			}
			onListCreated();
		}));
		formElement.remove();
	}

	function handleCancelClick (event) {
		event.preventDefault();
		event.stopPropagation();
		formElement.remove();
		if (!lists.length) attachDescription();
		onCancel();
	}

	formElement.querySelector('button[type="submit"]').addEventListener('click', handleSubmit);
	formElement.querySelector('button[type="button"]').addEventListener('click', handleCancelClick);

	addPublicToggleListener(formElement);

	return formElement;
}

function addPublicToggleListener (formElement) {
	function onPublicToggleClick (event) {
		event.target.setAttribute('data-trackable', event.target.checked ? 'private-link' : 'public-link');
		event.target.setAttribute('text', event.target.checked ? 'private' : 'public');
	}

	formElement.querySelector('input[name="is-public"]').addEventListener('click', onPublicToggleClick);
}

function ContentElement (hasDescription, onClick) {
	const description = '<p class="myft-ui-create-list-variant-add-description">Lists are a simple way to curate your content</p>';

	const content = `
		<div class="myft-ui-create-list-variant-footer">
			<button class="myft-ui-create-list-variant-add myft-ui-create-list-variant-add-collapsed" aria-expanded=false data-trackable="add-to-new-list" text="add to new list">Add to a new list</button>
			${hasDescription ? `
			${description}
		` : ''}
			<span
			class="myft-ui-create-list-variant-announcement o-normalise-visually-hidden"
			role="region"
			aria-live="assertive"
			/>
		</div>
	`;

	const contentElement = stringToHTMLElement(content);

	contentElement.querySelector('.myft-ui-create-list-variant-add').addEventListener('click', checkScrollToAdd);
	contentElement.querySelector('.myft-ui-create-list-variant-add').addEventListener('click', triggerAddToNewListEvent);

	function removeDescription () {
		const descriptionElement = contentElement.querySelector('.myft-ui-create-list-variant-add-description');
		if (descriptionElement) {
			descriptionElement.remove();
		}
	}

	function attachDescription () {
		const descriptionElement = stringToHTMLElement(description);
		contentElement.insertAdjacentElement('beforeend', descriptionElement);
	}

	function restoreFormHandler () {
		contentElement.querySelector('.myft-ui-create-list-variant-add').classList.add('myft-ui-create-list-variant-add-collapsed');
		contentElement.querySelector('.myft-ui-create-list-variant-add').setAttribute('aria-expanded', false);
		return contentElement.addEventListener('click', clickHandler, { once: true });
	}

	function clickHandler (event) {
		contentElement.querySelector('.myft-ui-create-list-variant-add').classList.remove('myft-ui-create-list-variant-add-collapsed');
		contentElement.querySelector('.myft-ui-create-list-variant-add').setAttribute('aria-expanded', true);
		onClick(event);
	}

	return [contentElement, removeDescription, attachDescription, restoreFormHandler];
}

function HeadingElement () {
	const heading = `
		<span class="myft-ui-create-list-variant-heading">Added to <a href="https://www.ft.com/myft/saved-articles" data-trackable="saved-articles">saved articles</a> in <span class="myft-ui-create-list-variant-icon"><span class="myft-ui-create-list-variant-icon-visually-hidden">my FT</span></span></span>
		`;

	return stringToHTMLElement(heading);
}

function ListsElement (lists, addToList, removeFromList) {
	const currentList = document.querySelector('.myft-ui-create-list-variant-lists');
	if (currentList) {
		currentList.remove();
	}

	const listCheckboxElement = ListCheckboxElement(addToList, removeFromList);

	const listsTemplate = `
	<div class="myft-ui-create-list-variant-lists o-forms-field o-forms-field--optional" role="group">
		<span class="myft-ui-create-list-variant-lists-text">Add to list</span>
		<span class="myft-ui-create-list-variant-lists-container o-forms-input o-forms-input--checkbox">
		</span>
	</div>
	`;
	const listsElement = stringToHTMLElement(listsTemplate);

	const listsElementContainer = listsElement.querySelector('.myft-ui-create-list-variant-lists-container');

	function refresh () {
		listsElementContainer.replaceChildren(...lists.map(list => listCheckboxElement(list)));
	}

	function hide () {
		listsElement.style.display = 'none';
	}

	function show () {
		listsElement.style.display = 'flex';
	}

	refresh();

	return [listsElement, refresh, hide, show];
}

function ListCheckboxElement (addToList, removeFromList) {
	return function (list) {

		const listCheckbox = `<label>
		<input type="checkbox" name="default" value="${list.uuid}" ${list.checked ? 'checked' : ''}>
		<span class="o-forms-input__label">
			<span class="o-normalise-visually-hidden">
			${list.checked ? 'Remove article from ' : 'Add article to ' }
			</span>
			${list.name}
		</span>
	</label>
	`;

		const listCheckboxElement = stringToHTMLElement(listCheckbox);

		const [ input ] = listCheckboxElement.children;

		function handleCheck (event) {
			event.preventDefault();
			const isChecked = event.target.checked;

			function onListUpdated () {
				const indexToUpdate = lists.indexOf(list);
				lists[indexToUpdate] = { ...lists[indexToUpdate], checked: isChecked };
				listCheckboxElement.querySelector('input').checked = isChecked;
			}

			return isChecked ? addToList(list, onListUpdated) : removeFromList(list, onListUpdated);
		}

		input.addEventListener('click', handleCheck);

		return listCheckboxElement;
	};
}

function realignOverlay (originalScrollPosition, target) {
	return function () {
		const currentScrollPosition = window.scrollY;

		if(Math.abs(currentScrollPosition - originalScrollPosition) < 120) {
			return;
		}

		if (currentScrollPosition) {
			originalScrollPosition = currentScrollPosition;;
		}

		positionOverlay(target);
	};
}

function positionOverlay (target) {
	target.style['min-width'] = '340px';
	target.style['width'] = '100%';
	target.style['margin-top'] = 0;
	target.style['left'] = 0;
	target.style['top'] = 0;

	if (isMobile()) {
		const shareNavComponent = document.querySelector('.share-nav__horizontal');
		const topHalfOffset = target.clientHeight + 10;
		target.style['position'] = 'absolute';
		target.style['margin-left'] = 0;
		target.style['top'] = calculateLargerScreenHalf(shareNavComponent) === 'ABOVE' ? `-${topHalfOffset}px` : '50px';
	} else {
		target.style['position'] = 'absolute';
		target.style['margin-left'] = '45px';
	}
}

function calculateLargerScreenHalf (target) {
	if (!target) {
		return 'BELOW';
	}

	const vh = Math.min(document.documentElement.clientHeight || 0, window.innerHeight || 0);

	const targetBox = target.getBoundingClientRect();
	const spaceAbove = targetBox.top;
	const spaceBelow = vh - targetBox.bottom;

	return spaceBelow < spaceAbove ? 'ABOVE' : 'BELOW';
}

async function getLists (contentId) {
	return myFtClient.getListsContent()
		.then(results => results.items.map(list => {
			const isChecked = Array.isArray(list.content) && list.content.some(content => content.uuid === contentId);
			return { name: list.name, uuid: list.uuid, checked: isChecked, content: list.content, isPublic: list.isPublic };
		}));
}

function triggerAddToListEvent (contentId, listId) {
	return document.body.dispatchEvent(new CustomEvent('oTracking.event', {
		detail: {
			category: 'list',
			action: 'add-success',
			article_id: contentId,
			list_id: listId,
			teamName: 'customer-products-us-growth',
			amplitudeExploratory: true
		},
		bubbles: true
	}));
}

function triggerRemoveFromListEvent (contentId, listId) {
	return document.body.dispatchEvent(new CustomEvent('oTracking.event', {
		detail: {
			category: 'list',
			action: 'remove-success',
			article_id: contentId,
			list_id: listId,
			teamName: 'customer-products-us-growth',
			amplitudeExploratory: true
		},
		bubbles: true
	}));
}

function triggerCreateListEvent (contentId, listId) {
	document.body.dispatchEvent(new CustomEvent('oTracking.event', {
		detail: {
			category: 'list',
			action: 'create-success',
			article_id: contentId,
			list_id: listId,
			teamName: 'customer-products-us-growth',
			amplitudeExploratory: true
		},
		bubbles: true
	}));
}

// Temporary event on the public toggle feature.
// These will be used to build a sanity check dashboard, and will be removed after we get clean-up this test.
function triggerAddToNewListEvent () {
	document.body.dispatchEvent(new CustomEvent('oTracking.event', {
		detail: {
			category: 'publicToggle',
			action: 'addToNewList',
			teamName: 'customer-products-us-growth',
			amplitudeExploratory: true
		},
		bubbles: true
	}));
}

//Temporary event to determine whether users need to scroll to add to a list
function checkScrollToAdd () {
	//if the bottom of the overlay was not showing and scrolling has occurred since it was opened
	if(listOverlayBottom > window.innerHeight && window.scrollY > scrolledOnOpen) {
		document.body.dispatchEvent(new CustomEvent('oTracking.event', {
			detail: {
				category: 'publicToggle',
				action: 'scrollToAdd',
				teamName: 'customer-products-us-growth',
				amplitudeExploratory: true
			},
			bubbles: true
		}));
	}
}
