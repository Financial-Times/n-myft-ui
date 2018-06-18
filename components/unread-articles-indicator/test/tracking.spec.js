/* global expect */
import * as tracking from '../tracking';

describe('unread-articles-indicator tracking', () => {
	describe('countShown', () => {
		let dispatchedEvent;
		const COUNT = 3;
		const NEW_ARTICLES_SINCE_TIME = '2018-06-18T14:22:51.098Z';
		const CAUSE = 'the-cause';

		beforeEach(() => {
			dispatchedEvent = null;
			document.addEventListener('oTracking.event', event => dispatchedEvent = event);
		});

		it('should should dispatch the event', () => {
			tracking.countShown(COUNT, NEW_ARTICLES_SINCE_TIME, CAUSE);

			expect(dispatchedEvent.detail).to.deep.equal({
				category: 'unread-articles-indicator',
				action: 'render',
				count: COUNT,
				newArticlesSinceTime: NEW_ARTICLES_SINCE_TIME,
				cause: CAUSE
			});
		});
	});
});
