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
	const publishedDate = new Date(Date.parse(data.publishedDate));
	const publishedDateFormatted = oDate.format(publishedDate, 'd/M/yyyy');
	const notificationDiv = document.createElement('div');
	notificationDiv.setAttribute('class', `o-expander myft-notification ${notification.className}`);
	notificationDiv.setAttribute('data-o-component', 'o-expander');
	notificationDiv.setAttribute('data-o-expander-shrink-to', 'hidden');
	notification.container.appendChild(notificationDiv);
	notificationDiv.innerHTML = template({ items: data.articles, publishedDateFormatted, flags, withDot});
	oExpander.init(notificationDiv, {
		expandedToggleText: '',
		collapsedToggleText: ''
	});
	oDate.init(notificationDiv);
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
		notification.container.querySelector('.myft-notification .o-expander__toggle').click();
	}
};

const addEventListenersToToggle = (notification) => {
	// for notification icon
	notification.container.querySelector('.myft-notification__icon').addEventListener('keypress', (e) => {
		toggleNotificationByKeypress(e, notification);
	});

	// for collapse icon
	notification.container.querySelector('.myft-notification__collapse').addEventListener('click', () => {
		notification.container.querySelector('.myft-notification .o-expander__toggle').click();
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

			const stickyHeaderMyFtIconContainer = document.querySelector('.o-header--sticky .o-header__top-column--right');
			if (stickyHeaderMyFtIconContainer) {
				notifications.push({
					container: stickyHeaderMyFtIconContainer,
					className: 'sticky-header__myft-notification'
				});
			}

			const ftHeaderMyFtIconContainer = document.querySelector('.o-header__top-wrapper .o-header__top-link--myft__container');
			if (ftHeaderMyFtIconContainer) {
				notifications.push({
					container: ftHeaderMyFtIconContainer,
					className: 'header__myft-notification'
				});
			}

			if (notifications.length > 0) {
				notifications.forEach(notification => {
					notification.container.classList.add('myft-notification__container');
					notification.container.classList.add(`${notification.className}__container`);
					insertMyFtNotification({ notification, withDot, data, flags });
					addEventListenersToToggle(notification);
					notification.container.querySelector('.o-expander').addEventListener('oExpander.expand', () => {
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
