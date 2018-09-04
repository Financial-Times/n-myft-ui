/* global expect */

import fetchMock from 'fetch-mock';
import fetchNewArticles from '../../components/unread-articles-indicator/fetch-new-articles';

const USER_UUID = '0-0-0-0';
const SINCE = '2018-06-05T06:48:26.635Z';

const ARTICLE_PUBLISH_BEFORE_SINCE = '2018-06-04T06:48:26.635Z';
const ARTICLE_PUBLISH_AFTER_SINCE = '2018-06-05T07:48:26.635Z';

const READ_ARTICLE_AFTER_SINCE = 'read-followed-article-after-since';
const UNREAD_ARTICLE_AFTER_SINCE = 'unread-followed-article-after-since';
const READ_ARTICLE_BEFORE_SINCE = 'read-followed-article-before-since';
const UNREAD_ARTICLE_BEFORE_SINCE = 'unread-followed-article-before-since';
const mockReadingHistoryData = {
	data: {
		user: {
			articlesFromReadingHistory: {
				articles: [
					{ id: READ_ARTICLE_AFTER_SINCE },
					{ id: READ_ARTICLE_BEFORE_SINCE }
				]
			}
		}
	}
};
const mockPersonalisedFeedData = {
	results: [
		{
			id: READ_ARTICLE_AFTER_SINCE,
			contentTimeStamp: ARTICLE_PUBLISH_AFTER_SINCE
		},
		{
			id: UNREAD_ARTICLE_AFTER_SINCE,
			contentTimeStamp: ARTICLE_PUBLISH_AFTER_SINCE
		},
		{
			id: READ_ARTICLE_BEFORE_SINCE,
			contentTimeStamp: ARTICLE_PUBLISH_BEFORE_SINCE
		},
		{
			id: UNREAD_ARTICLE_BEFORE_SINCE,
			contentTimeStamp: ARTICLE_PUBLISH_BEFORE_SINCE
		}
	]
};

describe('fetch-new-articles', () => {
	let data;

	beforeEach(() => {
		data = null;
		fetchMock.get('begin:https://next-api.ft.com/v2/', mockReadingHistoryData);
		fetchMock.get('begin:/__myft/api/onsite/feed/', mockPersonalisedFeedData);

		return fetchNewArticles(USER_UUID, SINCE)
			.then(resolvedValue => {
				data = resolvedValue;
			});
	});

	afterEach(fetchMock.reset);

	it('should fetch', () => {
		expect(fetchMock.calls().matched.length).to.equal(2);
	});

	it('should return an array of articles', () => {
		expect(data).to.be.an('array');
	});

	it('should return only the articles after the since date', () => {
		expect(data.length).to.equal(2);
		expect(data.some(article => article.id === READ_ARTICLE_AFTER_SINCE)).to.equal(true);
		expect(data.some(article => article.id === UNREAD_ARTICLE_AFTER_SINCE)).to.equal(true);
	});

	it('should decorate read articles with hasBeenRead = true', () => {
		expect(data.find(article => article.id === READ_ARTICLE_AFTER_SINCE).hasBeenRead).to.equal(true);
		expect(data.find(article => article.id === UNREAD_ARTICLE_AFTER_SINCE).hasBeenRead).not.to.equal(true);
	});
});
