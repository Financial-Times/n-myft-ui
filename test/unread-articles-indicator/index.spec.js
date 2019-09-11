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
const STORED_NEW_ARTICLES_SINCE_TIME = '2018-06-05T10:00:00.000Z';
const STORED_INDICATOR_DISMISSED_TIME = '2018-06-05T16:00:00.000Z';
const DETERMINED_NEW_ARTICLES_SINCE_TIME = '2018-06-05T16:07:37.639Z';

describe('unread stories indicator', () => {
	let clock;
	let unreadStoriesIndicator;
	let mockFetchNewArticles;
	let mockChronology;
	let mockStorage;
	let mockTracking;
	let mockUi;
	let isStorageAvailable;

	beforeEach(() => {
		mockChronology = {
			determineNewArticlesSinceTime: sinon.stub().returns(Promise.resolve(DETERMINED_NEW_ARTICLES_SINCE_TIME)),
			filterArticlesToNewSinceTime: sinon.stub().returns(NEW_UNDISMISSED_ARTICLES)
		};
		mockStorage = {
			getIndicatorDismissedTime: sinon.stub().returns(STORED_INDICATOR_DISMISSED_TIME),
			setIndicatorDismissedTime: sinon.stub(),
			getNewArticlesSinceTime: sinon.stub().returns(STORED_NEW_ARTICLES_SINCE_TIME),
			setNewArticlesSinceTime: sinon.stub(),
			isAvailable: sinon.stub().callsFake(() => isStorageAvailable)
		};
		mockTracking = {
			countShown: sinon.stub()
		};
		mockUi = {
			createIndicators: sinon.stub(),
			setCount: sinon.stub()
		};
		mockFetchNewArticles = sinon.stub().returns(Promise.resolve(NEW_ARTICLES));
		unreadStoriesIndicator = require('inject-loader!../../components/unread-articles-indicator')({
			'./chronology': mockChronology,
			'./fetch-new-articles': mockFetchNewArticles,
			'./storage': mockStorage,
			'./tracking': mockTracking,
			'./ui': mockUi
		});
	});

	describe('default export', () => {
		describe('storage availability', () => {
			it('should not do anything if storage is not available', () => {
				isStorageAvailable = false;
				unreadStoriesIndicator.default();
				expect(mockUi.createIndicators).to.not.have.been.called;
				expect(mockUi.setCount).to.not.have.been.called;
				expect(mockFetchNewArticles).to.not.have.been.called;
				expect(mockChronology.determineNewArticlesSinceTime).to.not.have.been.called;
			});
		});

		describe('initial update', () => {
			beforeEach(() => {
				isStorageAvailable = true;
				return unreadStoriesIndicator.default();
			});

			it('should create ui indicators', () => {
				expect(mockUi.createIndicators).to.have.been.calledOnce;

				const args = mockUi.createIndicators.firstCall.args;

				expect(args[1].onClick).to.be.a('function');

				args[1].onClick();

				expect(mockUi.setCount).to.have.been.calledTwice;
				expect(mockStorage.setIndicatorDismissedTime).to.have.been.calledOnce;
			});

			it('should fetch the new articles for the user using the determined newArticlesSinceTime', () => {
				expect(mockFetchNewArticles.calledWith(DETERMINED_NEW_ARTICLES_SINCE_TIME)).to.equal(true);
			});

			it('should filter new articles to undismissed ones', () => {
				expect(mockChronology.filterArticlesToNewSinceTime.calledWith(NEW_ARTICLES, STORED_INDICATOR_DISMISSED_TIME));
			});

			it('should call setCount with the number of new undismissed articles', () => {
				expect(mockUi.setCount).calledWith(NEW_UNDISMISSED_ARTICLES.length);
			});

			it('should track initial update of count', () => {
				expect(mockTracking.countShown).calledWith(NEW_UNDISMISSED_ARTICLES.length, DETERMINED_NEW_ARTICLES_SINCE_TIME);
			});
		});

		// Not working in IE11
		describe.skip('on page becoming visible five minutes or more after the last update', () => {
			beforeEach((done) => {
				clock = sinon.useFakeTimers();
				unreadStoriesIndicator.default()
					.then(() => {
						mockChronology.filterArticlesToNewSinceTime.returns(NEW_ARTICLES);

						clock.tick(1000 * 60 * 6);
						mockTracking.countShown.callsFake(() => done());

						document.dispatchEvent(new Event('visibilitychange'));
					});
			});

			afterEach(() => {
				clock.restore();
			});

			it('should fetch and show the unread articles count again', () => {
				expect(mockUi.setCount).calledWith(NEW_ARTICLES.length);
			});

			it('should track new update of count', () => {
				expect(mockTracking.countShown).not.to.have.been.called;
			});
		});
	});

	describe('getNewArticlesSinceTime', () => {
		describe('when called for the first time', () => {
			it('should determineNewArticlesSinceTime', () => {
				unreadStoriesIndicator.getNewArticlesSinceTime();

				expect(mockStorage.getNewArticlesSinceTime).to.have.been.calledOnce;
				expect(mockChronology.determineNewArticlesSinceTime).to.have.been.calledWith(STORED_NEW_ARTICLES_SINCE_TIME);
			});

			it('should update the values in storage the first time it is called', () => {
				return unreadStoriesIndicator.getNewArticlesSinceTime()
					.then(() => {
						expect(mockStorage.setNewArticlesSinceTime).to.have.been.calledWith(DETERMINED_NEW_ARTICLES_SINCE_TIME);
						expect(mockStorage.setNewArticlesSinceTime).to.have.been.calledAfter(mockChronology.determineNewArticlesSinceTime);
					});
			});

			it('should return the the newArticlesSinceTime', () => {
				return unreadStoriesIndicator.getNewArticlesSinceTime()
					.then(result => {
						expect(result).to.equal(DETERMINED_NEW_ARTICLES_SINCE_TIME);
					});
			});
		});

		describe('should not change the values when called subsequent times', () => {
			it('should not determineNewArticlesSinceTime more than once', () => {
				return unreadStoriesIndicator.getNewArticlesSinceTime()
					.then(() => {
						return unreadStoriesIndicator.getNewArticlesSinceTime()
							.then(() => {
								expect(mockStorage.getNewArticlesSinceTime).to.have.been.calledOnce;
							});
					});
			});

			it('should not update the values in storage more than once', () => {
				return unreadStoriesIndicator.getNewArticlesSinceTime()
					.then(() => {
						return unreadStoriesIndicator.getNewArticlesSinceTime()
							.then(() => {
								expect(mockStorage.setNewArticlesSinceTime).to.have.been.calledOnce;
							});
					});
			});

			it('should return the newArticlesSinceTime', () => {
				return unreadStoriesIndicator.getNewArticlesSinceTime()
					.then(() => {
						return unreadStoriesIndicator.getNewArticlesSinceTime()
							.then(result => {
								expect(result).to.equal(DETERMINED_NEW_ARTICLES_SINCE_TIME);
							});
					});
			});
		});
	});
});
