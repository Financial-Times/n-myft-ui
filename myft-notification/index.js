// !! this feature is for a short experiment only !!
import oExpander from 'o-expander';
import oDate from 'o-date';
import getUuidFromSession from './get-uuid-from-session';
import { fragments as teaserFragments } from '@financial-times/n-teaser';
import { json as fetchJson } from 'fetchres';
import slimQuery from './slim-query';
import template from './notification.html';
import controlNotifications from './control-expand-collapse'

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

// const setDateSuffix = (i) => {
// 	const j = i % 10;
// 	if (j === 1) {
// 		return i + 'st';
// 	}
// 	if (j === 2) {
// 		return i + 'nd';
// 	}
// 	if (j === 3) {
// 		return i + 'rd';
// 	}
// 	return i + 'th';
// }

const insertMyFtNotification = (notification, data, withDot, flags) => {
	const publishedDate = new Date(Date.parse(data.publishedDate));
	const PublishedDateFormatted = `${publishedDate.getDate()}/${publishedDate.getMonth()+1}/${publishedDate.getFullYear()}`;
	const div = document.createElement('div');
	div.setAttribute('class', `o-expander ${notification.className} myft-notification`);
	div.setAttribute('data-o-component', 'o-expander');
	notification.container.appendChild(div);
	const notificationDOM = notification.container.querySelector(`.${notification.className}`);
	notificationDOM.innerHTML = template({ items: data.articles, PublishedDateFormatted, flags, withDot});
	oExpander.init(notificationDOM, {
		expandedToggleText: '',
		collapsedToggleText: '',
		shrinkTo: 'hidden'
	});
};

const hasUserDismissedNotification = (data) => {
	const timeUserDismissed = window.localStorage.getItem('timeUserDismissedMyftNotification');
	if (!timeUserDismissed) {
		return false;
	}
	return Date.parse(data.publishedDate) < Number(timeUserDismissed);
};

const hasUserClickedNotification = (data) => {
	const timeUserClicked = window.localStorage.getItem('timeUserClickedMyftNotification');
	if (!timeUserClicked) {
		return false;
	}
	return Date.parse(data.publishedDate) < Number(timeUserClicked);
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

			if (hasUserDismissedNotification(data)) {
				return;
			};

			let withDot = true;
			if (hasUserClickedNotification(data)) {
				withDot = false;
			}

			let notifications = [];

			const myFtIconStickyHeader = document.querySelector('.o-header--sticky .o-header__top-column--right');
			if (myFtIconStickyHeader) {
				notifications.push({ container: myFtIconStickyHeader, className: 'sticky-header__myft-notification' });
			}

			const myFtIconHeader = document.querySelector('.o-header__top-wrapper .o-header__top-link--myft__container');
			if (myFtIconHeader) {
				myFtIconHeader.classList.add('myft-notification__container--flex');
				notifications.push({ container: myFtIconHeader, className: 'header__myft-notification' });
			}

			if (notifications.length > 0) {
				notifications.forEach(notification => {

					insertMyFtNotification(notification, data, withDot, flags);
					oDate.init(notification.container.querySelector('.myft-notification'));
					controlNotifications.init();

					notification.container.querySelector('.o-expander').addEventListener('oExpander.expand', () => {
						window.localStorage.setItem('timeUserClickedMyftNotification', Date.now());
						document.querySelectorAll('.myft-notification__icon').forEach(icon => {
							icon.classList.remove('myft-notification__icon--with-dot');
						});
					});

					// notification.container.querySelector('.myft-notification__button--mark-as-read').addEventListener('click', () => {
					// 	notification.container.querySelector(`#${notification.place}__myft-notification-tooltip--target + .o-tooltip .o-tooltip-close`).click();
					// 	window.localStorage.setItem('timeUserDismissedMyftNotification', Date.now());
					// 	document.querySelectorAll('.myft-notification__icon').forEach(icon => {
					// 		icon.classList.add('hidden');
					// 	});
					// });

				});
			}

		})
		.catch(() => {
			// logger.error('event=FOLLOWED_PROMISE_REJECTED ' + err.name);
			return;
		});
};
