import { isAfter, isToday, startOfDay } from 'date-fns';
import { fetchUserLastVisitedAt } from './api';
import DeviceSession from './device-session';

const deviceSession = new DeviceSession();

/**
 * @param {string} userNewArticlesSince  ISO date representing the time we last used to determine if articles are new for the user
 * @param {string} uuid  User uuid
 * @return {string} ISO date when we now determine articles to be 'new' for the user
 */
export const determineNewArticlesSinceTime = userNewArticlesSince => {
	if (isToday(userNewArticlesSince) && !deviceSession.isNewSession()) {
		return Promise.resolve(userNewArticlesSince);
	}

	const earliestNewArticlesSince = startOfDay(new Date()).toISOString();

	return fetchUserLastVisitedAt()
		.then(userLastVisitedAt => {
			return isToday(userLastVisitedAt) ? userLastVisitedAt : earliestNewArticlesSince;
		})
		.catch(() => {
			return earliestNewArticlesSince;
		});
};

export const filterArticlesToNewSinceTime = (articles, publishedAfterTime) => {
	return articles.filter(article => {
		return article.hasBeenRead !== true && isAfter(article.contentTimeStamp, publishedAfterTime);
	});
};
