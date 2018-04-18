import Tooltip from 'o-tooltip';

const myFtNotificationTooltipShowCount = 'myFtNotificationTooltipShowCount';

export default class NotificationTooltip {
	constructor (containerEl) {
		this.containerEl = containerEl;

		if (this.getShowCount() < 3) {
			this.incrementShowCount();
			this.show();
			this.listenForNotificationsOpening();
		}
	}

	getShowCount () {
		const count = Number(window.localStorage.getItem(myFtNotificationTooltipShowCount));

		return typeof count === 'number' ? count : 0;
	}

	incrementShowCount () {
		window.localStorage.setItem(myFtNotificationTooltipShowCount, this.getShowCount() + 1);
	}

	listenForNotificationsOpening () {
		this.containerEl.parentNode.addEventListener('oExpander.expand', () => {
			this.hide();
		});
	}

	show () {
		if (!this.tooltip) {
			this.tooltip = new Tooltip(this.containerEl, {
				target: 'myft-notification-tooltip',
				content: 'Click here for your daily digest.',
				showOnConstruction: true,
				position: 'below'
			});
		} else {
			this.tooltip.show();
		}
	}

	hide () {
		if (this.tooltip) {
			this.tooltip.close();
		}
	}
}
