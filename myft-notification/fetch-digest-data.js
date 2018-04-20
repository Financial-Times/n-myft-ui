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

const flattenDigestSections = data => {
	data.user.digest.articles = data.user.digest.concepts.reduce((acc, curr) => acc.articles.concat(curr.articles));
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
		.then(flattenDigestSections);

};
