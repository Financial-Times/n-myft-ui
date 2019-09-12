import { isAfter, addMinutes } from 'date-fns';
import * as storage from './storage';
const SESSION_THRESHOLD_MINUTES = 30;

export default class DeviceSession {

	constructor () {
		this.expiry = storage.getDeviceSessionExpiry();
		const newExpiry = addMinutes(new Date(), SESSION_THRESHOLD_MINUTES).toISOString();
		storage.setDeviceSessionExpiry(newExpiry);
	}

	isNewSession () {
		if (this.expiry) {
			return isAfter(new Date(), this.expiry);
		} else {
			return true;
		}
	}

}
