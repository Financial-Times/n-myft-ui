// !! this feature is for a short experiment only !!
import oExpander from 'o-expander';
import oDate from 'o-date';
import getUuidFromSession from './get-uuid-from-session';
import { fragments as teaserFragments } from '@financial-times/n-teaser';
import { json as fetchJson } from 'fetchres';
import slimQuery from './slim-query';
import dispatchTrackingEvent from './tracking';
import templateExpander from './notification-expander.html';
import templateToggleButton from './notification-toggle-button.html';

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
	const options = { credentials: 'include', timeout: 5000 };

	return fetch(url, options)
		.then(fetchJson)
		.then(({ data = {} } = {}) => data.user.digest);
};

const openNotificationContent = (targetEl) => {
	moveExpanderTo(targetEl);
	notificationExpander.expand();
	deleteDot();
	dispatchTrackingEvent.digestOpened(document);
};

const closeNotificationContent = () => {
	notificationExpander.collapse();
	dispatchTrackingEvent.digestClosed(document);
};

const toggleExpander = (e) => {
	if (notificationExpander.isCollapsed()) {
		openNotificationContent(e.path[1]);
	} else {
		closeNotificationContent();
	}
};

const insertToggleButton = (targetEl, withDot) => {
	if (targetEl) {
		targetEl.classList.add('myft-notification__container');
		const toggleButtonContainer = document.createElement('div');
		toggleButtonContainer.setAttribute('class', 'myft-notification');
		toggleButtonContainer.innerHTML = templateToggleButton({ withDot });
		toggleButtonContainer.querySelector('.myft-notification__icon').addEventListener('click', toggleExpander);
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

	const digestArticleLinks = oExpanderDiv.querySelectorAll('.js-teaser-heading-link');
	digestArticleLinks.forEach(link => {
		link.addEventListener('click', () => {
			dispatchTrackingEvent.digestLinkClicked(document, link);
		});
	});

	oExpanderDiv.querySelector('.myft-notification__collapse').addEventListener('click', () => {
		notificationExpander.collapse();
		dispatchTrackingEvent.digestClosed(document);
	});

	oDate.init(oExpanderDiv);

	notificationExpander = oExpander.init(oExpanderDiv, {
		expandedToggleText: '',
		collapsedToggleText: ''
	});
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

const moveExpanderTo = (el) => el.appendChild(notificationExpander.contentEl);

let notificationExpander;
let hasExpand = false;

export default async (flags) => {
	const myFtIcon = document.querySelector('.o-header__top-link--myft');
	const userId = await getUuidFromSession();

	if (!myFtIcon || !userId) {
		return;
	}

	fetchDigestData(userId)
		.then(data => {
			// TODO add a function to set when user dismissed notification.
			// if (hasUserDismissedNotification(data)) {
			// 	return;
			// };

			createExpander(data, flags);
			const stickyHeader = document.querySelector('.o-header--sticky');
			const stickyHeaderMyFtIconContainer = stickyHeader.querySelector('.o-header__top-column--right');
			const ftHeaderMyFtIconContainer = document.querySelector('.o-header__top-wrapper .o-header__top-link--myft__container');
			const withDot = !hasUserClickedNotification(data);

			insertToggleButton(stickyHeaderMyFtIconContainer, withDot);
			insertToggleButton(ftHeaderMyFtIconContainer, withDot);

			if (stickyHeaderMyFtIconContainer && ftHeaderMyFtIconContainer) {
				stickyHeader.addEventListener('oHeader.Sticky', (e) => {
					const isSticky = e.detail && e.detail.isActive;
					const buttonContainer = isSticky ? stickyHeaderMyFtIconContainer : ftHeaderMyFtIconContainer;
					if (!notificationExpander.isCollapsed()) {
						moveExpanderTo(buttonContainer.querySelector('.myft-notification'));
					}
				});
			}

		})
		.catch(() => {
			// logger.error('event=FOLLOWED_PROMISE_REJECTED ' + err.name);
			return;
		});
};
