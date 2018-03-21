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

const insertMyFtNotification = (myFtIconContainer, tooltipTarget, tooltipEl) => {
	setNotificationDot(myFtIconContainer, tooltipTarget);
	setTooltipElementDiv(myFtIconContainer, tooltipEl);
};

const setNotificationDot = (container, tooltipTarget) => {
	const div = document.createElement('div');
	div.setAttribute('class', 'o-header__top-link--myft__dot');
	div.setAttribute('id', tooltipTarget);
	container.appendChild(div);
};

const setTooltipElementDiv = (container, tooltipEl) => {
	const div = document.createElement('div');
	div.setAttribute('class', tooltipEl);
	container.appendChild(div);
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

			const myFtIconContainer = document.querySelector('.o-header__top-link--myft__container');
			const tooltipTarget = 'myft-notification-tooltip-target';
			const tooltipEl = 'myft-notification-tooltip-element';
			insertMyFtNotification(myFtIconContainer, tooltipTarget, tooltipEl);

			new Tooltip(document.querySelector(`.${tooltipEl}`), {
				target: tooltipTarget,
				content: template({items: data.articles}),
				showOnClick: true,
				position: 'below'
			});

			myFtIconContainer.querySelector('.myft-notification__button--mark-as-read').addEventListener('click', () => {
				myFtIconContainer.querySelector('#myft-notification-tooltip-target + .o-tooltip .o-tooltip-close').click();
				window.localStorage.setItem('timeUserDismissed', Date.now());
				myFtIconContainer.querySelector('.o-header__top-link--myft__dot').classList.add('hidden');
			});
		});
		// .catch(err => {
		// 	logger.error('event=FOLLOWED_PROMISE_REJECTED ' + err.name);
		// 	return [];
		// });
};
