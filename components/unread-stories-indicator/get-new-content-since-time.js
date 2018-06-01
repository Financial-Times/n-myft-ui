import { differenceInMinutes, isAfter } from 'date-fns';

const SAME_VISIT_THRESHOLD_MINUTES = 30;

const getEarliestNewContentSince = () => {
	const now = new Date();

	return new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate(), 5, 0, 0, 0)).toISOString();
};

const isValidPublishedSince = (dateToValidate, defaultPublishedSince) => {
	return typeof dateToValidate === 'string' && isAfter(dateToValidate, defaultPublishedSince);
};

const dateIsWithinSameVisitThreshold = date => differenceInMinutes(new Date(), date) <= SAME_VISIT_THRESHOLD_MINUTES;

export const getNewContentSinceTime = (userLastVisitedAt, userNewContentSince) => {
	const earliestNewContentSince = getEarliestNewContentSince();

	if (!isValidPublishedSince(userLastVisitedAt, earliestNewContentSince)) {
		return earliestNewContentSince;
	}

	if (dateIsWithinSameVisitThreshold(userLastVisitedAt)) {
		return isValidPublishedSince(userNewContentSince, earliestNewContentSince) ? userNewContentSince : earliestNewContentSince;
	} else {
		return userLastVisitedAt;
	}
};
