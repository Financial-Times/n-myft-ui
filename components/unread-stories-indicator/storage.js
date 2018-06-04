const LAST_VISITED_AT = 'lastVisitedAt';
const NEW_CONTENT_SINCE = 'newContentSinceTime';

const timestampToIsoDate = ts => new Date(ts).toISOString();

const getTimestampItemAsIsoDate = key => {
	const item = window.localStorage.getItem(key);
	const timestamp = Number(item);

	return !item || isNaN(timestamp) ? null : timestampToIsoDate(timestamp);
};

export const getLastVisitedAt = () => getTimestampItemAsIsoDate(LAST_VISITED_AT);

export const setLastVisitedAt = () => window.localStorage.setItem(LAST_VISITED_AT, String(Date.now()));

export const getNewContentSinceTime = () => getTimestampItemAsIsoDate(NEW_CONTENT_SINCE);

export const setNewContentSinceTime = isoDate => window.localStorage.setItem(NEW_CONTENT_SINCE, String(new Date(isoDate).getTime()));
