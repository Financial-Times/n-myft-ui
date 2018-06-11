/* global expect */
import sinon from 'sinon';

const NEW_ARTICLES = [
	{ id: 'article-1' },
	{ id: 'article-2' },
	{ id: 'article-3' },
];
const NEW_UNDISMISSED_ARTICLES = [
	{ id: 'article-3' }
];
const USER_ID = '123-456';
const NEW_ARTICLES_SINCE_TIME = '2018-06-05T16:07:37.639Z';
const INDICATOR_DISMISSED_TIME = '2018-06-05T16:00:00.000Z';

describe('unread stories indicator', () => {
	let unreadStoriesIndicator;
	let mockFetchNewArticles;
	let mockChronology;
	let mockStorage;
	let mockUi;

	beforeEach(() => {
		mockChronology = {
			determineNewArticlesSinceTime: sinon.stub().returns(NEW_ARTICLES_SINCE_TIME),
			filterArticlesToNewSinceTime: sinon.stub().returns(NEW_UNDISMISSED_ARTICLES)
		};
		mockStorage = {
			getIndicatorDismissedTime: sinon.stub().returns(INDICATOR_DISMISSED_TIME),
			getLastVisitedAt: sinon.stub(),
			setLastVisitedAt: sinon.stub(),
			getNewArticlesSinceTime: sinon.stub(),
			setNewArticlesSinceTime: sinon.stub()
		};
		mockUi = {
			createIndicators: sinon.stub(),
			setCount: sinon.stub()
		};
		mockFetchNewArticles = sinon.stub().returns(Promise.resolve(NEW_ARTICLES));
		unreadStoriesIndicator = require('inject-loader!../')({
			'next-session-client': { uuid: () => Promise.resolve({ uuid: USER_ID }) },
			'./storage': mockStorage,
			'./fetch-new-articles': mockFetchNewArticles,
			'./chronology': mockChronology,
			'./ui': mockUi
		});
		return unreadStoriesIndicator();
	});

	it('should fetch the new articles for the user using the determined newArticlesSinceTime', () => {
		expect(mockFetchNewArticles.calledWith(USER_ID, NEW_ARTICLES_SINCE_TIME)).to.equal(true);
	});

	it('should determine the newArticlesSinceTime, before updating the lastVisitedAt time', () => {
		expect(mockStorage.setLastVisitedAt.calledAfter(mockChronology.determineNewArticlesSinceTime)).to.equal(true);
	});

	it('should filter new articles to undismissed ones', () => {
		expect(mockChronology.filterArticlesToNewSinceTime.calledWith(NEW_ARTICLES, INDICATOR_DISMISSED_TIME));
	});

	it('should call setCount with the number of new undismissed articles', () => {
		expect(mockUi.setCount.calledWith(NEW_UNDISMISSED_ARTICLES.length));
	});

	it('should update the newArticlesSinceTime', () => {
		expect(mockStorage.setNewArticlesSinceTime.calledWith(NEW_ARTICLES_SINCE_TIME)).to.equal(true);
	});

	it('should fetch and show the unread articles count again on page visibility change');
});
