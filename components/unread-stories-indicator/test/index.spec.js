/* global expect */
import sinon from 'sinon';

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
			'./storage': mockStorage
		});
		unreadStoriesIndicator();
	});

	it('should call getLastVisitedAt before setLastVisitedAt', () => {
		expect(mockStorage.getLastVisitedAt.calledBefore(mockStorage.setLastVisitedAt)).to.equal(true);
	});
});
