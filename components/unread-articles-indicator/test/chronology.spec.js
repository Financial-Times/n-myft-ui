/* global expect */

import sinon from 'sinon';
import { determineNewArticlesSinceTime, filterArticlesToNewSinceTime } from '../chronology';

const SOME_TIME_YESTERDAY = '2018-06-01T12:00:00.000Z';
const EARLIEST_NEW_ARTICLES_TIME = '2018-06-01T22:00:00.000Z';
const TODAY_0600 = '2018-06-02T06:00:00.000Z';
const TODAY_0700 = '2018-06-02T07:00:00.000Z';
const TODAY_0800 = '2018-06-02T08:00:00.000Z';
const TODAY_0801 = '2018-06-02T08:01:00.000Z';
const TODAY_1000 = '2018-06-02T10:00:00.000Z';

describe('chronology', () => {
	let clock;
	let timeNow;
	let userLastVisitedAt;
	let userNewArticlesSince;

	afterEach(() => {
		clock.restore();
	});

	describe('determineNewArticlesSinceTime', () => {
		describe('given the user is visiting for the first time today', () => {
			beforeEach(() => {
				userLastVisitedAt = SOME_TIME_YESTERDAY;
				userNewArticlesSince = SOME_TIME_YESTERDAY;
				timeNow = new Date(TODAY_0800);
				clock = sinon.useFakeTimers(timeNow);
			});

			it('should return the EARLIEST_NEW_ARTICLES_TIME', () => {
				const newArticlesSinceTime = determineNewArticlesSinceTime(userLastVisitedAt, userNewArticlesSince);

				expect(newArticlesSinceTime).to.equal(EARLIEST_NEW_ARTICLES_TIME);
			});
		});

		describe('given the user has visited today and returns within the same-visit threshold', () => {
			beforeEach(() => {
				userLastVisitedAt = TODAY_0800;
				userNewArticlesSince = TODAY_0700;
				timeNow = new Date(TODAY_0801);
				clock = sinon.useFakeTimers(timeNow);
			});

			describe('and there is a valid userNewArticlesSince time set', () => {
				it('should return the userNewArticlesSince time', () => {
					const newArticlesSinceTime = determineNewArticlesSinceTime(userLastVisitedAt, userNewArticlesSince);

					expect(newArticlesSinceTime).to.equal(userNewArticlesSince);
				});
			});

			describe('and there is no (or an invalid) userNewArticlesSince time set', () => {
				it('should return the EARLIEST_NEW_ARTICLES_TIME', () => {
					const newArticlesSinceTime = determineNewArticlesSinceTime(userLastVisitedAt, null);

					expect(newArticlesSinceTime).to.equal(EARLIEST_NEW_ARTICLES_TIME);
				});
			});
		});

		describe('given the user has visited today and returns after the same-visit threshold', () => {
			beforeEach(() => {
				userLastVisitedAt = TODAY_0800;
				userNewArticlesSince = TODAY_0600;
				timeNow = new Date(TODAY_1000);
				clock = sinon.useFakeTimers(timeNow);
			});

			it('should return the userLastVisitedAt time', () => {
				const newArticlesSinceTime = determineNewArticlesSinceTime(userLastVisitedAt, userNewArticlesSince);

				expect(newArticlesSinceTime).to.equal(userLastVisitedAt);
			});

		});

		describe('given there is an invalid userLastVisited time set', () => {
			beforeEach(() => {
				userNewArticlesSince = TODAY_0600;
				timeNow = new Date(TODAY_1000);
				clock = sinon.useFakeTimers(timeNow);
			});

			it('should return the EARLIEST_NEW_ARTICLES_TIME', () => {
				const newArticlesSinceTime = determineNewArticlesSinceTime(null, userNewArticlesSince);

				expect(newArticlesSinceTime).to.equal(EARLIEST_NEW_ARTICLES_TIME);
			});
		});
	});

	describe('filterArticlesToNewSinceTime', () => {
		const BEFORE_DISMISS_AND_UNREAD = 'BEFORE_DISMISS_AND_UNREAD';
		const BEFORE_DISMISS_AND_READ = 'BEFORE_DISMISS_AND_READ';
		const AFTER_DISMISS_AND_UNREAD = 'AFTER_DISMISS_AND_UNREAD';
		const AFTER_DISMISS_AND_READ = 'AFTER_DISMISS_AND_READ';
		const mockArticles = [
			{
				id: BEFORE_DISMISS_AND_UNREAD,
				publishedDate: TODAY_0600
			},
			{
				id: BEFORE_DISMISS_AND_READ,
				publishedDate: TODAY_0600,
				hasBeenRead: true
			},
			{
				id: AFTER_DISMISS_AND_UNREAD,
				publishedDate: TODAY_1000
			},
			{
				id: AFTER_DISMISS_AND_READ,
				publishedDate: TODAY_1000,
				hasBeenRead: true
			}
		];
		let filteredArticles;

		beforeEach(() => {
			filteredArticles = filterArticlesToNewSinceTime(mockArticles, TODAY_0800);
		});

		it('should return an array', () => {
			expect(filteredArticles).to.be.an('array');
		});

		it('should return only the unread articles published after the passed-in time', () => {
			expect(filteredArticles.length).to.equal(1);
			expect(filteredArticles[0].id === AFTER_DISMISS_AND_UNREAD).to.equal(true);
		});
	});
});
