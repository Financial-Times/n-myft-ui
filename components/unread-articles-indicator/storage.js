import { isValid } from 'date-fns';

const DEVICE_SESSION_EXPIRY = 'deviceSessionExpiry';
const NEW_ARTICLES_SINCE = 'newArticlesSinceTime';
const INDICATOR_DISMISSED_AT = 'myFTIndicatorDismissedAt';

const isISOString = str => typeof str === 'string' && str.charAt(10) === 'T';
const getStoredDate = key => {
	const value = window.localStorage.getItem(key);
	const date = new Date(value);

	return isISOString(value) && isValid(date) ? date.toISOString() : null;
};

export const getDeviceSessionExpiry = () => getStoredDate(DEVICE_SESSION_EXPIRY);

export const setDeviceSessionExpiry = isoDate => window.localStorage.setItem(DEVICE_SESSION_EXPIRY, isoDate);

export const getNewArticlesSinceTime = () => getStoredDate(NEW_ARTICLES_SINCE);

export const setNewArticlesSinceTime = isoDate => window.localStorage.setItem(NEW_ARTICLES_SINCE, isoDate);

export const getIndicatorDismissedTime = () => getStoredDate(INDICATOR_DISMISSED_AT);

export const setIndicatorDismissedTime = () => window.localStorage.setItem(INDICATOR_DISMISSED_AT, new Date().toISOString());

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
