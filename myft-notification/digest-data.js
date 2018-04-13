import { json as fetchJson } from 'fetchres';
import { fragments as teaserFragments } from '@financial-times/n-teaser/main';
import slimQuery from './slim-query';

const notificationDismissTime = 'timeUserClickedMyftNotification';
const myftNotificationsEnabled = 'myftNotificationsEnabled';

const hasBeenRead = (targetArticle, readArticles) => readArticles.find(readArticle => readArticle.id === targetArticle.id);

const orderByUnreadFirst = ({ data = {} } = {}) => {
	const digestData = data.user.digest;
	const result = digestData;

	// reading history for past 7 days
	const articlesUserRead = data.user.articlesFromReadingHistory ? data.user.articlesFromReadingHistory.articles : [];
	if (articlesUserRead.length > 0) {
		const readArticles = [];
		const unreadArticles = [];
		digestData.articles.forEach(article => {
			hasBeenRead(article, articlesUserRead) ? readArticles.push(article) : unreadArticles.push(article);
		});
		result.articles = unreadArticles.concat(readArticles);
	}

	return result;
}

export default class DigestData {
	constructor (uuid) {
		this.uuid = uuid;
	}

	fetch () {
		const digestQuery = `
			${teaserFragments.teaserExtraLight}

			query MyFT($uuid: String!) {
					user(uuid: $uuid) {
						articlesFromReadingHistory {
							articles {
								...TeaserExtraLight
							}
						}
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
		const variables = { uuid: this.uuid };
		const url = `https://next-api.ft.com/v2/query?query=${slimQuery(digestQuery)}&variables=${JSON.stringify(variables)}&source=next-front-page-myft`;
		const options = { credentials: 'include', timeout: 5000 };

		return fetch(url, options)
			.then(fetchJson)
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
