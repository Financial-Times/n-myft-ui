import { differenceInMinutes, isAfter, subDays } from 'date-fns';

const SAME_VISIT_THRESHOLD_MINUTES = 30;

const getEarliestNewArticlesSince = () => {
	const now = new Date();
	const today10pm = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate(), 22, 0, 0, 0));

	return subDays(today10pm, 1).toISOString();
};

const isValidPublishedSince = (dateToValidate, defaultPublishedSince) => {
	return typeof dateToValidate === 'string' && isAfter(dateToValidate, defaultPublishedSince);
};

const dateIsWithinSameVisitThreshold = date => differenceInMinutes(new Date(), date) <= SAME_VISIT_THRESHOLD_MINUTES;

/**
 * @param {string} userLastVisitedAt    ISO date representing when a user last visited ft.com
 * @param {string} userNewArticlesSince  ISO date representing the time we last used to determine if articles are new for the user
 * @return {string} ISO date when we now determine articles to be 'new' for the user
 */
export const determineNewArticlesSinceTime = (userLastVisitedAt, userNewArticlesSince) => {
	const earliestNewArticlesSince = getEarliestNewArticlesSince();

	if (!isValidPublishedSince(userLastVisitedAt, earliestNewArticlesSince)) {
		return earliestNewArticlesSince;
	}

	if (dateIsWithinSameVisitThreshold(userLastVisitedAt)) {
		return isValidPublishedSince(userNewArticlesSince, earliestNewArticlesSince) ? userNewArticlesSince : earliestNewArticlesSince;
	} else {
		return userLastVisitedAt;
	}
};

export const filterArticlesToNewSinceTime = (articles, publishedAfterTime) => {
	return articles.filter(article => {
		return article.hasBeenRead !== true && isAfter(article.publishedDate, publishedAfterTime);
	});
};
