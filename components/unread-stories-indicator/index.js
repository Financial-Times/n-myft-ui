import sessionClient from 'next-session-client';
import { determineNewContentSinceTime, filterArticlesToNewSinceTime } from './chronology';
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

	createIndicators(document.querySelectorAll('.o-header__top-link--myft'));

	return sessionClient.uuid()
		.then(({ uuid }) => fetchNewContent(uuid, newContentSinceTime))
		.then(articles => filterArticlesToNewSinceTime(articles, getIndicatorDismissedTime()))
		.then(newArticles => {
			setCount(newArticles.length);
			setNewContentSinceTime(newContentSinceTime);
			setLastVisitedAt();
		})
		.catch(() => {});
};
