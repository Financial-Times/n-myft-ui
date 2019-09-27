import sessionClient from 'next-session-client';
import {json as fetchJson} from 'fetchres';
import {isAfter} from 'date-fns';
import squashWhitespace from './lib/squash-whitespace';

const fetchContentFromPersonalisedFeed = uuid => {
	if (!uuid) {
		return Promise.resolve([]);
	}

	const url = `/__myft/api/onsite/feed/${uuid}?originatingSignals=followed&from=-24h&source=myft-ui`;
	const options = {credentials: 'include'};

	return fetch(url, options)
		.then(fetchJson)
		.then(body => body.results);
};

// read state in articlesFromReadingHistory will be delayed by up to ~1 minute
const fetchReadingHistory = uuid => {
	if (!uuid) {
		return Promise.resolve([]);
	}

	const gqlQuery = `
		query newMyFTContentSince($uuid: String!) {
			user(uuid: $uuid) {
				articlesFromReadingHistory {
					articles {
						id
					}
				}
			}
		}
		`;
	const variables = {uuid};
	const url = `https://next-api.ft.com/v2/query?query=${squashWhitespace(gqlQuery)}&variables=${JSON.stringify(variables)}&source=next-myft`;
	const options = {credentials: 'include'};

	return fetch(url, options)
		.then(fetchJson)
		.then(body => body.data)
		.then(data => data.user.articlesFromReadingHistory ? data.user.articlesFromReadingHistory.articles : [])
		.catch((e) => {
			global.console.error(e);
			return Promise.resolve([]);});
};

const removeReadArticles = (allArticles, readArticles) =>
	allArticles.reduce((unreadArticles, article) => {
		if (readArticles.find(readArticle => article.id === readArticle.id)) {
			return unreadArticles;
		}
		return unreadArticles.concat(article);
	},
	[]);

const getUnreadArticles = (uuid) =>
	Promise.all([fetchContentFromPersonalisedFeed(uuid), fetchReadingHistory(uuid)])
		.then(([userFeedLast24Hours, readingHistory]) => removeReadArticles(userFeedLast24Hours, readingHistory));

const filterRecent = (articles, startTime) =>
	articles.filter(
		article => isAfter(article.contentTimeStamp, startTime)
	);

export default (startTime) =>
	sessionClient.uuid()
		.then(({uuid}) => getUnreadArticles(uuid))
		.then(articles => filterRecent(articles, startTime))
		.then(newArticles => newArticles.length);
