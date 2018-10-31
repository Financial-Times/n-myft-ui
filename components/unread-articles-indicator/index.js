import sessionClient from 'next-session-client';
import { determineNewArticlesSinceTime, filterArticlesToNewSinceTime } from './chronology';
import fetchNewArticles from './fetch-new-articles';
import * as storage from './storage';
import * as tracking from './tracking';
import * as ui from './ui';

const MAX_UPDATE_FREQUENCY = 1000 * 60 * 5;
let canUpdate = true;

const showUnreadArticlesCount = ({ uuid, newArticlesSinceTime, withTracking = false }) => {
	if (canUpdate && uuid) {
		canUpdate = false;
		setTimeout(() => canUpdate = true, MAX_UPDATE_FREQUENCY);

		return fetchNewArticles(uuid, newArticlesSinceTime)
			.then(articles => filterArticlesToNewSinceTime(articles, storage.getIndicatorDismissedTime()))
			.then(newArticles => {
				const count = newArticles.length;

				ui.setCount(count);

				if (withTracking) {
					tracking.countShown(count, newArticlesSinceTime);
				}
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
		return determineNewArticlesSinceTime(storage.getNewArticlesSinceTime())
			.then(timestamp => {
				storage.setNewArticlesSinceTime(timestamp);
				newArticlesSinceTime = timestamp;
				return newArticlesSinceTime;
			});
	}

	return Promise.resolve(newArticlesSinceTime);
};

export default () => {
	if (!storage.isAvailable()) {
		return;
	}

	ui.createIndicators(document.querySelectorAll('.o-header__top-link--myft'), {
		onClick: () => {
			ui.setCount(0);
			storage.setIndicatorDismissedTime();
		}
	});

	const userIdPromise = sessionClient.uuid().then(({ uuid }) => uuid);
	const newArticleSincePromise = getNewArticlesSinceTime();

	return Promise.all([userIdPromise, newArticleSincePromise])
		.then(([uuid, newArticlesSinceTime]) => showUnreadArticlesCount({
			uuid,
			newArticlesSinceTime,
			withTracking: true
		}))
		.then(() => {
			document.addEventListener('visibilitychange', () => {
				if (document.visibilityState === 'visible') {
					Promise.all([userIdPromise, newArticleSincePromise])
						.then(([uuid, newArticlesSinceTime]) => showUnreadArticlesCount({
							uuid,
							newArticlesSinceTime
						}));
				}
			});
		});
};
