const LAST_VISITED_AT = 'lastVisitedAt';
const NEW_ARTICLES_SINCE = 'newArticlesSinceTime';
const INDICATOR_DISMISSED_AT = 'myFTIndicatorDismissedAt';

const timestampToIsoDate = ts => new Date(ts).toISOString();

const getTimestampItemAsIsoDate = key => {
	const item = window.localStorage.getItem(key);
	const timestamp = Number(item);

	return !item || isNaN(timestamp) ? null : timestampToIsoDate(timestamp);
};

export const getLastVisitedAt = () => getTimestampItemAsIsoDate(LAST_VISITED_AT);

export const setLastVisitedAt = () => window.localStorage.setItem(LAST_VISITED_AT, String(Date.now()));

export const getNewArticlesSinceTime = () => getTimestampItemAsIsoDate(NEW_ARTICLES_SINCE);

export const setNewArticlesSinceTime = isoDate => window.localStorage.setItem(NEW_ARTICLES_SINCE, String(new Date(isoDate).getTime()));

export const getIndicatorDismissedTime = () => getTimestampItemAsIsoDate(INDICATOR_DISMISSED_AT);

export const setIndicatorDismissedTime = () => window.localStorage.setItem(INDICATOR_DISMISSED_AT, String(Date.now()));
