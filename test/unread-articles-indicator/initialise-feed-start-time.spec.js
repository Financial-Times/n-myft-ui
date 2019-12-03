/* global expect */

import sinon from 'sinon';
import fetchMock from 'fetch-mock';

const mockDateFns = {
	isToday (x) {
		return x && x.toISOString().startsWith('2018-03-05T');
	},
	startOfDay (x) {
		return new Date(x.toISOString().slice(0,11)+'00:00:00Z');
	}
};

const TIME_NOW = new Date('2018-03-05T16:00:00Z');
const START_OF_TODAY = new Date('2018-03-05T00:00:00Z');
const VISIT_TIME_TODAY = new Date('2018-03-05T14:00:00Z');
const VISIT_TIME_YESTERDAY = new Date('2018-03-04T14:00:00Z');
const FEED_TIME_TODAY = new Date('2018-03-05T12:00:00Z');
const FEED_TIME_YESTERDAY = new Date('2018-03-04T12:00:00Z');
const USER_ID = '00000000-0000-0000-0000-000000000000';

const mockSetFeedStartTime = sinon.stub();


describe('initialiseFeedStartTime', () => {
	let isNewSession;
	let feedStartTime;
	let lastVisitTime;
	const injector = require('inject-loader!../../components/unread-articles-indicator/initialise-feed-start-time');
	const initialiseFeedStartTime = injector({
		'date-fns/isToday': mockDateFns.isToday,
		'date-fns/startOfDay': mockDateFns.startOfDay,
		'./device-session': () => ({ isNewSession: () => isNewSession }),
		'./storage': {
			setFeedStartTime: mockSetFeedStartTime,
			getFeedStartTime: sinon.stub().callsFake( () => feedStartTime ),
			isAvailable: sinon.stub().returns(true)
		}
	}).default;

	const expectStartTime = startTime => expect(mockSetFeedStartTime.firstCall.args[0].toISOString()).equal(startTime.toISOString());

	before(() => {
		fetchMock.get(`begin:/__myft/users/${USER_ID}/last-seen`, () => ({
			lastSeen: lastVisitTime && lastVisitTime.toISOString()
		}));
	});
	after(() => {
		fetchMock.restore();
	});

	context('with no previous feed start time', () => {
		before(() => {
			feedStartTime = undefined;
		});
		context('and previous visit today', () => {
			before(() => {
				mockSetFeedStartTime.resetHistory();
				lastVisitTime = VISIT_TIME_TODAY;
				return initialiseFeedStartTime(USER_ID, TIME_NOW);
			});
			it('sets start time to visit time', () => {
				expectStartTime(VISIT_TIME_TODAY);
			});
		});
		context('and previous visit yesterday', () => {
			before(() => {
				mockSetFeedStartTime.resetHistory();
				lastVisitTime = VISIT_TIME_YESTERDAY;
				return initialiseFeedStartTime(USER_ID, TIME_NOW);
			});
			it('sets start time to start of today', () => {
				expectStartTime(START_OF_TODAY);
			});
		});
		context('and no previous visit', () => {
			before(() => {
				mockSetFeedStartTime.resetHistory();
				lastVisitTime = undefined;
				return initialiseFeedStartTime(USER_ID, TIME_NOW);
			});
			it('sets start time to start of today', () => {
				expectStartTime(START_OF_TODAY);
			});
		});
	});
	context('with previous feed start time today', () => {
		before(() => {
			feedStartTime = FEED_TIME_TODAY;
		});
		context('and no new session', () => {
			before(() => {
				mockSetFeedStartTime.resetHistory();
				lastVisitTime = VISIT_TIME_TODAY;
				return initialiseFeedStartTime(USER_ID, );
			});
			it('sets start time to previous feed start time', () => {
				expectStartTime(FEED_TIME_TODAY);
			});
		});
		context('and new session started', () => {
			before(() => {
				isNewSession = true;
			});
			after(() => {
				isNewSession = false;
			});
			context('and previous visit today', () => {
				before(() => {
					mockSetFeedStartTime.resetHistory();
					lastVisitTime = VISIT_TIME_TODAY;
					return initialiseFeedStartTime(USER_ID, TIME_NOW);
				});
				it('sets start time to visit time', () => {
					expectStartTime(VISIT_TIME_TODAY);
				});
			});
			context('and previous visit yesterday', () => {
				before(() => {
					mockSetFeedStartTime.resetHistory();
					lastVisitTime = VISIT_TIME_YESTERDAY;
					return initialiseFeedStartTime(USER_ID, TIME_NOW);
				});
				it('sets start time to start of today', () => {
					expectStartTime(START_OF_TODAY);
				});
			});
			context('and no previous visit', () => {
				before(() => {
					mockSetFeedStartTime.resetHistory();
					lastVisitTime = undefined;
					return initialiseFeedStartTime(USER_ID, TIME_NOW);
				});
				it('sets start time to start of today', () => {
					expectStartTime(START_OF_TODAY);
				});
			});
		});
	});
	context('with previous feed start time yesterday', () => {
		before(() => {
			feedStartTime = FEED_TIME_YESTERDAY;
		});
		context('and previous visit today', () => {
			before(() => {
				mockSetFeedStartTime.resetHistory();
				lastVisitTime = VISIT_TIME_TODAY;
				return initialiseFeedStartTime(USER_ID, TIME_NOW);
			});
			it('sets start time to visit time', () => {
				expectStartTime(VISIT_TIME_TODAY);
			});
		});
		context('and previous visit yesterday', () => {
			before(() => {
				mockSetFeedStartTime.resetHistory();
				lastVisitTime = VISIT_TIME_YESTERDAY;
				return initialiseFeedStartTime(USER_ID, TIME_NOW);
			});
			it('sets start time to start of today', () => {
				expectStartTime(START_OF_TODAY);
			});
		});
		context('and no previous visit', () => {
			before(() => {
				mockSetFeedStartTime.resetHistory();
				lastVisitTime = undefined;
				return initialiseFeedStartTime(USER_ID, TIME_NOW);
			});
			it('sets start time to start of today', () => {
				expectStartTime(START_OF_TODAY);
			});
		});
	});
});
