// !! this feature is for a short experiment only !!
import oExpander from 'o-expander';
import oDate from 'o-date';
import getUuidFromSession from './get-uuid-from-session';
import Feedback from '../components/feedback';
import DigestData from './digest-data';
import NotificationProductAnnouncer from './notification-product-announcer';
import dispatchTrackingEvent from './tracking';
import templateExpander from './notification-expander.html';
import templateToggleButton from './notification-toggle-button.html';

const openNotificationContent = (targetEl) => {
	moveNotificationContentTo(targetEl);
	targetEl.classList.remove('myft-notification--animate');
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

const insertToggleButton = (targetEl, { withNotification, animate, digestFrequency }) => {
	if (targetEl) {
		targetEl.classList.add('myft-notification__container');
		const toggleButtonContainer = document.createElement('div');

		toggleButtonContainer.classList.add('myft-notification');
		toggleButtonContainer.classList.toggle('myft-notification--animate', animate);
		toggleButtonContainer.innerHTML = templateToggleButton({ withNotification, digestFrequency });
		toggleButtonContainer.querySelector('.myft-notification__icon').addEventListener('click', toggleNotificationContent);

		targetEl.appendChild(toggleButtonContainer);
	}
};

const createNotificationContent = (data, { digestFrequency }) => {
	const publishedDate = new Date(Date.parse(data.publishedDate));
	const publishedDateFormatted = oDate.format(publishedDate, 'd/M/yyyy');
	const oExpanderDiv = document.createElement('div');
	oExpanderDiv.setAttribute('class', 'o-expander');
	oExpanderDiv.setAttribute('data-o-component', 'o-expander');
	oExpanderDiv.setAttribute('data-o-expander-shrink-to', 'hidden');
	oExpanderDiv.innerHTML = templateExpander({ items: data.articles, digestFrequency, publishedDateFormatted });

	const digestArticleLinks = [...oExpanderDiv.querySelectorAll('.js-teaser-heading-link')];
	digestArticleLinks.forEach(link => {
		link.addEventListener('click', () => {
			dispatchTrackingEvent.digestLinkClicked(document, link);
		});
	});

	oExpanderDiv.querySelector('.myft-notification__collapse').addEventListener('click', closeNotificationContent);
	oDate.init(oExpanderDiv);

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

	return oExpanderDiv;
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

const orderArticlesByUnreadFirst = data => {
	data.articles.sort((a, b) => {
		return (a.hasBeenRead && b.hasBeenRead) ? 0 : a.hasBeenRead ? 1 : -1;
	});

	return data;
};

let digestData;
let notificationContentExpander;

export default async (flags = {}, { animate = false, enableAnnouncer = false }) => {
	const myFtIcon = document.querySelector('.o-header__top-link--myft');
	const userId = await getUuidFromSession();

	if (!myFtIcon || !userId) {
		return;
	}

	digestData = new DigestData(userId);
	digestData.fetch()
		.then(orderArticlesByUnreadFirst)
		.then(data => {
			const digestFrequency = data.type === 'daily' ? 'Daily' : 'Weekly';
			const expanderDiv = createNotificationContent(data, { digestFrequency });
			const stickyHeader = document.querySelector('.o-header--sticky');
			const stickyHeaderMyFtIconContainer = stickyHeader.querySelector('.o-header__top-column--right');
			const ftHeaderMyFtIconContainer = document.querySelector('.o-header__top-wrapper .o-header__top-link--myft__container');
			const toggleButtonOptions = {
				withNotification: digestData.hasNotifiableContent(),
				animate,
				digestFrequency
			};

			insertToggleButton(stickyHeaderMyFtIconContainer, toggleButtonOptions);
			insertToggleButton(ftHeaderMyFtIconContainer, toggleButtonOptions);

			// Must append div to DOM before constructing the oExpander, in order for expander events to bubble
			ftHeaderMyFtIconContainer.querySelector('.myft-notification').appendChild(expanderDiv);
			notificationContentExpander = oExpander.init(expanderDiv, {
				expandedToggleText: '',
				collapsedToggleText: ''
			});

			dispatchTrackingEvent.digestRendered(document);

			if (stickyHeaderMyFtIconContainer && ftHeaderMyFtIconContainer) {
				stickyHeader.addEventListener('oHeader.Sticky', (e) => {
					const isSticky = e.detail && e.detail.isActive;
					const buttonContainer = isSticky ? stickyHeaderMyFtIconContainer : ftHeaderMyFtIconContainer;
					if (!notificationContentExpander.isCollapsed()) {
						moveNotificationContentTo(buttonContainer.querySelector('.myft-notification'));
					}
				});
			}

			if (toggleButtonOptions.withNotification && enableAnnouncer) {
				const toggleButton = ftHeaderMyFtIconContainer.querySelector('.myft-notification__icon');
				const expanderContainer = ftHeaderMyFtIconContainer.querySelector('.myft-notification');

				new NotificationProductAnnouncer(toggleButton, data.type, () => openNotificationContent(expanderContainer));
			}
		})
		.catch(err => {
			throw err;
		});
};
