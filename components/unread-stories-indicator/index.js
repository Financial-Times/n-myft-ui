import { isAfter } from 'date-fns';
import sessionClient from 'next-session-client';
import { determineNewContentSinceTime } from './chronology';
import {
	getIndicatorDismissedTime,
	getLastVisitedAt,
	getNewContentSinceTime,
	setLastVisitedAt,
	setNewContentSinceTime
} from './storage';
import fetchNewContent from './fetch-new-content';
import { createIndicators, setCount } from './ui';

export default () => {
	const newContentSinceTime = determineNewContentSinceTime(getLastVisitedAt(), getNewContentSinceTime());
	const indicatorDismissedTime = getIndicatorDismissedTime();

	createIndicators(document.querySelectorAll('.o-header__top-link--myft'));

	return sessionClient.uuid()
		.then(({ uuid }) => fetchNewContent(uuid, newContentSinceTime))
		.then(articles => {
			const newArticles = articles.filter(article => {
				return article.hasBeenRead !== true && isAfter(article.publishedDate, indicatorDismissedTime);
			});

			setCount(newArticles.length);
			setNewContentSinceTime(newContentSinceTime);
			setLastVisitedAt();
		})
		.catch(() => {});
};
