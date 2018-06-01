/* global expect */

import sinon from 'sinon';
import { getNewContentSinceTime } from '../get-new-content-since-time';

const SOME_TIME_YESTERDAY = '2018-06-01T12:00:00.000Z';
const EARLIEST_NEW_CONTENT_TIME_TODAY = '2018-06-02T05:00:00.000Z';
const TODAY_0600 = '2018-06-02T06:00:00.000Z';
const TODAY_0700 = '2018-06-02T07:00:00.000Z';
const TODAY_0800 = '2018-06-02T08:00:00.000Z';
const TODAY_0801 = '2018-06-02T08:01:00.000Z';
const TODAY_1000 = '2018-06-02T10:00:00.000Z';

describe('getNewContentSinceTime', () => {
	let clock;
	let now;

	afterEach(() => {
		clock.restore();
	});

	describe('given the user is visiting for the first time today', () => {
		beforeEach(() => {
			now = new Date(TODAY_0800);
			clock = sinon.useFakeTimers(now);
		});

		it('should return the default userNewContentFrom time', () => {
			const userLastVisited = SOME_TIME_YESTERDAY;
			const userNewContentFrom = SOME_TIME_YESTERDAY;
			const newContentFromTime = getNewContentSinceTime(userLastVisited, userNewContentFrom);

			expect(newContentFromTime).to.equal(EARLIEST_NEW_CONTENT_TIME_TODAY);
		});
	});

	describe('given the user has visited today and returns within the same-visit threshold', () => {
		beforeEach(() => {
			now = new Date(TODAY_0801);
			clock = sinon.useFakeTimers(now);
		});

		describe('and there is a valid userNewContentFrom time set', () => {
			it('should return the userNewContentFrom time', () => {
				const userLastVisited = TODAY_0800;
				const userNewContentFrom = TODAY_0700;
				const lastPublishedTime = getNewContentSinceTime(userLastVisited, userNewContentFrom);

				expect(lastPublishedTime).to.equal(userNewContentFrom);
			});
		});

		describe('and there is no (or an invalid) userNewContentFrom time set', () => {
			it('should return the default userNewContentFrom time', () => {
				const userLastVisited = TODAY_0800;
				const lastPublishedTime = getNewContentSinceTime(userLastVisited, null);

				expect(lastPublishedTime).to.equal(EARLIEST_NEW_CONTENT_TIME_TODAY);
			});
		});
	});

	describe('given the user has visited today and returns after the same-visit threshold', () => {
		beforeEach(() => {
			now = new Date('2018-06-02T10:00:00.000Z');
			clock = sinon.useFakeTimers(now);
		});

		it('should return the userLastVisited time', () => {
			const userLastVisited = TODAY_0800;
			const userNewContentFrom = TODAY_0600;
			const lastPublishedTime = getNewContentSinceTime(userLastVisited, userNewContentFrom);

			expect(lastPublishedTime).to.equal(userLastVisited);
		});

	});

	describe('given there is an invalid userLastVisited time set', () => {
		beforeEach(() => {
			now = new Date(TODAY_1000);
			clock = sinon.useFakeTimers(now);
		});

		it('should return the default userNewContentFrom time', () => {
			const userNewContentFrom = TODAY_0600;
			const lastPublishedTime = getNewContentSinceTime(null, userNewContentFrom);

			expect(lastPublishedTime).to.equal(EARLIEST_NEW_CONTENT_TIME_TODAY);
		});
	});

});
