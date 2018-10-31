import sessionClient from 'next-session-client';
import { json as fetchJson } from 'fetchres';
import { isAfter } from 'date-fns';

const removeLineBreaks = str => encodeURIComponent(str.replace(/\s+/g, ' '));

// read state in articlesFromReadingHistory will be delayed by up to ~1 minute
const decorateWithHasBeenRead = (readingHistory, allArticles) => {
	const allReadArticles = readingHistory ? readingHistory.articles : [];

	allReadArticles.forEach(readArticle => {
		const readNewArticle = allArticles.find(article => article.id === readArticle.id);

		if (readNewArticle) {
			readNewArticle.hasBeenRead = true;
		}
	});

	return allArticles;
};

const contentFromPersonalisedFeed = uuid => {
	const url = `/__myft/api/onsite/feed/${uuid}?originatingSignals=followed&from=-24h`;
	const options = { credentials: 'include' };

	return fetch(url, options)
		.then(fetchJson)
		.then(body => body.results);
};

const readingHistory = uuid => {
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
	const variables = { uuid };
	const url = `https://next-api.ft.com/v2/query?query=${removeLineBreaks(gqlQuery)}&variables=${JSON.stringify(variables)}&source=next-myft`;
	const options = { credentials: 'include' };

	return fetch(url, options)
		.then(fetchJson)
		.then(body => body.data)
		.then(data => data.user.articlesFromReadingHistory)
		.catch(() => Promise.resolve({ articles: [] }));
};

const extractArticlesFromSinceTime = (articles, since) => {
	return articles.filter(article => isAfter(article.contentTimeStamp, since));
};

export default since => {
	return sessionClient.uuid()
		.then(({ uuid }) => uuid)
		.then(uuid => Promise.all([readingHistory(uuid), contentFromPersonalisedFeed(uuid)]))
		.then(([readingHistory, userFeedLast24Hours]) => decorateWithHasBeenRead(readingHistory, userFeedLast24Hours))
		.then(articles => extractArticlesFromSinceTime(articles, since));
};
