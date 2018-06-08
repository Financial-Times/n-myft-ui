/* global expect */

import sinon from 'sinon';
import * as storage from '../storage';

describe('storage', () => {
	let clock;
	let now;

	beforeEach(() => {
		now = new Date();
		clock = sinon.useFakeTimers(now);
	});

	afterEach(() => {
		delete document.cookie;
		clock.restore();
	});

	describe('getLastVisitedAt', () => {
		describe('given a valid timestamp is stored', () => {
			it('should return the correct iso date', () => {
				Object.defineProperty(document, 'cookie', { value: `lastVisitedAt=${String(now.getTime())}`, configurable: true });
				expect(storage.getLastVisitedAt('lastVisitedAt')).to.equal(now.toISOString());
			});
		});

		describe('given no value is stored', () => {
			it('should return null', () => {
				Object.defineProperty(document, 'cookie', { value: `lastVisitedAt=${null}`, configurable: true });
				expect(storage.getLastVisitedAt('lastVisitedAt')).to.equal(null);
			});
		});

		describe('given an invalid value is stored', () => {
			it('should return null', () => {
				Object.defineProperty(document, 'cookie', { value: 'lastVisitedAt=abc', configurable: true });
				expect(storage.getLastVisitedAt('lastVisitedAt')).to.equal(null);
			});
		});
	});

	describe('setLastVisitedAt', () => {
		it('should store the date as a timestamp', () => {
			Object.defineProperty(document, 'cookie', { value: '', configurable: true, writable: true });
			storage.setLastVisitedAt();
			expect(document.cookie).to.equal(`lastVisitedAt=${String(now.getTime())}`);
		});
	});

	describe('getNewArticlesSinceTime', () => {
		describe('given a valid timestamp is stored', () => {
			it('should return the correct iso date', () => {
				Object.defineProperty(document, 'cookie', { value: `newArticlesSinceTime=${String(now.getTime())}`, configurable: true });
				expect(storage.getNewArticlesSinceTime()).to.equal(now.toISOString());
			});
		});

		describe('given no value is stored', () => {
			it('should return null', () => {
				Object.defineProperty(document, 'cookie', { value: `newArticlesSinceTime=${null}`, configurable: true });
				expect(storage.getNewArticlesSinceTime()).to.equal(null);
			});
		});

		describe('given an invalid value is stored', () => {
			it('should return null', () => {
				Object.defineProperty(document, 'cookie', { value: 'newArticlesSinceTime=abc', configurable: true });
				expect(storage.getNewArticlesSinceTime()).to.equal(null);
			});
		});
	});

	describe('setNewArticlesSinceTime', () => {
		it('should store the date as a timestamp', () => {
			Object.defineProperty(document, 'cookie', { value: '', configurable: true, writable: true });
			const date = new Date(2018, 5, 1, 11, 30, 0);

			storage.setNewArticlesSinceTime(date.toISOString());
			expect(document.cookie).to.equal(`newArticlesSinceTime=${String(date.getTime())}`);
		});
	});
});
