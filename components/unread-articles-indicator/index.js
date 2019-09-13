import {determineNewArticlesSinceTime, filterArticlesToNewSinceTime} from './chronology';
import fetchNewArticles from './fetch-new-articles';
import * as storage from './storage';
import * as tracking from './tracking';
import * as ui from './ui';

const MAX_UPDATE_FREQUENCY = 1000 * 60 * 5;
let canUpdate = true;

const showUnreadArticlesCount = (newArticlesSinceTime, withTracking = false) => {
	if (canUpdate) {
		canUpdate = false;
		setTimeout(() => canUpdate = true, MAX_UPDATE_FREQUENCY);

		return fetchNewArticles(newArticlesSinceTime)
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
			.then(isoDate => {
				storage.setNewArticlesSinceTime(isoDate);
				newArticlesSinceTime = isoDate;

				return newArticlesSinceTime;
			});
	}

	return Promise.resolve(newArticlesSinceTime);
};

export default (options = {}) => {
	if (!storage.isAvailable()) {
		return;
	}

	ui.createIndicators(document.querySelectorAll('.o-header__top-link--myft'),
		Object.assign({
			onClick: () => {
				ui.setCount(0);
				storage.setIndicatorDismissedTime();
			}
		},
		options));

	document.addEventListener('visibilitychange',
		() => tracking.onVisibilityChange(ui.getState()),
		false);

	return getNewArticlesSinceTime()
		.then(newArticlesSinceTime => showUnreadArticlesCount(newArticlesSinceTime, true))
		.then(() => {
			document.addEventListener('visibilitychange', () => {
				if (document.visibilityState === 'visible') {
					getNewArticlesSinceTime().then(showUnreadArticlesCount);
				}
			});
		});
};
