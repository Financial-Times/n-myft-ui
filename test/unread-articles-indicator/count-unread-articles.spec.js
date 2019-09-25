/* global expect */

import fetchMock from 'fetch-mock';
import sinon from 'sinon';

const START_TIME = new Date('2018-06-05T06:48:26.635Z');

const timestamps = {
	BEFORE: '2018-06-04T06:48:26.635Z',
	AFTER: '2018-06-05T07:48:26.635Z'
};

const articleGenerator = () => {
	const counters = {};
	return (read, when) => {
		if (counters[read] === undefined) {
			counters[read] = {};
		}
		if (counters[read][when] === undefined) {
			counters[read][when] = 0;
		}
		const count = counters[read][when]++;
		return {
			id: `${read}_${when}_${count}`,
			contentTimeStamp: timestamps[when]
		};
	};
};

const generateReadingHistory = articleGenerator();
const mockReadingHistoryData = {
	data: {
		user: {
			articlesFromReadingHistory: {
				articles: [
					{id: generateReadingHistory('READ', 'AFTER').id},
					{id: generateReadingHistory('READ', 'BEFORE').id},
					{id: generateReadingHistory('READ', 'AFTER').id}
				]
			}
		}
	}
};

const generateFeedArticle = articleGenerator();
const mockPersonalisedFeedData = {
	results: [
		generateFeedArticle('READ', 'AFTER'),
		generateFeedArticle('UNREAD', 'BEFORE'),
		generateFeedArticle('READ', 'AFTER'),
		generateFeedArticle('UNREAD', 'BEFORE'),
		generateFeedArticle('UNREAD', 'BEFORE'),
		generateFeedArticle('UNREAD', 'AFTER'),
		generateFeedArticle('UNREAD', 'BEFORE'),
		generateFeedArticle('UNREAD', 'AFTER'),
		generateFeedArticle('UNREAD', 'AFTER'),
		generateFeedArticle('UNREAD', 'AFTER'),
		generateFeedArticle('UNREAD', 'AFTER'),
		generateFeedArticle('UNREAD', 'AFTER'),
		generateFeedArticle('UNREAD', 'AFTER'),
		generateFeedArticle('UNREAD', 'AFTER'),
	]
};

describe('count-unread-articles', () => {
	let count;

	const injector = require('inject-loader!../../components/unread-articles-indicator/count-unread-articles');
	const countUnreadArticles = injector({
		'next-session-client': {
			uuid: sinon.stub().resolves({uuid: '00000000-0000-0000-0000-000000000000'})
		},
	});

	beforeEach(() => {
		count = null;
		fetchMock.get('begin:https://next-api.ft.com/v2/', mockReadingHistoryData);
		fetchMock.get('begin:/__myft/api/onsite/feed/', mockPersonalisedFeedData);

		return countUnreadArticles(START_TIME)
			.then(resolvedValue => {
				count = resolvedValue;
			});
	});

	afterEach(fetchMock.restore);

	it('should return only the unread articles after the start time', () => {
		expect(count).to.equal(8);
	});
});
