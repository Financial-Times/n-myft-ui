// !! this feature is for a short experiment only !!
import oExpander from 'o-expander';
import oDate from 'o-date';
import getUuidFromSession from './get-uuid-from-session';
import { fragments as teaserFragments } from '@financial-times/n-teaser';
import { json as fetchJson } from 'fetchres';
import slimQuery from './slim-query';
import template from './notification.html';
import synchronizeExpansion from './synchronise-expansion';

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

const insertMyFtNotification = ({notification, withDot, data, flags}) => {
	//to display notificaion expantion at the same position on header and sticky header
	//have to set Icon and Content in different place
	setNotificationIcon(notification, withDot);
	setNotificationContent(notification, data, flags);
	oDate.init(notification.contentContainer.querySelector('.myft-notification'));
};

const setNotificationIcon = (notification, withDot) => {
	const div = document.createElement('div');
	div.setAttribute('tabindex', '0');
	div.setAttribute('aria-label', 'My F T daily digest notification');
	div.setAttribute('class', 'myft-notification__icon');
	if (withDot) {
		div.classList.add('myft-notification__icon--with-dot');
	}
	notification.iconContainer.appendChild(div);
};

const setNotificationContent = (notification, data, flags) => {
	const publishedDate = new Date(Date.parse(data.publishedDate));
	const PublishedDateFormatted = oDate.format(publishedDate, 'd/M/yyyy');
	const div = document.createElement('div');
	div.setAttribute('class', `o-expander ${notification.className} myft-notification`);
	div.setAttribute('data-o-component', 'o-expander');
	notification.contentContainer.appendChild(div);
	const notificationDOM = notification.contentContainer.querySelector(`.${notification.className}`);
	notificationDOM.innerHTML = template({ items: data.articles, PublishedDateFormatted, flags});
	oExpander.init(notificationDOM, {
		expandedToggleText: '',
		collapsedToggleText: '',
		shrinkTo: 'hidden'
	});
};

// const hasUserDismissedNotification = (data) => {
// 	const timeUserDismissed = window.localStorage.getItem('timeUserDismissedMyftNotification');
// 	if (!timeUserDismissed) {
// 		return false;
// 	}
// 	return Date.parse(data.publishedDate) < Number(timeUserDismissed);
// };

const hasUserClickedNotification = (data) => {
	const timeUserClicked = window.localStorage.getItem('timeUserClickedMyftNotification');
	if (!timeUserClicked) {
		return false;
	}
	return Date.parse(data.publishedDate) < Number(timeUserClicked);
};

const toggleNotificationByKeypress = (e, notification) => {
	const key = e.keyCode;
	if (key === 13) {
		notification.contentContainer.querySelector('.myft-notification .o-expander__toggle').click();
	}
};

const addEventListenersToToggle = (notification) => {
	// for notification icon
	notification.iconContainer.querySelector('.myft-notification__icon').addEventListener('click', () => {
		notification.contentContainer.querySelector('.myft-notification .o-expander__toggle').click();
	});
	notification.iconContainer.querySelector('.myft-notification__icon').addEventListener('keypress', (e) => {
		toggleNotificationByKeypress(e, notification);
	});

	// for collapse icon
	notification.contentContainer.querySelector('.myft-notification__collapse').addEventListener('click', () => {
		notification.contentContainer.querySelector('.myft-notification .o-expander__toggle').click();
	});
	notification.contentContainer.querySelector('.myft-notification__collapse').addEventListener('keypress', (e) => {
		toggleNotificationByKeypress(e, notification);
	});
};

export default async (flags) => {
	const myFtIcon = document.querySelector('.o-header__top-link--myft');
	const userId = await getUuidFromSession();

	if (!myFtIcon || !userId) {
		return;
	}

	const variables = { uuid: userId };
	const url = `https://next-api.ft.com/v2/query?query=${slimQuery(digestQuery)}&variables=${JSON.stringify(variables)}&source=next-front-page-myft`;
	const option = { credentials: 'include', timeout: 5000 };

	return fetch(url, option)
		.then(fetchJson)
		.then(({ data = {} } = {}) => data.user.digest)
		.then(data => {

			// TODO add a function to set when user dismissed notification.
			// if (hasUserDismissedNotification(data)) {
			// 	return;
			// };

			let withDot = true;
			if (hasUserClickedNotification(data)) {
				withDot = false;
			}

			let notifications = [];

			const stickyHeader = document.querySelector('.o-header--sticky .o-header__row.o-header__top');
			const stickyHeaderMyFtIconContainer = document.querySelector('.o-header--sticky .o-header__top-column--right');
			if (stickyHeader && stickyHeaderMyFtIconContainer) {
				notifications.push({
					contentContainer: stickyHeader,
					iconContainer: stickyHeaderMyFtIconContainer,
					className: 'sticky-header__myft-notification'
				});
			}

			const ftHeader = document.querySelector('.o-header .o-header__row.o-header__top');
			const ftHeaderMyFtIconContainer = document.querySelector('.o-header__top-wrapper .o-header__top-link--myft__container');
			if (ftHeader && ftHeaderMyFtIconContainer) {
				ftHeaderMyFtIconContainer.classList.add('myft-notification__container--flex');
				notifications.push({
					contentContainer: ftHeader,
					iconContainer: ftHeaderMyFtIconContainer,
					className: 'header__myft-notification'
				});
			}

			if (notifications.length > 0) {
				notifications.forEach(notification => {
					insertMyFtNotification({ notification, withDot, data, flags });
					addEventListenersToToggle(notification);
					notification.contentContainer.querySelector('.o-expander').addEventListener('oExpander.expand', () => {
						window.localStorage.setItem('timeUserClickedMyftNotification', Date.now());
						document.querySelectorAll('.myft-notification__icon').forEach(icon => {
							icon.classList.remove('myft-notification__icon--with-dot');
						});
					});
				});
				synchronizeExpansion.init('myft-notification');
			}

		})
		.catch(() => {
			// logger.error('event=FOLLOWED_PROMISE_REJECTED ' + err.name);
			return;
		});
};
