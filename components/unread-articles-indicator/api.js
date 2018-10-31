import sessionClient from 'next-session-client';
import { json as fetchJson } from 'fetchres';
const removeLineBreaks = str => encodeURIComponent(str.replace(/\s+/g, ' '));

export const fetchUserLastVisitedAt = () => {
	return sessionClient.uuid()
		.then(({ uuid }) => uuid)
		.then(uuid => {
			const gqlQuery = `
				query userLastVisitedAt($uuid: String!) {
					user(uuid: $uuid) {
						lastSeenTimestamp
					}
				}
			`;
			const variables = { uuid };
			const url = `https://next-api.ft.com/v2/query?query=${removeLineBreaks(gqlQuery)}&variables=${JSON.stringify(variables)}&source=next-myft`;
			const options = { credentials: 'include' };

			return fetch(url, options);
		})
		.then(fetchJson)
		.then(body => body.data)
		.then(data => data.user.lastSeenTimestamp)
		.catch(() => Promise.resolve(null));
};
