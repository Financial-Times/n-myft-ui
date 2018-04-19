import fetchDigestData from './fetch-digest-data';
import divideUnreadRead from './divide-unread-read';

const notificationDismissTime = 'timeUserClickedMyftNotification';
const myftNotificationsEnabled = 'myftNotificationsEnabled';

const orderByUnreadFirst = (data) => {
	const digestData = data.user.digest;
	const result = digestData;

	// reading history for past 7 days
	const articlesUserRead = data.user.articlesFromReadingHistory ? data.user.articlesFromReadingHistory.articles : [];
	if (articlesUserRead.length > 0) {
		const digestDatadivided = divideUnreadRead(digestData, articlesUserRead);
		result.articles = digestDatadivided.unreadArticles.concat(digestDatadivided.readArticles);
	}

	return result;
};

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
