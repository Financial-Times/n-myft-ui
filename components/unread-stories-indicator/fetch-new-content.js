import { json as fetchJson } from 'fetchres';

const removeLineBreaks = str => encodeURIComponent(str.replace(/\s+/g, ' '));

const extractFollowedArticles = data => {
	const followedConcepts = data.user.followed.reduce((acc, concept) => acc.concat(concept.id), []);

	data.articles = data.latestContent.reduce((articles, article) => {
		const articleConceptIsFollowed = article.annotations.some(annotation => followedConcepts.includes(annotation.id));

		return articleConceptIsFollowed ? articles.concat(article) : articles;
	}, []);

	return data;
};

// read state in articlesFromReadingHistory will be delayed by up to ~1 minute
const decorateWithHasBeenRead = data => {
	const allReadArticles = data.user.articlesFromReadingHistory ? data.user.articlesFromReadingHistory.articles : [];

	allReadArticles.forEach(readArticle => {
		const readNewArticle = data.articles.find(article => article.id === readArticle.id);

		if (readNewArticle) {
			readNewArticle.hasBeenRead = true;
		}
	});

	return data;
};

export default function (uuid, since) {
	const gqlQuery = `
		query newMyFTContentSince($uuid: String!, $since: String!) {
			user(uuid: $uuid) {
				followed {
					id
				}
				articlesFromReadingHistory {
					articles {
						id
					}
				}
			}

			latestContent(since: $since) {
				id
				title
				annotations {
					id
				}
			}
		}
		`;
	const variables = { uuid, since };
	const url = `https://next-api.ft.com/v2/query?query=${removeLineBreaks(gqlQuery)}&variables=${JSON.stringify(variables)}&source=next-myft`;
	const options = { credentials: 'include', timeout: 5000 };

	return fetch(url, options)
		.then(fetchJson)
		.then(body => body.data)
		.then(extractFollowedArticles)
		.then(decorateWithHasBeenRead)
		.then(data => data.articles);
};
