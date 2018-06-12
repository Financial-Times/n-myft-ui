import sessionClient from 'next-session-client';
import { determineNewArticlesSinceTime, filterArticlesToNewSinceTime } from './chronology';
import {
	getIndicatorDismissedTime,
	getLastVisitedAt,
	getNewArticlesSinceTime,
	setLastVisitedAt,
	setNewArticlesSinceTime
} from './storage';
import fetchNewArticles from './fetch-new-articles';
import { createIndicators, setCount } from './ui';

const MAX_UPDATE_FREQUENCY = 1000 * 60 * 5;
let canUpdate = true;

const showUnreadArticlesCount = (uuid, newArticlesSinceTime) => {
	if (canUpdate) {
		canUpdate = false;
		setTimeout(() => { canUpdate = true; }, MAX_UPDATE_FREQUENCY);

		return fetchNewArticles(uuid, newArticlesSinceTime)
			.then(articles => filterArticlesToNewSinceTime(articles, getIndicatorDismissedTime()))
			.then(newArticles => setCount(newArticles.length))
			.catch(() => {});
	}

	return Promise.resolve();
};

export default () => {
	const newArticlesSinceTime = determineNewArticlesSinceTime(getLastVisitedAt(), getNewArticlesSinceTime());
	const getUserId = sessionClient.uuid().then(({ uuid }) => uuid);

	createIndicators(document.querySelectorAll('.o-header__top-link--myft'));

	return getUserId
		.then(uuid => showUnreadArticlesCount(uuid, newArticlesSinceTime))
		.then(() => {
			setNewArticlesSinceTime(newArticlesSinceTime);
			setLastVisitedAt();

			document.addEventListener('visibilitychange', () => {
				if (document.visibilityState === 'visible') {
					getUserId.then(uuid => showUnreadArticlesCount(uuid, newArticlesSinceTime));
				}
			});
		});
};
