import sessionClient from 'next-session-client';
import { determineNewArticlesSinceTime, filterArticlesToNewSinceTime } from './chronology';
import * as storage from './storage';
import fetchNewArticles from './fetch-new-articles';
import { createIndicators, setCount } from './ui';
import * as tracking from './tracking';

const MAX_UPDATE_FREQUENCY = 1000 * 60 * 5;
let canUpdate = true;

const showUnreadArticlesCount = (uuid, newArticlesSinceTime, cause) => {
	if (canUpdate) {
		canUpdate = false;
		setTimeout(() => canUpdate = true, MAX_UPDATE_FREQUENCY);

		return fetchNewArticles(uuid, newArticlesSinceTime)
			.then(articles => filterArticlesToNewSinceTime(articles, storage.getIndicatorDismissedTime()))
			.then(newArticles => {
				const count = newArticles.length;

				setCount(count);
				tracking.countShown(count, newArticlesSinceTime, cause);
			})
			.catch(() => {
				canUpdate = true;
			});
	}

	return Promise.resolve();
};

let newArticlesSinceTime;

export const getNewArticlesSinceTime = () => {
	if (!newArticlesSinceTime) {
		newArticlesSinceTime = determineNewArticlesSinceTime(storage.getLastVisitedAt(), storage.getNewArticlesSinceTime());
		storage.setNewArticlesSinceTime(newArticlesSinceTime);
		storage.setLastVisitedAt();
	}

	return newArticlesSinceTime;
};

export default () => {
	const getUserId = sessionClient.uuid().then(({ uuid }) => uuid);

	createIndicators(document.querySelectorAll('.o-header__top-link--myft'));

	return getUserId
		.then(uuid => showUnreadArticlesCount(uuid, getNewArticlesSinceTime(), 'initial-update'))
		.then(() => {
			document.addEventListener('visibilitychange', () => {
				if (document.visibilityState === 'visible') {
					getUserId.then(uuid => showUnreadArticlesCount(uuid, getNewArticlesSinceTime(), 'page-visibility-change'));
				}
			});
		});
};
