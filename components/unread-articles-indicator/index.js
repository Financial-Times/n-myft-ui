import {determineNewArticlesSinceTime, filterArticlesToNewSinceTime} from './chronology';
import fetchNewArticles from './fetch-new-articles';
import * as storage from './storage';
import * as tracking from './tracking';
import * as ui from './ui';

const UPDATE_INTERVAL = 1000 * 60 * 5;
let trackInitialCount = true;
let newArticlesSinceTime;

const showUnreadArticlesCount = (sinceTime) =>
	fetchNewArticles(sinceTime)
		.then(articles => filterArticlesToNewSinceTime(articles, storage.getIndicatorDismissedTime()))
		.then(newArticles => {
			const count = newArticles.length;

			ui.setCount(count);

			if (trackInitialCount) {
				tracking.countShown(count, sinceTime);
				trackInitialCount = false;
			}
		});

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

const update = () =>
	getNewArticlesSinceTime()
		.then(showUnreadArticlesCount)
		.then(() => {
			setTimeout(update, UPDATE_INTERVAL);
		});

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
		() => tracking.onVisibilityChange(ui.getState()));

	return update();
};
