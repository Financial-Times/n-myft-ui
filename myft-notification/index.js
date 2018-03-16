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

const setNotificationDot = () => {
	const myFtIconContainer = document.querySelector('.o-header__top-link--myft__container');
	const notificationDot = document.createElement('div');
	notificationDot.setAttribute('class', 'o-header__top-link--myft__dot');
	notificationDot.setAttribute('id', 'myft-notification-tooltip-target');
	myFtIconContainer.appendChild(notificationDot);
};

const hasUserDismissedNotification = (data) => {
	const timeUserDismissed = window.localStorage.getItem('timeUserDismissed');
	if (!timeUserDismissed) {
		return false;
	}
	return Date.parse(data.publishedDate) < Number(timeUserDismissed);
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

			setNotificationDot();
			const tooltipEl = document.querySelector('.myft-notification-tooltip-element');
			if (!tooltipEl) {
				return;
			}

			new Tooltip(tooltipEl, {
				target: 'myft-notification-tooltip-target',
				content: template({items: data.articles}),
				showOnClick: true,
				position: 'below'
			});

			document.querySelector('.myft-notification__button--mark-as-read').addEventListener('click', () => {
				document.querySelector('.o-tooltip-close').click();
				window.localStorage.setItem('timeUserDismissed', Date.now());
				document.querySelector('.o-header__top-link--myft__dot').classList.add('hidden');
			});
		});
		// .catch(err => {
		// 	logger.error('event=FOLLOWED_PROMISE_REJECTED ' + err.name);
		// 	return [];
		// });
};
