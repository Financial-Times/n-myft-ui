/* global expect */

import sinon from 'sinon';
import dateFns from 'date-fns';

const toLocal = date => dateFns.addMinutes(date, new Date().getTimezoneOffset()).toISOString();

const SOME_TIME_YESTERDAY = '2018-06-01T12:00:00.000Z';
const EARLIEST_NEW_ARTICLES_TIME = '2018-06-02T00:00:00.000Z';
const TODAY_0600 = '2018-06-02T06:00:00.000Z';
const TODAY_0750 = '2018-06-02T07:50:00.000Z';
const TODAY_0800 = '2018-06-02T08:00:00.000Z';
const TODAY_0801 = '2018-06-02T08:01:00.000Z';
const TODAY_1000 = '2018-06-02T10:00:00.000Z';

const uuid = 'user-id';

describe('chronology', () => {
	let clock;
	let userLastVisitedAt;
	let userNewArticlesSince;
	let isNewSession;

	const subjectInjector = require('inject-loader!../../components/unread-articles-indicator/chronology');
	const subject = subjectInjector({
		'date-fns': dateFns,
		'./api': {
			fetchUserLastVisitedAt: sinon.stub().callsFake(() => Promise.resolve(userLastVisitedAt))
		},
		'./device-session': sinon.stub().callsFake(() => ({ isNewSession: () => isNewSession }))
	});

	const determineNewArticlesSinceTime = subject.determineNewArticlesSinceTime;
	const filterArticlesToNewSinceTime = subject.filterArticlesToNewSinceTime;
	const setFakeClock = time => sinon.useFakeTimers({ now: new Date(time), shouldAdvanceTime: true });

	afterEach(() => {
		userLastVisitedAt = undefined;
		userNewArticlesSince = undefined;
		isNewSession = undefined;
		clock.restore();
	});

	describe('determineNewArticlesSinceTime', () => {

		describe('given the user is visiting for the first time today', () => {
			beforeEach(() => {
				userLastVisitedAt = SOME_TIME_YESTERDAY;
				userNewArticlesSince = SOME_TIME_YESTERDAY;
				isNewSession = true;
				clock = setFakeClock(TODAY_0800);
			});

			it('should return the EARLIEST_NEW_ARTICLES_TIME', () => {
				return determineNewArticlesSinceTime(userNewArticlesSince, uuid)
					.then(newArticlesSinceTime => {
						expect(newArticlesSinceTime).to.equal(toLocal(EARLIEST_NEW_ARTICLES_TIME));
					});
			});
		});

		describe('given the user has visited today', () => {
			beforeEach(() => {
				userLastVisitedAt = TODAY_0800;
				userNewArticlesSince = TODAY_0750;
			});

			describe('and returns within the device session', () => {
				it('should return the userNewArticlesSince time', () => {
					isNewSession = false;
					clock = setFakeClock(TODAY_0801);

					return determineNewArticlesSinceTime(userNewArticlesSince, uuid)
						.then(newArticlesSinceTime => {
							expect(newArticlesSinceTime).to.equal(userNewArticlesSince);
						});
				});
			});

			describe('and returns after the device session', () => {
				beforeEach(() => {
					isNewSession = true;
					clock = setFakeClock(TODAY_1000);
				});

				it('should return the userLastVisitedAt time', () => {
					return determineNewArticlesSinceTime(userNewArticlesSince, uuid)
						.then(newArticlesSinceTime => {
							expect(newArticlesSinceTime).to.equal(userLastVisitedAt);
						});
				});

				it('should return the EARLIEST_NEW_ARTICLES_TIME if userLastVisitedAt is invalid', () => {
					userLastVisitedAt = null;

					return determineNewArticlesSinceTime(userNewArticlesSince, uuid)
						.then(newArticlesSinceTime => {
							expect(newArticlesSinceTime).to.equal(toLocal(EARLIEST_NEW_ARTICLES_TIME));
						});
				});

			});
		});

		describe('given there is no (or invalid) userNewArticlesSince time set', () => {
			beforeEach(() => {
				clock = setFakeClock(TODAY_0801);
			});

			it('should return the userLastVisitedAt time if userLastVisitedAt is today', () => {
				userLastVisitedAt = TODAY_0800;

				return determineNewArticlesSinceTime(null, uuid)
					.then(newArticlesSinceTime => {
						expect(newArticlesSinceTime).to.equal(userLastVisitedAt);
					});
			});

			it('should return the EARLIEST_NEW_ARTICLES_TIME if userLastVisitedAt is not today', () => {
				userLastVisitedAt = SOME_TIME_YESTERDAY;

				return determineNewArticlesSinceTime(null, uuid)
					.then(newArticlesSinceTime => {
						expect(newArticlesSinceTime).to.equal(toLocal(EARLIEST_NEW_ARTICLES_TIME));
					});
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
				contentTimeStamp: TODAY_0600
			},
			{
				id: BEFORE_DISMISS_AND_READ,
				contentTimeStamp: TODAY_0600,
				hasBeenRead: true
			},
			{
				id: AFTER_DISMISS_AND_UNREAD,
				contentTimeStamp: TODAY_1000
			},
			{
				id: AFTER_DISMISS_AND_READ,
				contentTimeStamp: TODAY_1000,
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
