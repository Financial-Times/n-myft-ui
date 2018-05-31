/* global expect */

import sinon from 'sinon';
import { getPublishedSinceTime } from '../get-published-since-time';

describe('getPublishedSinceTime', () => {
	let clock;
	let now;

	afterEach(() => {
		clock.restore();
	});

	describe('given the user is visiting for the first time today', () => {
		beforeEach(() => {
			now = new Date('2018-06-02T12:00:00.000Z');
			clock = sinon.useFakeTimers(now);
		});

		it('should return the default publishedSince time', () => {
			const lastVisited = '2018-06-01T12:00:00.000Z';
			const publishedSince = '2018-06-01T05:00:00.000Z';
			const lastPublishedTime = getPublishedSinceTime(lastVisited, publishedSince);

			expect(lastPublishedTime).to.equal('2018-06-02T05:00:00.000Z');
		});
	});

	describe('given the user has visited today and returns within the same-visit threshold', () => {
		beforeEach(() => {
			now = new Date('2018-06-02T08:01:00.000Z');
			clock = sinon.useFakeTimers(now);
		});

		describe('and there is a valid publishedSince time set', () => {
			it('should return the publishedSince time', () => {
				const lastVisited = '2018-06-02T08:00:00.000Z';
				const publishedSince = '2018-06-02T07:00:00.000Z';
				const lastPublishedTime = getPublishedSinceTime(lastVisited, publishedSince);

				expect(lastPublishedTime).to.equal('2018-06-02T07:00:00.000Z');
			});
		});

		describe('and there is no (or an invalid) publishedSince time set', () => {
			it('should return the default publishedSince time', () => {
				const lastVisited = '2018-06-02T08:00:00.000Z';
				const lastPublishedTime = getPublishedSinceTime(lastVisited, null);

				expect(lastPublishedTime).to.equal('2018-06-02T05:00:00.000Z');
			});
		});
	});

	describe('given the user has visited today and returns after the same-visit threshold', () => {
		beforeEach(() => {
			now = new Date('2018-06-02T10:00:00.000Z');
			clock = sinon.useFakeTimers(now);
		});

		it('should return the lastVisited time', () => {
			const lastVisited = '2018-06-02T08:00:00.000Z';
			const publishedSince = '2018-06-02T05:00:00.000Z';
			const lastPublishedTime = getPublishedSinceTime(lastVisited, publishedSince);

			expect(lastPublishedTime).to.equal('2018-06-02T08:00:00.000Z');
		});

	});

	describe('given there is no (or invalid) lastVisited time set', () => {
		beforeEach(() => {
			now = new Date('2018-06-02T12:00:00.000Z');
			clock = sinon.useFakeTimers(now);
		});

		it('should return the default publishedSince time', () => {
			const publishedSince = '2018-06-01T05:00:00.000Z';
			const lastPublishedTime = getPublishedSinceTime(null, publishedSince);

			expect(lastPublishedTime).to.equal('2018-06-02T05:00:00.000Z');
		});
	});

});
