/* global expect */

import sinon from 'sinon';
import * as storage from '../../components/unread-articles-indicator/storage';

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

	describe('getDeviceSessionExpiry', () => {
		describe('given a valid iso date is stored', () => {
			beforeEach(() => {
				mockStorage.deviceSessionExpiry = now.toISOString();
			});

			it('should return the correct iso date', () => {
				expect(storage.getDeviceSessionExpiry().toISOString()).to.equal(now.toISOString());
			});
		});

		describe('given no value is stored', () => {
			beforeEach(() => {
				mockStorage.deviceSessionExpiry = null;
			});

			it('should return null', () => {
				expect(storage.getDeviceSessionExpiry()).to.equal(null);
			});
		});

		describe('given an invalid value is stored', () => {
			beforeEach(() => {
				mockStorage.deviceSessionExpiry = 'abc';
			});

			it('should return null', () => {
				expect(storage.getDeviceSessionExpiry()).to.equal(null);
			});
		});

		describe('given a unix timestamp is stored (old format)', () => {
			beforeEach(() => {
				mockStorage.deviceSessionExpiry = String(now.getTime());
			});

			it('should return null', () => {
				expect(storage.getDeviceSessionExpiry()).to.equal(null);
			});
		});
	});

	describe('setDeviceSessionExpiry', () => {
		it('should store the date as an iso string', () => {
			const date = new Date(2018, 6, 14, 11, 0, 0);

			storage.setDeviceSessionExpiry(date);

			expect(mockStorage.deviceSessionExpiry).to.equal(date.toISOString());
		});
	});

	describe('getFeedStartTime', () => {
		describe('given a valid iso date is stored', () => {
			beforeEach(() => {
				mockStorage.newArticlesSinceTime = now.toISOString();
			});

			it('should return the correct iso date', () => {
				expect(storage.getFeedStartTime().toISOString()).to.equal(now.toISOString());
			});
		});

		describe('given no value is stored', () => {
			beforeEach(() => {
				mockStorage.newArticlesSinceTime = null;
			});

			it('should return null', () => {
				expect(storage.getFeedStartTime()).to.equal(null);
			});
		});

		describe('given an invalid value is stored', () => {
			beforeEach(() => {
				mockStorage.newArticlesSinceTime = 'abc';
			});

			it('should return null', () => {
				expect(storage.getFeedStartTime()).to.equal(null);
			});
		});

		describe('given a unix timestamp is stored (old format)', () => {
			beforeEach(() => {
				mockStorage.newArticlesSinceTime = String(now.getTime());
			});

			it('should return the correct iso date', () => {
				expect(storage.getFeedStartTime()).to.equal(null);
			});
		});
	});

	describe('setFeedStartTime', () => {
		it('should store the date as an iso string', () => {
			const date = new Date(2018, 5, 1, 11, 30, 0);

			storage.setFeedStartTime(date);

			expect(mockStorage.newArticlesSinceTime).to.equal(date.toISOString());
		});
	});

	describe('getLastUpdate', () => {
		beforeEach(() => {
			mockStorage.myFTIndicatorUpdate = JSON.stringify({foo:1, time: now.toISOString()});
		});

		it('converts time from ISOString to Date', () => {
			expect(storage.getLastUpdate().time).to.be.a('Date');
		});

		it('gives the right Date', () => {
			expect(storage.getLastUpdate().time.getTime()).to.be.equal(now.getTime());
		});
	});

	describe('updateLastUpdate', () => {
		describe('when updating time', () =>{
			const date = new Date(2018, 5, 1, 11, 30, 0);
			beforeEach(() => {
				mockStorage.myFTIndicatorUpdate = JSON.stringify({foo: 3, time: now.toISOString()});
				storage.updateLastUpdate({time: date});
			});

			it('converts time from Date to ISOString', () => {
				expect(JSON.parse(mockStorage.myFTIndicatorUpdate).time).to.equal(date.toISOString());
			});

			it('leaves other properties unchanged', () => {
				expect(JSON.parse(mockStorage.myFTIndicatorUpdate).foo).to.equal(3);
			});
		});
		describe('when updating other properties', () =>{
			beforeEach(() => {
				mockStorage.myFTIndicatorUpdate = JSON.stringify({foo: 3, bar:4, baz:5});
				storage.updateLastUpdate({bar: 5, baz:6});
			});

			it('updates existing properties', () => {
				expect(JSON.parse(mockStorage.myFTIndicatorUpdate).bar).to.equal(5);
			});

			it('add new properties', () => {
				expect(JSON.parse(mockStorage.myFTIndicatorUpdate).baz).to.equal(6);
			});

			it('leaves other properties unchanged', () => {
				expect(JSON.parse(mockStorage.myFTIndicatorUpdate).foo).to.equal(3);
			});
		});
	});

	describe('isAvailable', () => {
		it('should return true if it is available', () => {
			sinon.stub(window.Storage.prototype, 'removeItem').callsFake((key) => delete mockStorage[key]);

			expect(storage.isAvailable()).to.be.true;
		});

		it('should return false if it is not available', () => {
			mockStorage = null;

			expect(storage.isAvailable()).to.be.false;
		});
	});
});
