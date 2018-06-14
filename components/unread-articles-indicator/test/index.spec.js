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
const STORED_LAST_VISITED = '2018-06-04T13:00:00.000Z';
const STORED_NEW_ARTICLES_SINCE_TIME = '2018-06-05T10:00:00.000Z';
const STORED_INDICATOR_DISMISSED_TIME = '2018-06-05T16:00:00.000Z';
const DETERMINED_NEW_ARTICLES_SINCE_TIME = '2018-06-05T16:07:37.639Z';

describe('unread stories indicator', () => {
	let unreadStoriesIndicator;
	let mockFetchNewArticles;
	let mockChronology;
	let mockStorage;
	let mockUi;

	beforeEach(() => {
		mockChronology = {
			determineNewArticlesSinceTime: sinon.stub().returns(DETERMINED_NEW_ARTICLES_SINCE_TIME),
			filterArticlesToNewSinceTime: sinon.stub().returns(NEW_UNDISMISSED_ARTICLES)
		};
		mockStorage = {
			getIndicatorDismissedTime: sinon.stub().returns(STORED_INDICATOR_DISMISSED_TIME),
			getLastVisitedAt: sinon.stub().returns(STORED_LAST_VISITED),
			setLastVisitedAt: sinon.stub(),
			getNewArticlesSinceTime: sinon.stub().returns(STORED_NEW_ARTICLES_SINCE_TIME),
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
	});

	describe('default export', () => {
		beforeEach(() => {
			return unreadStoriesIndicator.default();
		});

		it('should fetch the new articles for the user using the determined newArticlesSinceTime', () => {
			expect(mockFetchNewArticles.calledWith(USER_ID, DETERMINED_NEW_ARTICLES_SINCE_TIME)).to.equal(true);
		});

		it('should filter new articles to undismissed ones', () => {
			expect(mockChronology.filterArticlesToNewSinceTime.calledWith(NEW_ARTICLES, STORED_INDICATOR_DISMISSED_TIME));
		});

		it('should call setCount with the number of new undismissed articles', () => {
			expect(mockUi.setCount.calledWith(NEW_UNDISMISSED_ARTICLES.length));
		});

		it('should fetch and show the unread articles count again on page visibility change', () => {
			mockChronology.filterArticlesToNewSinceTime.returns(NEW_ARTICLES);

			document.dispatchEvent(new Event('visibilitychange'));

			expect(mockUi.setCount.calledWith(NEW_ARTICLES.length));
		});
	});

	describe('getNewArticlesSinceTime', () => {
		describe('when called for the first time', () => {
			it('should determineNewArticlesSinceTime', () => {
				unreadStoriesIndicator.getNewArticlesSinceTime();

				expect(mockStorage.getLastVisitedAt).to.have.been.calledOnce;
				expect(mockStorage.getNewArticlesSinceTime).to.have.been.calledOnce;
				expect(mockChronology.determineNewArticlesSinceTime).to.have.been.calledWith(STORED_LAST_VISITED, STORED_NEW_ARTICLES_SINCE_TIME);
			});

			it('should update the values in storage the first time it is called', () => {
				unreadStoriesIndicator.getNewArticlesSinceTime();

				expect(mockStorage.setNewArticlesSinceTime).to.have.been.calledWith(DETERMINED_NEW_ARTICLES_SINCE_TIME);
				expect(mockStorage.setNewArticlesSinceTime).to.have.been.calledAfter(mockChronology.determineNewArticlesSinceTime);
				expect(mockStorage.setLastVisitedAt).to.have.been.calledOnce;
				expect(mockStorage.setLastVisitedAt).to.have.been.calledAfter(mockChronology.determineNewArticlesSinceTime);
			});

			it('should return the the newArticlesSinceTime', () => {
				expect(unreadStoriesIndicator.getNewArticlesSinceTime()).to.equal(DETERMINED_NEW_ARTICLES_SINCE_TIME);
			});
		});

		describe('should not change the values when called subsequent times', () => {
			it('should not determineNewArticlesSinceTime more than once', () => {
				unreadStoriesIndicator.getNewArticlesSinceTime();
				unreadStoriesIndicator.getNewArticlesSinceTime();

				expect(mockStorage.getLastVisitedAt).to.have.been.calledOnce;
				expect(mockStorage.getNewArticlesSinceTime).to.have.been.calledOnce;
			});

			it('should not update the values in storage more than once', () => {
				unreadStoriesIndicator.getNewArticlesSinceTime();
				unreadStoriesIndicator.getNewArticlesSinceTime();

				expect(mockStorage.setNewArticlesSinceTime).to.have.been.calledOnce;
				expect(mockStorage.setLastVisitedAt).to.have.been.calledOnce;
			});

			it('should return the the newArticlesSinceTime', () => {
				expect(unreadStoriesIndicator.getNewArticlesSinceTime()).to.equal(DETERMINED_NEW_ARTICLES_SINCE_TIME);
			});
		});
	});
});
