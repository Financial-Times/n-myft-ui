import { json as fetchJson } from 'fetchres';
import { fragments as teaserFragments } from '@financial-times/n-teaser/main';
import slimQuery from './slim-query';

const checkDigestDataExist = ({ data = {} } = {}) => {
	if (!data || !data.user ||
		!data.user.digest ||
		!data.user.digest.concepts ||
		data.user.digest.concepts.length === 0 ||
		data.user.digest.concepts.every(concept => !concept.articles || !concept.articles.length)) {
		return Promise.reject(new Error('myFT Digest data is not provided'));
	}

	return data;
};

const extractArticlesFromSections = data => {
	data.user.digest.articles = data.user.digest.concepts.reduce((flatArticles, concept) =>
		flatArticles.concat(concept.articles), []);

	return data;
};

const decorateWithHasBeenRead = data => {
	const readArticles = data.user.articlesFromReadingHistory ? data.user.articlesFromReadingHistory.articles : [];

	readArticles.forEach(readArticle => {
		const readArticleInDigest = data.user.digest.articles.find(digestArticle => digestArticle.id === readArticle.id);

		if (readArticleInDigest) {
			readArticleInDigest.hasBeenRead = true;
		}
	});

	return data;
};

const orderByUnreadFirst = data => {
	data.user.digest.articles.sort((a, b) => {
		return (a.hasBeenRead && b.hasBeenRead) ? 0 : a.hasBeenRead ? -1 : 1;
	});

	return data;
};

export default async (uuid) => {
	const digestQuery = `
		${teaserFragments.teaserExtraLight}
		${teaserFragments.teaserLight}
		${teaserFragments.teaserStandard}
		${teaserFragments.teaserHeavy}

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
						concepts {
							id
							prefLabel
							url
							articles {
								...TeaserExtraLight
								...TeaserLight
								...TeaserStandard
								...TeaserHeavy
							}
						}
					}
				}
			}
		`;
	const variables = { uuid };
	const url = `https://next-api.ft.com/v2/query?query=${slimQuery(digestQuery)}&variables=${JSON.stringify(variables)}&source=next-front-page-myft`;
	const options = { credentials: 'include', timeout: 5000 };

	return fetch(url, options)
		.then(fetchJson)
		.then(checkDigestDataExist)
		.then(extractArticlesFromSections)
		.then(decorateWithHasBeenRead)
		.then(orderByUnreadFirst);
};
