/* global expect */
import sinon from 'sinon';

const USER_ID = '123-456';

describe('unread stories indicator', () => {
	let unreadStoriesIndicator;
	let mockStorage;

	beforeEach(() => {
		mockStorage = {
			getLastVisitedAt: sinon.stub(),
			setLastVisitedAt: sinon.stub(),
			getNewContentSinceTime: sinon.stub(),
			setNewContentSinceTime: sinon.stub()
		};
		unreadStoriesIndicator = require('inject-loader!../')({
			'./storage': mockStorage,
			'./fetch-new-content': () => Promise.resolve({}),
			'../../myft-notification/get-uuid-from-session': () => Promise.resolve(USER_ID)
		});
		unreadStoriesIndicator();
	});

	it('should call getLastVisitedAt before setLastVisitedAt', () => {
		expect(mockStorage.getLastVisitedAt.calledBefore(mockStorage.setLastVisitedAt)).to.equal(true);
	});
});
