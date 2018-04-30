import Tooltip from 'o-tooltip';
import dispatchTrackingEvent from './tracking';

const countStorageKey = 'myFtNotificationTooltipShowCount';

const getDateToday = () => new Date().toISOString().substring(0, 10);

export default class NotificationProductAnnouncer {
	constructor (containerEl, digestFrequency = 'daily', clickHandler) {
		this.containerEl = containerEl;
		this.digestFrequency = digestFrequency;
		this.clickHandler = clickHandler;

		if (this.getShowCount() < 3) {
			this.incrementShowCount();
			this.show();
			this.listenForNotificationsOpening();
		}
	}

	getShowCount () {
		const storedValue = window.localStorage.getItem(countStorageKey);

		if (!storedValue) {
			return 0;
		}

		const dateToday = getDateToday();
		const [ countStr = 0, date = dateToday ] = storedValue.split('|');
		const count = Number(countStr);

		if (date !== dateToday || Number.isNaN(count)) {
			return 0;
		}

		return count;
	}

	incrementShowCount () {
		window.localStorage.setItem(countStorageKey, `${this.getShowCount() + 1}|${getDateToday()}`);
	}

	listenForNotificationsOpening () {
		this.containerEl.parentNode.addEventListener('oExpander.expand', () => {
			this.hide();
		});
	}

	getDigestFrequency () {
		return this.digestFrequency === 'daily' ? 'daily' : 'weekly';
	}

	show () {
		if (!this.tooltip) {
			this.tooltip = new Tooltip(this.containerEl, {
				target: 'myft-notification-tooltip',
				content: `Click the <span class="myft-notification-tooltip__icon">bell</span> for your ${this.getDigestFrequency()} digest.`,
				showOnConstruction: true,
				position: 'below'
			});
			if (this.clickHandler) {
				this.tooltip.tooltipEl.querySelector('.o-tooltip-content').addEventListener('click', this.clickHandler);
			}
			this.tooltip.tooltipEl.querySelector('.o-tooltip-close').addEventListener('click', () => {
				dispatchTrackingEvent.tooltipClosed(document);
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
