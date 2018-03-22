// !! this feature is for a short experiment only !!

import Tooltip from 'o-tooltip';
import getUuidFromSession from './get-uuid-from-session';
import { fragments as teaserFragments } from '@financial-times/n-teaser';
import { json as fetchJson } from 'fetchres';
import slimQuery from './slim-query';
import template from './notification.html';

const digestQuery = `
${teaserFragments.teaserExtraLight}
${teaserFragments.teaserLight}
${teaserFragments.teaserStandard}

query MyFT($uuid: String!) {
		user(uuid: $uuid) {
			digest {
				type
				publishedDate
				articles {
					...TeaserExtraLight
					...TeaserLight
					...TeaserStandard
				}
			}
		}
	}
`;

const insertMyFtNotification = (notification, data, withDot) => {
	const tooltipTarget = `${notification.place}__myft-notification-tooltip--target`;
	const tooltipElement = `${notification.place}__myft-notification-tooltip--element`;
	setNotification(notification.container, tooltipTarget, withDot);
	setTooltipElementDiv(notification.container, tooltipElement);
	new Tooltip(document.querySelector(`.${tooltipElement}`), {
		target: tooltipTarget,
		content: template({items: data.articles}),
		toggleOnClick: true,
		position: 'below'
	});
};

const setNotification = (container, tooltipTarget, withDot) => {
	const div = document.createElement('div');
	div.setAttribute('class', 'myft-notification__icon');
	if (withDot) {
		div.classList.add('myft-notification__icon--with-dot');
	}
	div.setAttribute('id', tooltipTarget);
	container.appendChild(div);
};

const setTooltipElementDiv = (container, tooltipEl) => {
	const div = document.createElement('div');
	div.setAttribute('class', tooltipEl);
	container.appendChild(div);
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


export default async () => {
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

			const myFtIconHeader = document.querySelector('.o-header__top-wrapper .o-header__top-link--myft__container');
			if (myFtIconHeader) {
				myFtIconHeader.classList.add('myft-notification__container--flex');
				notifications.push({ container: myFtIconHeader, place: 'header' });
			}

			if (notifications.length > 0) {
				notifications.forEach(notification => {
					insertMyFtNotification(notification, data, withDot);

					notification.container.querySelector('.o-tooltip').addEventListener('oTooltip.show', () => {
						window.localStorage.setItem('timeUserClickedMyftNotification', Date.now());
						document.querySelectorAll('.myft-notification__icon').forEach(icon => {
							icon.classList.remove('myft-notification__icon--with-dot');
						});
					});

					notification.container.querySelector('.myft-notification__button--mark-as-read').addEventListener('click', () => {
						notification.container.querySelector(`#${notification.place}__myft-notification-tooltip--target + .o-tooltip .o-tooltip-close`).click();
						window.localStorage.setItem('timeUserDismissedMyftNotification', Date.now());
						document.querySelectorAll('.myft-notification__icon').forEach(icon => {
							icon.classList.add('hidden');
						});
					});

				});
			}

		})
		.catch(() => {
			// logger.error('event=FOLLOWED_PROMISE_REJECTED ' + err.name);
			return;
		});
};
