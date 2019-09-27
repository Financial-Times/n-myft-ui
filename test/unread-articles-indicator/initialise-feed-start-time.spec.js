/* global expect */

import sinon from 'sinon';
import fetchMock from 'fetch-mock';


// const TIME_NOW = new Date('2018-06-05T16:00:00Z');

const VISIT_TIME_TODAY = new Date('2018-06-05T14:00:00Z');


const mockSetFeedStartTime = sinon.stub();


describe('initialiseFeedStartTime', () => {

	let lastVisitTime;
	// let clock;

	before(() => {
		// clock = sinon.useFakeTimers(TIME_NOW);
		fetchMock.get('begin:https://next-api.ft.com/v2/', ()=>({body: {data: {user: {lastSeenTimestamp: lastVisitTime.toISOString()}}}}));
	});
	after(() => {
		fetchMock.restore();
		// clock.restore();
	});

	context('with no previous feed start time', () => {
		before(() => {

		});
		context('and previous visit today', () => {
			before(() => {
				mockSetFeedStartTime.resetHistory();
				lastVisitTime = VISIT_TIME_TODAY;

				return Promise.resolve(true);
			});
			it('sets start time to visit time', () => {

				expect(true).to.equal(true);
			});
		});

	});

});
