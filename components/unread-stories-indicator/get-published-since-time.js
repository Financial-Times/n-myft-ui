import { differenceInMinutes, isAfter } from 'date-fns';

const SAME_VISIT_THRESHOLD = 30;

const getDefaultPublishedSince = () => {
	const now = new Date();

	return new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate(), 5, 0, 0, 0)).toISOString();
};

const isValidPublishedSince = (dateToValidate, defaultPublishedSince) => {
	return typeof dateToValidate === 'string' && isAfter(dateToValidate, defaultPublishedSince);
};

const dateIsWithinSameVisitThreshold = date => differenceInMinutes(new Date(), date) <= SAME_VISIT_THRESHOLD;

export function getPublishedSinceTime (lastVisited, publishedSince) {
	const defaultPublishedSince = getDefaultPublishedSince();

	if (!isValidPublishedSince(lastVisited, defaultPublishedSince)) {
		return defaultPublishedSince;
	}

	if (dateIsWithinSameVisitThreshold(lastVisited)) {
		return isValidPublishedSince(publishedSince, defaultPublishedSince) ? publishedSince : defaultPublishedSince;
	} else {
		return lastVisited;
	}
}
