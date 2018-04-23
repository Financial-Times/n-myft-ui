import fetchDigestData from './fetch-digest-data';

const notificationDismissTime = 'timeUserClickedMyftNotification';
const myftNotificationsEnabled = 'myftNotificationsEnabled';

export default class DigestData {
	constructor (uuid) {
		this.uuid = uuid;
	}

	fetch () {
		return fetchDigestData(this.uuid)
			.then(data => {
				this.data = data.user.digest;
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
