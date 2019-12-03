import addMinutes from 'date-fns/addMinutes';
import isAfter from 'date-fns/isAfter';
import parseISO from 'date-fns/parseISO';
import * as storage from './storage';
const SESSION_THRESHOLD_MINUTES = 30;

export default class DeviceSession {

	constructor () {
		this.expiry = storage.getDeviceSessionExpiry();
		const newExpiry = addMinutes(new Date(), SESSION_THRESHOLD_MINUTES);
		storage.setDeviceSessionExpiry(newExpiry);
	}

	isNewSession () {
		if (this.expiry) {
			return isAfter(new Date(), parseISO(this.expiry));
		} else {
			return true;
		}
	}

}
