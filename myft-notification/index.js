// !! this feature is for a short experiment only !!
import oExpander from 'o-expander';
import oDate from 'o-date';
import getUuidFromSession from './get-uuid-from-session';
import { fragments as teaserFragments } from '@financial-times/n-teaser';
import { json as fetchJson } from 'fetchres';
import slimQuery from './slim-query';
import templateExpander from './notification-expander.html';
import templateToggleButton from './notification-icon.html';

const fetchDigestData = (uuid) => {
	const digestQuery = `
		${teaserFragments.teaserExtraLight}

		query MyFT($uuid: String!) {
				user(uuid: $uuid) {
					digest {
						type
						publishedDate
						articles {
							...TeaserExtraLight
						}
					}
				}
			}
	`;
	const variables = { uuid };
	const url = `https://next-api.ft.com/v2/query?query=${slimQuery(digestQuery)}&variables=${JSON.stringify(variables)}&source=next-front-page-myft`;
	const option = { credentials: 'include', timeout: 5000 };

	return fetch(url, option)
		.then(fetchJson)
		.then(({ data = {} } = {}) => data.user.digest);
};

const insertToggleButton = (targetEl, withDot) => {
	if (targetEl) {
		targetEl.classList.add('myft-notification__container');
		const toggleButtonContainer = document.createElement('div');
		toggleButtonContainer.setAttribute('class', 'myft-notification');
		toggleButtonContainer.innerHTML = templateToggleButton({ withDot });
		toggleButtonContainer.querySelector('.myft-notification__icon').addEventListener('click', toggleHandler);
		targetEl.appendChild(toggleButtonContainer);
	}
};

const createExpander = (data, flags) => {
	const publishedDate = new Date(Date.parse(data.publishedDate));
	const publishedDateFormatted = oDate.format(publishedDate, 'd/M/yyyy');
	const oExpanderDiv = document.createElement('div');
	oExpanderDiv.setAttribute('class', 'o-expander');
	oExpanderDiv.setAttribute('data-o-component', 'o-expander');
	oExpanderDiv.setAttribute('data-o-expander-shrink-to', 'hidden');
	oExpanderDiv.innerHTML = templateExpander({ items: data.articles, publishedDateFormatted, flags });

	notificationExpander = oExpander.init(oExpanderDiv, {
		expandedToggleText: '',
		collapsedToggleText: ''
	});

	oExpanderDiv.querySelector('.myft-notification__collapse').addEventListener('click', () => {
		notificationExpander.collapse();
	});
	oDate.init(oExpanderDiv);
};

// const hasUserDismissedNotification = (data) => {
// 	const timeUserDismissed = window.localStorage.getItem('timeUserDismissedMyftNotification');
// 	if (!timeUserDismissed) {
// 		return false;
// 	}
// 	return Date.parse(data.publishedDate) < Number(timeUserDismissed);
// };

const localStorageKey = 'timeUserClickedMyftNotification';

const hasUserClickedNotification = (data) => {
	const timeUserClicked = window.localStorage.getItem(localStorageKey);
	if (!timeUserClicked) {
		return false;
	}
	return Date.parse(data.publishedDate) < Number(timeUserClicked);
};

const deleteDot = () => {
	if (!hasExpand) {
		window.localStorage.setItem(localStorageKey, Date.now());
		document.querySelectorAll('.myft-notification__icon').forEach(icon => {
			icon.classList.remove('myft-notification__icon--with-dot');
		});
		hasExpand = true;
	}
};

const toggleHandler = (e) => {
	if (notificationExpander.isCollapsed()) {
		notificationExpander.expand();
		moveExpanderTo(e.path[1]);
		deleteDot();
	} else {
		notificationExpander.collapse();
	}
};

const moveExpanderTo = (el) => el.appendChild(notificationExpander.contentEl);

let notificationExpander;
let hasExpand = false;

export default async (flags) => {
	const myFtIcon = document.querySelector('.o-header__top-link--myft');
	const userId = await getUuidFromSession();

	if (!myFtIcon || !userId) {
		return;
	}

	return fetchDigestData(userId)
		.then(data => {
			// TODO add a function to set when user dismissed notification.
			// if (hasUserDismissedNotification(data)) {
			// 	return;
			// };

			let withDot = true;
			if (hasUserClickedNotification(data)) {
				withDot = false;
			}

			createExpander(data, flags);
			const stickyHeader = document.querySelector('.o-header--sticky');
			const toggleButtonContainerSticky = stickyHeader.querySelector('.o-header__top-column--right');
			const toggleButtonContainerNonSticky = document.querySelector('.o-header__top-wrapper .o-header__top-link--myft__container');

			insertToggleButton(toggleButtonContainerSticky, withDot);
			insertToggleButton(toggleButtonContainerNonSticky, withDot);

			if (toggleButtonContainerSticky && toggleButtonContainerNonSticky) {
				stickyHeader.addEventListener('oHeader.Sticky', (e) => {
					const isSticky = e.detail && e.detail.isActive;
					const buttonContainer = isSticky ? toggleButtonContainerSticky : toggleButtonContainerNonSticky;

					moveExpanderTo(buttonContainer.querySelector('.myft-notification'));
				});
			}

		})
		.catch(() => {
			// logger.error('event=FOLLOWED_PROMISE_REJECTED ' + err.name);
			return;
		});
};
