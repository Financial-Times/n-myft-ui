// !! this feature is for a short experiment only !!
import oExpander from 'o-expander';
import oDate from 'o-date';
import getUuidFromSession from './get-uuid-from-session';
import { fragments as teaserFragments } from '@financial-times/n-teaser';
import { json as fetchJson } from 'fetchres';
import slimQuery from './slim-query';
import templateExpander from './notification-expander.html';
import templateIcon from './notification-icon.html';

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

const setContainerClasses = (targetEl, targetPlace) => {
	targetEl.classList.add('myft-notification__container');
	targetEl.classList.add(`${targetPlace}__myft-notification__container`);
};

const insertNotificationIcon = (targetEl, targetPlace, withDot) => {
	setContainerClasses(targetEl, targetPlace);
	const notificationDiv = document.createElement('div');
	notificationDiv.setAttribute('class', `myft-notification ${targetPlace}__myft-notification`);
	notificationDiv.innerHTML = templateIcon({ withDot });
	targetEl.appendChild(notificationDiv);
};

const insertNotificationExpander = (targetEl, data, flags) => {
	const publishedDate = new Date(Date.parse(data.publishedDate));
	const publishedDateFormatted = oDate.format(publishedDate, 'd/M/yyyy');
	const notificationDiv = document.createElement('div');
	notificationDiv.setAttribute('class', 'o-expander');
	notificationDiv.setAttribute('data-o-component', 'o-expander');
	notificationDiv.setAttribute('data-o-expander-shrink-to', 'hidden');
	targetEl.appendChild(notificationDiv);
	notificationDiv.innerHTML = templateExpander({ items: data.articles, publishedDateFormatted, flags });
	notificationDiv.querySelector('.myft-notification__collapse').addEventListener('click', () => {
		notificationExapnder.collapse();
	});
	notificationExapnder = oExpander.init(notificationDiv, {
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

const deleteDot = () => {
	if (!hasExpand) {
		window.localStorage.setItem('timeUserClickedMyftNotification', Date.now());
		document.querySelectorAll('.myft-notification__icon').forEach(icon => {
			icon.classList.remove('myft-notification__icon--with-dot');
		});
		hasExpand = true;
	}
};

const addEventListenersToToggle = (notification) => {
	notification.querySelector('.myft-notification__icon').addEventListener('click', (e) => {
		if (notificationExapnder.isCollapsed()) {
			notificationExapnder.expand();
			e.path[1].appendChild(notificationExapnder.contentEl);
			deleteDot();
		} else {
			notificationExapnder.collapse();
		}
	});
};

let notificationExapnder;
let hasExpand = false;


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

			const stickyHeader = document.querySelector('.o-header--sticky');
			const stickyHeaderMyFtIconContainer = stickyHeader.querySelector('.o-header__top-column--right');
			if (stickyHeader && stickyHeaderMyFtIconContainer) {
				insertNotificationIcon(stickyHeaderMyFtIconContainer, 'sticky-header', withDot);
			}

			const ftHeaderMyFtIconContainer = document.querySelector('.o-header__top-wrapper .o-header__top-link--myft__container');
			if (ftHeaderMyFtIconContainer) {
				insertNotificationIcon(ftHeaderMyFtIconContainer, 'header', withDot);
			}

			const notifications = document.querySelectorAll('.myft-notification');
			if (notifications.length > 0) {
				insertNotificationExpander(notifications[0], data, flags);
				notifications.forEach(notification => {
					addEventListenersToToggle(notification);
				});

				// to synchronise expansion
				stickyHeader.addEventListener('oHeader.Sticky', (e) => {
					if (e.detail && e.detail.isActive) {
						stickyHeaderMyFtIconContainer.querySelector('.myft-notification').appendChild(notificationExapnder.contentEl);
					} else {
						ftHeaderMyFtIconContainer.querySelector('.myft-notification').appendChild(notificationExapnder.contentEl);
					}
				});
			}

		})
		.catch(() => {
			// logger.error('event=FOLLOWED_PROMISE_REJECTED ' + err.name);
			return;
		});
};
