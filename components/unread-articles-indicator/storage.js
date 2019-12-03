import isValid from 'date-fns/isValid';

const DEVICE_SESSION_EXPIRY = 'deviceSessionExpiry';
const FEED_START_TIME = 'newArticlesSinceTime';
const LAST_INDICATOR_UPDATE = 'myFTIndicatorUpdate';
const INDICATOR_DISMISSED_TIME = 'myFTIndicatorDismissedAt';

const countChangeListeners = new Set();
const isISOString = str => typeof str === 'string' && str.charAt(10) === 'T';
const getStoredDate = key => {
	const value = window.localStorage.getItem(key);
	const date = new Date(value);

	return isISOString(value) && isValid(date) ? date : null;
};
let lastCount;

export const getDeviceSessionExpiry = () => getStoredDate(DEVICE_SESSION_EXPIRY);

export const setDeviceSessionExpiry = date => window.localStorage.setItem(DEVICE_SESSION_EXPIRY, date.toISOString());

export const getFeedStartTime = () => getStoredDate(FEED_START_TIME);

export const setFeedStartTime = date => window.localStorage.setItem(FEED_START_TIME, date.toISOString());

export const getIndicatorDismissedTime = () => getStoredDate(INDICATOR_DISMISSED_TIME);

export const setIndicatorDismissedTime = date => window.localStorage.setItem(INDICATOR_DISMISSED_TIME, date.toISOString());

export const isAvailable = () => {
	try {
		const storage = window.localStorage;
		const x = '__storage_test__';
		storage.setItem(x, x);
		storage.removeItem(x);
		return true;
	}
	catch(e) {
		return false;
	}
};


export const setLastUpdate = (update = {}) => {
	const toStore = Object.assign({}, update);
	if (update.time) toStore.time = update.time.toISOString();
	if (update.updateStarted) toStore.updateStarted = update.updateStarted.toISOString();
	window.localStorage.setItem(LAST_INDICATOR_UPDATE, JSON.stringify(toStore));
	fireListeners();
};

export const getLastUpdate = () => {
	try {
		const lastUpdate = JSON.parse(window.localStorage.getItem(LAST_INDICATOR_UPDATE));
		if (lastUpdate.time) lastUpdate.time = new Date(lastUpdate.time);
		if (lastUpdate.updateStarted) lastUpdate.updateStarted = new Date(lastUpdate.updateStarted);
		return lastUpdate;
	} catch (e) {}
};

export const updateLastUpdate = (update) => setLastUpdate(Object.assign({}, getLastUpdate(), update) );

export const addCountChangeListeners = listener => {
	if (!countChangeListeners.size) {
		window.addEventListener('storage', fireListeners);
	}
	countChangeListeners.add(listener);
};

function fireListeners () {
	const {count} = getLastUpdate() || {};
	if (count === lastCount) return;
	for (const listener of countChangeListeners) {
		listener(count || 0);
	}
	lastCount = count || 0;
}
