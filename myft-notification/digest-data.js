import fetchDigestData from './fetch-digest-data';
import orderByUnreadFirst from './order-by-unread-first';

const notificationDismissTime = 'timeUserClickedMyftNotification';
const myftNotificationsEnabled = 'myftNotificationsEnabled';


export default class DigestData {
	constructor (uuid) {
		this.uuid = uuid;
	}

	fetch () {
		return fetchDigestData(this.uuid)
			.then(orderByUnreadFirst)
			.then(data => {
				this.data = data;
				return this.data;
			});
	}

	dismissNotification () {
		window.localStorage.setItem(notificationDismissTime, Date.now());
	}

	disableNotifications () {
		window.localStorage.setItem(myftNotificationsEnabled, 'false');
	}

	enableNotifications () {
		window.localStorage.removeItem(myftNotificationsEnabled);
	}

	hasNotifiableContent () {
		const notificationsEnabled = window.localStorage.getItem(myftNotificationsEnabled) !== 'false';
		const timeUserDismissed = window.localStorage.getItem(notificationDismissTime);
		const newContent = Date.parse(this.data.publishedDate) > Number(timeUserDismissed);

		return newContent && notificationsEnabled;
	}
}
