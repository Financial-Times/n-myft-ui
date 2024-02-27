import { isToday, startOfDay } from 'date-fns';
import DeviceSession from './device-session';
import * as storage from './storage';
import { json as fetchJson } from 'fetchres';

const deviceSession = new DeviceSession();

export const fetchUserLastVisitedAt = (userId) => {
	const url = '/__myft/users/:userId/last-seen?source=next-myft'.replace(
		':userId',
		userId
	);
	return fetch(url, { credentials: 'include' })
		.then(fetchJson)
		.then(({ lastSeen }) => new Date(lastSeen));
};

/**
 * @param {Date} now  Date representing the time now
 * @param {Date} previousFeedStartTime  Date representing the time we last used to determine if articles are new for the user
 * @return {Promise<Date>} date when we now determine articles to be 'new' for the user
 */
const determineFeedStartTime = (userId, now, previousFeedStartTime) => {
	if (
		previousFeedStartTime &&
		isToday(previousFeedStartTime) &&
		!deviceSession.isNewSession()
	) {
		return Promise.resolve(previousFeedStartTime);
	}

	return fetchUserLastVisitedAt(userId)
		.then((userLastVisitedAt) =>
			isToday(userLastVisitedAt) ? userLastVisitedAt : Promise.reject(new Error('No last visited user data today'))
		)
		.catch(() => startOfDay(now));
};

/**
 * Sets/updates the time after which articles must be published to count towards indicator count
 * @param {Date} now  Date representing the time now
 */
export default (userId, now) => {
	const previousFeedStartTime =
		storage.isAvailable() && storage.getFeedStartTime();
	return determineFeedStartTime(userId, now, previousFeedStartTime).then(
		(startTime) => {
			if (storage.isAvailable()) {
				storage.setFeedStartTime(startTime);
			}
			return startTime;
		}
	);
};
