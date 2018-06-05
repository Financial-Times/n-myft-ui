/* global expect */

import sinon from 'sinon';
import * as storage from '../storage';

describe('storage', () => {
	let clock;
	let mockStorage;
	let now;

	beforeEach(() => {
		mockStorage = {};
		now = new Date();
		sinon.stub(window.Storage.prototype, 'getItem').callsFake(key => mockStorage[key]);
		sinon.stub(window.Storage.prototype, 'setItem').callsFake((key, value) => mockStorage[key] = value);
		clock = sinon.useFakeTimers(now);
	});

	afterEach(() => {
		window.Storage.prototype.getItem.restore();
		window.Storage.prototype.setItem.restore();
		clock.restore();
	});

	describe('getLastVisitedAt', () => {
		describe('given a valid timestamp is stored', () => {
			beforeEach(() => {
				mockStorage.lastVisitedAt = String(now.getTime());
			});

			it('should return the correct iso date', () => {
				expect(storage.getLastVisitedAt()).to.equal(now.toISOString());
			});
		});

		describe('given no value is stored', () => {
			beforeEach(() => {
				mockStorage.lastVisitedAt = null;
			});

			it('should return null', () => {
				expect(storage.getLastVisitedAt()).to.equal(null);
			});
		});

		describe('given an invalid value is stored', () => {
			beforeEach(() => {
				mockStorage.lastVisitedAt = 'abc';
			});

			it('should return null', () => {
				expect(storage.getLastVisitedAt()).to.equal(null);
			});
		});
	});

	describe('setLastVisitedAt', () => {
		it('should store the date as a timestamp', () => {
			storage.setLastVisitedAt();

			expect(mockStorage.lastVisitedAt).to.equal(String(now.getTime()));
		});
	});

	describe('getNewContentSinceTime', () => {
		describe('given a valid timestamp is stored', () => {
			beforeEach(() => {
				mockStorage.newContentSinceTime = String(now.getTime());
			});

			it('should return the correct iso date', () => {
				expect(storage.getNewContentSinceTime()).to.equal(now.toISOString());
			});
		});

		describe('given no value is stored', () => {
			beforeEach(() => {
				mockStorage.newContentSinceTime = null;
			});

			it('should return null', () => {
				expect(storage.getNewContentSinceTime()).to.equal(null);
			});
		});

		describe('given an invalid value is stored', () => {
			beforeEach(() => {
				mockStorage.newContentSinceTime = 'abc';
			});

			it('should return null', () => {
				expect(storage.getNewContentSinceTime()).to.equal(null);
			});
		});
	});

	describe('setNewContentSinceTime', () => {
		it('should store the date as a timestamp', () => {
			const date = new Date(2018, 5, 1, 11, 30, 0);

			storage.setNewContentSinceTime(date.toISOString());

			expect(mockStorage.newContentSinceTime).to.equal(String(date.getTime()));
		});
	});
});
