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

const insertIcon = (targetEl, targetPlace, withDot) => {
	setContainerClasses(targetEl, targetPlace);
	const notificationDiv = document.createElement('div');
	notificationDiv.setAttribute('class', `myft-notification ${targetPlace}__myft-notification`);
	notificationDiv.innerHTML = templateIcon({ withDot });
	targetEl.appendChild(notificationDiv);
};

const insertExpander = (targetEl, data, flags) => {
	const publishedDate = new Date(Date.parse(data.publishedDate));
	const publishedDateFormatted = oDate.format(publishedDate, 'd/M/yyyy');
	const oExpanderDiv = document.createElement('div');
	oExpanderDiv.setAttribute('class', 'o-expander');
	oExpanderDiv.setAttribute('data-o-component', 'o-expander');
	oExpanderDiv.setAttribute('data-o-expander-shrink-to', 'hidden');
	targetEl.appendChild(oExpanderDiv);
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

const toggleExpansion = (notification) => {
	notification.querySelector('.myft-notification__icon').addEventListener('click', (e) => {
		if (notificationExpander.isCollapsed()) {
			notificationExpander.expand();
			e.path[1].appendChild(notificationExpander.contentEl);
			deleteDot();
		} else {
			notificationExpander.collapse();
		}
	});
};

const moveExpanderTo = (el) => el.querySelector('.myft-notification').appendChild(notificationExpander.contentEl);

const synchroniseExpansion = (stickyHeader, stickyHeaderMyFtIconContainer, ftHeaderMyFtIconContainer) => {
	stickyHeader.addEventListener('oHeader.Sticky', (e) => {
		if (e.detail && e.detail.isActive) {
			moveExpanderTo(stickyHeaderMyFtIconContainer);
		} else {
			moveExpanderTo(ftHeaderMyFtIconContainer);
		}
	});
};

let notificationExpander;
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
				insertIcon(stickyHeaderMyFtIconContainer, 'sticky-header', withDot);
			}

			const ftHeaderMyFtIconContainer = document.querySelector('.o-header__top-wrapper .o-header__top-link--myft__container');
			if (ftHeaderMyFtIconContainer) {
				insertIcon(ftHeaderMyFtIconContainer, 'header', withDot);
			}

			const notifications = document.querySelectorAll('.myft-notification');
			if (notifications.length > 0) {
				insertExpander(notifications[0], data, flags);
				notifications.forEach(notification => {
					toggleExpansion(notification);
				});
			}

			if (stickyHeaderMyFtIconContainer && ftHeaderMyFtIconContainer) {
				synchroniseExpansion(
					stickyHeader,
					stickyHeaderMyFtIconContainer,
					ftHeaderMyFtIconContainer
				);
			}

		})
		.catch(() => {
			// logger.error('event=FOLLOWED_PROMISE_REJECTED ' + err.name);
			return;
		});
};
