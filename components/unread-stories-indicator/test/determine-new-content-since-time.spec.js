/* global expect */

import sinon from 'sinon';
import { determineNewContentSinceTime } from '../determine-new-content-since-time';

const SOME_TIME_YESTERDAY = '2018-06-01T12:00:00.000Z';
const EARLIEST_NEW_CONTENT_TIME_TODAY = '2018-06-02T05:00:00.000Z';
const TODAY_0600 = '2018-06-02T06:00:00.000Z';
const TODAY_0700 = '2018-06-02T07:00:00.000Z';
const TODAY_0800 = '2018-06-02T08:00:00.000Z';
const TODAY_0801 = '2018-06-02T08:01:00.000Z';
const TODAY_1000 = '2018-06-02T10:00:00.000Z';

describe('determineNewContentSinceTime', () => {
	let clock;
	let timeNow;
	let userLastVisitedAt;
	let userNewContentSince;

	afterEach(() => {
		clock.restore();
	});

	describe('given the user is visiting for the first time today', () => {
		beforeEach(() => {
			userLastVisitedAt = SOME_TIME_YESTERDAY;
			userNewContentSince = SOME_TIME_YESTERDAY;
			timeNow = new Date(TODAY_0800);
			clock = sinon.useFakeTimers(timeNow);
		});

		it('should return the EARLIEST_NEW_CONTENT_TIME_TODAY', () => {
			const newContentSinceTime = determineNewContentSinceTime(userLastVisitedAt, userNewContentSince);

			expect(newContentSinceTime).to.equal(EARLIEST_NEW_CONTENT_TIME_TODAY);
		});
	});

	describe('given the user has visited today and returns within the same-visit threshold', () => {
		beforeEach(() => {
			userLastVisitedAt = TODAY_0800;
			userNewContentSince = TODAY_0700;
			timeNow = new Date(TODAY_0801);
			clock = sinon.useFakeTimers(timeNow);
		});

		describe('and there is a valid userNewContentFrom time set', () => {
			it('should return the userNewContentSince time', () => {
				const newContentSinceTime = determineNewContentSinceTime(userLastVisitedAt, userNewContentSince);

				expect(newContentSinceTime).to.equal(userNewContentSince);
			});
		});

		describe('and there is no (or an invalid) userNewContentFrom time set', () => {
			it('should return the EARLIEST_NEW_CONTENT_TIME_TODAY', () => {
				const newContentSinceTime = determineNewContentSinceTime(userLastVisitedAt, null);

				expect(newContentSinceTime).to.equal(EARLIEST_NEW_CONTENT_TIME_TODAY);
			});
		});
	});

	describe('given the user has visited today and returns after the same-visit threshold', () => {
		beforeEach(() => {
			userLastVisitedAt = TODAY_0800;
			userNewContentSince = TODAY_0600;
			timeNow = new Date(TODAY_1000);
			clock = sinon.useFakeTimers(timeNow);
		});

		it('should return the userLastVisitedAt time', () => {
			const newContentSinceTime = determineNewContentSinceTime(userLastVisitedAt, userNewContentSince);

			expect(newContentSinceTime).to.equal(userLastVisitedAt);
		});

	});

	describe('given there is an invalid userLastVisited time set', () => {
		beforeEach(() => {
			userNewContentSince = TODAY_0600;
			timeNow = new Date(TODAY_1000);
			clock = sinon.useFakeTimers(timeNow);
		});

		it('should return the EARLIEST_NEW_CONTENT_TIME_TODAY', () => {
			const newContentSinceTime = determineNewContentSinceTime(null, userNewContentSince);

			expect(newContentSinceTime).to.equal(EARLIEST_NEW_CONTENT_TIME_TODAY);
		});
	});

});
