import sessionClient from 'next-session-client';
import { determineNewContentSinceTime } from './determine-new-content-since-time';
import { getLastVisitedAt, getNewContentSinceTime, setLastVisitedAt, setNewContentSinceTime } from './storage';
import fetchNewContent from './fetch-new-content';
import { createIndicators, setCount } from './ui';

export default () => {
	const newContentSinceTime = determineNewContentSinceTime(getLastVisitedAt(), getNewContentSinceTime());

	createIndicators(document.querySelectorAll('.o-header__top-link--myft'));

	return sessionClient.uuid()
		.then(({ uuid }) => fetchNewContent(uuid, newContentSinceTime))
		.then(articles => {
			const unreadArticles = articles.filter(article => article.hasBeenRead !== true);

			setCount(unreadArticles.length);
			setNewContentSinceTime(newContentSinceTime);
			setLastVisitedAt();
		})
		.catch(() => {});
};
