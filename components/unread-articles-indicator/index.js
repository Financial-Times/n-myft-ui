import sessionClient from 'next-session-client';
import { determineNewArticlesSinceTime, filterArticlesToNewSinceTime } from './chronology';
import fetchNewArticles from './fetch-new-articles';
import * as storage from './storage';
import * as tracking from './tracking';
import * as ui from './ui';

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

				ui.setCount(count);
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

	ui.createIndicators(document.querySelectorAll('.o-header__top-link--myft'), {
		onClick: () => {
			ui.setCount(0);
			storage.setIndicatorDismissedTime();
		}
	});

	return getUserId
		.then(uuid => showUnreadArticlesCount(uuid, getNewArticlesSinceTime(), 'initial-render'))
		.then(() => {
			document.addEventListener('visibilitychange', () => {
				if (document.visibilityState === 'visible') {
					getUserId.then(uuid => showUnreadArticlesCount(uuid, getNewArticlesSinceTime(), 'page-visibility-change'));
				}
			});
		});
};
