/* global expect */

import fetchMock from 'fetch-mock';
import isAfter from 'date-fns/isAfter';
import parseISO from 'date-fns/parseISO';

const START_TIME = new Date('2018-06-05T06:48:26.635Z');
const userId = '00000000-0000-0000-0000-000000000000';

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
			contentTimeStamp: timestamps[when],
			userCompletion: read === 'READ' ? 1 : 0
		};
	};
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
		'date-fns/isAfter': isAfter,
		'date-fns/parseISO': parseISO
	});

	beforeEach(() => {
		count = null;
		fetchMock.get('begin:/__myft/api/onsite/feed/', mockPersonalisedFeedData);

		return countUnreadArticles(userId, START_TIME)
			.then(resolvedValue => {
				count = resolvedValue;
			});
	});

	afterEach(fetchMock.restore);

	it('should return only the unread articles after the start time', () => {
		expect(count).to.equal(8);
	});
});
