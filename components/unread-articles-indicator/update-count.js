import isAfter from 'date-fns/isAfter';
import parseISO from 'date-fns/parseISO';
import * as storage from './storage';
import countUnreadArticles from './count-unread-articles';
import * as tracking from './tracking';
import {UPDATE_INTERVAL, UPDATE_TIMEOUT} from './constants';


function latest (a, b) {
	if (!a) return b;
	if (!b) return a;
	return isAfter(parseISO(a), parseISO(b)) ? a : b;
}

export default async function updateCount (userId, now) {
	let doingUpdate;
	try {
		const lastUpdate = storage.getLastUpdate();

		const isFirstUpdate = !lastUpdate; // Always update if there has never been an update before.
		const noUpdateInProgress = !isFirstUpdate && (!lastUpdate.time || now.getTime() - lastUpdate.time.getTime() > UPDATE_INTERVAL);
		const updateInProgressHasTimedOut = !isFirstUpdate && (!lastUpdate.updateStarted || now.getTime() - lastUpdate.updateStarted.getTime() > UPDATE_TIMEOUT);

		if (isFirstUpdate || noUpdateInProgress && updateInProgressHasTimedOut) {

			storage.updateLastUpdate({updateStarted: now});

			const startTime = latest(storage.getFeedStartTime(), storage.getIndicatorDismissedTime());

			doingUpdate = true;
			const count = await countUnreadArticles(userId, startTime);
			if (!lastUpdate || count !== lastUpdate.count) {
				tracking.onCountChange(count, startTime);
			}
			storage.setLastUpdate({time: now, count, updateStarted: false});
		}
	} catch (error) {
		if (doingUpdate) storage.updateLastUpdate({updateStarted: false});
		throw error;
	}
};
