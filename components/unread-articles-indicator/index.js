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

export default () => {
	const newArticlesSinceTime = determineNewArticlesSinceTime(getLastVisitedAt(), getNewArticlesSinceTime());

	createIndicators(document.querySelectorAll('.o-header__top-link--myft'));

	return sessionClient.uuid()
		.then(({ uuid }) => fetchNewArticles(uuid, newArticlesSinceTime))
		.then(articles => filterArticlesToNewSinceTime(articles, getIndicatorDismissedTime()))
		.then(newArticles => {
			setCount(newArticles.length);
			setNewArticlesSinceTime(newArticlesSinceTime);
			setLastVisitedAt();
		})
		.catch(() => {});
};
