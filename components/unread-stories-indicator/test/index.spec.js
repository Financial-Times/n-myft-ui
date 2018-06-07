/* global expect */
import sinon from 'sinon';

const USER_ID = '123-456';
const NEW_CONTENT_SINCE_TIME = '2018-06-05T16:07:37.639Z';

describe('unread stories indicator', () => {
	let unreadStoriesIndicator;
	let mockDetermineNewContentSinceTime;
	let mockFetchNewContent;
	let mockStorage;

	beforeEach(() => {
		mockStorage = {
			getIndicatorDismissedTime: sinon.stub(),
			getLastVisitedAt: sinon.stub(),
			setLastVisitedAt: sinon.stub(),
			getNewContentSinceTime: sinon.stub(),
			setNewContentSinceTime: sinon.stub()
		};
		mockDetermineNewContentSinceTime = sinon.stub().returns(NEW_CONTENT_SINCE_TIME);
		mockFetchNewContent = sinon.stub().returns(Promise.resolve([]));
		unreadStoriesIndicator = require('inject-loader!../')({
			'next-session-client': { uuid: () => Promise.resolve({ uuid: USER_ID }) },
			'./storage': mockStorage,
			'./fetch-new-content': mockFetchNewContent,
			'./determine-new-content-since-time': {
				determineNewContentSinceTime: mockDetermineNewContentSinceTime
			}
		});
		return unreadStoriesIndicator();
	});

	it('should fetch the new content for the user using the determined newContentSinceTime', () => {
		expect(mockFetchNewContent.calledWith(USER_ID, NEW_CONTENT_SINCE_TIME)).to.equal(true);
	});

	it('should determine the newContentSinceTime, before updating the lastVisitedAt time', () => {
		expect(mockStorage.setLastVisitedAt.calledAfter(mockDetermineNewContentSinceTime)).to.equal(true);
	});
});
