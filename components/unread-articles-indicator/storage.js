import { isValid } from 'date-fns';

const DEVICE_SESSION_EXPIRY = 'deviceSessionExpiry';
const FEED_START_TIME = 'newArticlesSinceTime';
const LAST_INDICATOR_UPDATE = 'myFTIndicatorUpdate';

const isISOString = str => typeof str === 'string' && str.charAt(10) === 'T';
const getStoredDate = key => {
	const value = window.localStorage.getItem(key);
	const date = new Date(value);

	return isISOString(value) && isValid(date) ? date : null;
};

export const getDeviceSessionExpiry = () => getStoredDate(DEVICE_SESSION_EXPIRY);

export const setDeviceSessionExpiry = date => window.localStorage.setItem(DEVICE_SESSION_EXPIRY, date.toISOString());

export const getFeedStartTime = () => getStoredDate(FEED_START_TIME);

export const setFeedStartTime = date => window.localStorage.setItem(FEED_START_TIME, date.toISOString());

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

export const setLastUpdate = (update) =>
	window.localStorage.setItem(LAST_INDICATOR_UPDATE,
		JSON.stringify(
			Object.assign(
				{},
				update,
				update && update.time && {time: update.time.toISOString()},
				update && update.updateStarted && {updateStarted: update.updateStarted.toISOString()}
			)
		)
	);

export const getLastUpdate = () => {
	try {
		const update = JSON.parse(window.localStorage.getItem(LAST_INDICATOR_UPDATE));
		return Object.assign(
			{},
			update,
			update && update.time && {time: new Date(update.time)},
			update && update.updateStarted && {updateStarted: new Date(update.updateStarted)}
		);
	} catch (e) {}
};

export const updateLastUpdate = (update) => setLastUpdate( Object.assign({}, getLastUpdate(), update) );
