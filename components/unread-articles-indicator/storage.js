import { isValid } from 'date-fns';

const DEVICE_SESSION_EXPIRY = 'deviceSessionExpiry';
const FEED_START_TIME = 'newArticlesSinceTime';
const LAST_INDICATOR_UPDATE = 'myFTIndicatorUpdate';

const mockStorage = {
	getItem (key) {
		return this[key];
	},
	setItem (key, value) {
		this[key] = value;
	}
};

const isISOString = str => typeof str === 'string' && str.charAt(10) === 'T';
const getStoredDate = key => {
	const value = mockStorage.getItem(key);
	const date = new Date(value);

	return isISOString(value) && isValid(date) ? date : null;
};

export const getDeviceSessionExpiry = () => getStoredDate(DEVICE_SESSION_EXPIRY);

export const setDeviceSessionExpiry = date => mockStorage.setItem(DEVICE_SESSION_EXPIRY, date.toISOString());

export const getFeedStartTime = () => getStoredDate(FEED_START_TIME);

export const setFeedStartTime = date => mockStorage.setItem(FEED_START_TIME, date.toISOString());

export const isAvailable = () => {
	try {
		const storage = mockStorage;
		const x = '__storage_test__';
		storage.setItem(x, x);
		storage.removeItem(x);
		return true;
	}
	catch(e) {
		return false;
	}
};

export const setLastUpdate = (update) => mockStorage.setItem(LAST_INDICATOR_UPDATE, JSON.stringify(Object.assign( {}, update, update && update.time && {time: update.time.toISOString()})) );

export const getLastUpdate = () => {
	try {
		const update = JSON.parse(mockStorage.getItem(LAST_INDICATOR_UPDATE));
		return Object.assign({}, update, update && update.time && {time: new Date(update.time)});
	} catch (e) {

		global.console.error(e);
	}
};

export const updateLastUpdate = (update) => setLastUpdate( Object.assign({}, getLastUpdate(), update) );
