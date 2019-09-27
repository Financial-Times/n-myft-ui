import {isToday, startOfDay} from 'date-fns';
import DeviceSession from './device-session';
import * as storage from './storage';
import sessionClient from 'next-session-client';
import {json as fetchJson} from 'fetchres';
import squashWhitespace from './lib/squash-whitespace';

const deviceSession = new DeviceSession();

export const fetchUserLastVisitedAt = () => {
	return sessionClient.uuid()
		.then(({uuid}) => {
			if (!uuid) {
				return Promise.reject();
			}

			const gqlQuery = `
				query userLastVisitedAt($uuid: String!) {
					user(uuid: $uuid) {
						lastSeenTimestamp
					}
				}
			`;
			const variables = {uuid};
			const url = `https://next-api.ft.com/v2/query?query=${squashWhitespace(gqlQuery)}&variables=${JSON.stringify(variables)}&source=next-myft`;
			const options = {credentials: 'include'};

			return fetch(url, options)
				.then(fetchJson)
				.then(body => body.data)
				.then(data => data.user.lastSeenTimestamp)
				.then(lastSeenTimestamp => new Date(lastSeenTimestamp));
		})
		.catch((e) => {

			global.console.error(e);
			return Promise.resolve(null)});
};

/**
 * @param {Date} now  Date representing the time now
 * @param {Date} previousFeedStartTime  Date representing the time we last used to determine if articles are new for the user
 * @return {Promise<Date>} date when we now determine articles to be 'new' for the user
 */
const determineFeedStartTime = (now, previousFeedStartTime) => {
	if (isToday(previousFeedStartTime) && !deviceSession.isNewSession()) {
		return Promise.resolve(previousFeedStartTime);
	}

	return fetchUserLastVisitedAt()
		.then(userLastVisitedAt => isToday(userLastVisitedAt) ? userLastVisitedAt : Promise.reject())
		.catch((e) => {

			global.console.error(e);
			return startOfDay(now)});
};

/**
 * Sets/updates the time after which articles must be published to count towards indicator count
 * @param {Date} now  Date representing the time now
 */
export default (now) =>
	determineFeedStartTime(now, storage.getFeedStartTime())
		.then(startTime => storage.setFeedStartTime(startTime));
