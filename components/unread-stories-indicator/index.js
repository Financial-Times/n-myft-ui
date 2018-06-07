import sessionClient from 'next-session-client';
import { determineNewContentSinceTime } from './determine-new-content-since-time';
import { getLastVisitedAt, getNewContentSinceTime, setLastVisitedAt, setNewContentSinceTime } from './storage';
import fetchNewContent from './fetch-new-content';
import { showIndicator } from './ui';

export default () => {
	const newContentSinceTime = determineNewContentSinceTime(getLastVisitedAt(), getNewContentSinceTime());

	return sessionClient.uuid()
		.then(({ uuid }) => fetchNewContent(uuid, newContentSinceTime))
		.then(articles => {
			const unreadArticles = articles.filter(article => !article.hasBeenRead);

			showIndicator(unreadArticles.length);
			setNewContentSinceTime(newContentSinceTime);
			setLastVisitedAt();
		})
		.catch(() => {});
};
