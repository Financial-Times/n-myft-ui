// !! this feature is for a short experiment only !!
import oExpander from 'o-expander';
import oDate from 'o-date';
import getUuidFromSession from './get-uuid-from-session';
import Feedback from '../components/feedback';
import DigestData from './digest-data';
import dispatchTrackingEvent from './tracking';
import templateExpander from './notification-expander.html';
import templateToggleButton from './notification-toggle-button.html';

const openNotificationContent = (targetEl) => {
	moveNotificationContentTo(targetEl);
	notificationContentExpander.expand();
	dismissNotification();
	dispatchTrackingEvent.digestOpened(document);
};

const closeNotificationContent = () => {
	notificationContentExpander.collapse();
	dispatchTrackingEvent.digestClosed(document);
};

const toggleNotificationContent = (e) => {
	if (notificationContentExpander.isCollapsed()) {
		openNotificationContent(e.target.parentNode);
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
		toggleButtonContainer.querySelector('.myft-notification__icon').addEventListener('click', toggleNotificationContent);
		targetEl.appendChild(toggleButtonContainer);
	}
};

const createNotificationContent = (data, flags) => {
	const publishedDate = new Date(Date.parse(data.publishedDate));
	const publishedDateFormatted = oDate.format(publishedDate, 'd/M/yyyy');
	const oExpanderDiv = document.createElement('div');
	oExpanderDiv.setAttribute('class', 'o-expander');
	oExpanderDiv.setAttribute('data-o-component', 'o-expander');
	oExpanderDiv.setAttribute('data-o-expander-shrink-to', 'hidden');
	oExpanderDiv.innerHTML = templateExpander({ items: data.articles, publishedDateFormatted, flags });

	const digestArticleLinks = [...oExpanderDiv.querySelectorAll('.js-teaser-heading-link')];
	digestArticleLinks.forEach(link => {
		link.addEventListener('click', () => {
			dispatchTrackingEvent.digestLinkClicked(document, link);
		});
	});

	oExpanderDiv.querySelector('.myft-notification__collapse').addEventListener('click', closeNotificationContent);

	oDate.init(oExpanderDiv);

	notificationContentExpander = oExpander.init(oExpanderDiv, {
		expandedToggleText: '',
		collapsedToggleText: ''
	});
	const feedbackEl = oExpanderDiv.querySelector('.myft-notification__feedback');
	if (feedbackEl) {
		new Feedback(feedbackEl, {
			onRespond: (response) => {
				if (response.answer === 'negative') {
					digestData.disableNotifications();
				} else {
					digestData.enableNotifications();
				}
			}
		});
	}
};

const dismissNotification = () => {
	if (digestData.hasNotifiableContent()) {
		digestData.dismissNotification();
		const notificationIcons = [...document.querySelectorAll('.myft-notification__icon')];
		notificationIcons.forEach(icon => {
			icon.classList.remove('myft-notification__icon--with-dot');
		});
	}
};

const moveNotificationContentTo = (el) => el.appendChild(notificationContentExpander.contentEl);

let digestData;
let notificationContentExpander;

export default async (flags) => {
	const myFtIcon = document.querySelector('.o-header__top-link--myft');
	const userId = await getUuidFromSession();

	if (!myFtIcon || !userId) {
		return;
	}

	digestData = new DigestData(userId);
	digestData.fetch()
		.then(data => {
			createNotificationContent(data, flags);
			const stickyHeader = document.querySelector('.o-header--sticky');
			const stickyHeaderMyFtIconContainer = stickyHeader.querySelector('.o-header__top-column--right');
			const ftHeaderMyFtIconContainer = document.querySelector('.o-header__top-wrapper .o-header__top-link--myft__container');
			const showNotification = digestData.hasNotifiableContent();

			insertToggleButton(stickyHeaderMyFtIconContainer, showNotification);
			insertToggleButton(ftHeaderMyFtIconContainer, showNotification);

			if (stickyHeaderMyFtIconContainer && ftHeaderMyFtIconContainer) {
				stickyHeader.addEventListener('oHeader.Sticky', (e) => {
					const isSticky = e.detail && e.detail.isActive;
					const buttonContainer = isSticky ? stickyHeaderMyFtIconContainer : ftHeaderMyFtIconContainer;
					if (!notificationContentExpander.isCollapsed()) {
						moveNotificationContentTo(buttonContainer.querySelector('.myft-notification'));
					}
				});
			}

		})
		.catch(() => {
			// logger.error('event=FOLLOWED_PROMISE_REJECTED ' + err.name);
			return;
		});
};
