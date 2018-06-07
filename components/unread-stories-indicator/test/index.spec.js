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
const NEW_CONTENT_SINCE_TIME = '2018-06-05T16:07:37.639Z';
const INDICATOR_DISMISSED_TIME = '2018-06-05T16:00:00.000Z';

describe('unread stories indicator', () => {
	let unreadStoriesIndicator;
	let mockFetchNewContent;
	let mockChronology;
	let mockStorage;
	let mockUi;

	beforeEach(() => {
		mockChronology = {
			determineNewContentSinceTime: sinon.stub().returns(NEW_CONTENT_SINCE_TIME),
			filterArticlesToNewSinceTime: sinon.stub().returns(NEW_UNDISMISSED_ARTICLES)
		};
		mockStorage = {
			getIndicatorDismissedTime: sinon.stub().returns(INDICATOR_DISMISSED_TIME),
			getLastVisitedAt: sinon.stub(),
			setLastVisitedAt: sinon.stub(),
			getNewContentSinceTime: sinon.stub(),
			setNewContentSinceTime: sinon.stub()
		};
		mockUi = {
			createIndicators: sinon.stub(),
			setCount: sinon.stub()
		};
		mockFetchNewContent = sinon.stub().returns(Promise.resolve(NEW_ARTICLES));
		unreadStoriesIndicator = require('inject-loader!../')({
			'next-session-client': { uuid: () => Promise.resolve({ uuid: USER_ID }) },
			'./storage': mockStorage,
			'./fetch-new-content': mockFetchNewContent,
			'./chronology': mockChronology,
			'./ui': mockUi
		});
		return unreadStoriesIndicator();
	});

	it('should fetch the new content for the user using the determined newContentSinceTime', () => {
		expect(mockFetchNewContent.calledWith(USER_ID, NEW_CONTENT_SINCE_TIME)).to.equal(true);
	});

	it('should determine the newContentSinceTime, before updating the lastVisitedAt time', () => {
		expect(mockStorage.setLastVisitedAt.calledAfter(mockChronology.determineNewContentSinceTime)).to.equal(true);
	});

	it('should filter new articles to undismissed ones', () => {
		expect(mockChronology.filterArticlesToNewSinceTime.calledWith(NEW_ARTICLES, INDICATOR_DISMISSED_TIME));
	});

	it('should call setCount with the number of new undismissed articles', () => {
		expect(mockUi.setCount.calledWith(NEW_UNDISMISSED_ARTICLES.length));
	});

	it('should update the newContentSinceTime', () => {
		expect(mockStorage.setNewContentSinceTime.calledWith(NEW_CONTENT_SINCE_TIME)).to.equal(true);
	});
});
