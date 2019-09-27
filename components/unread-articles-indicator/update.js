import * as storage from './storage';
import countUnreadArticles from './count-unread-articles';
import * as ui from './ui';
import * as tracking from './tracking';

const UPDATE_INTERVAL = 1000 * 60 * 5; // how often to get an update from the server.

export default function update (now) {
	const lastUpdate = storage.getLastUpdate();

	const readyToUpdate = !lastUpdate ||
		!lastUpdate.inProgress && (!lastUpdate.time || now.getTime() - lastUpdate.time.getTime() > UPDATE_INTERVAL);

	if (readyToUpdate) {

		storage.updateLastUpdate({inProgress: true});

		const startTime = storage.getFeedStartTime();

		return countUnreadArticles(startTime)
			.then((count) => {

				ui.setCount(count);

				if( !lastUpdate || count !== lastUpdate.count ) {
					tracking.onCountChange(count, startTime);
				}

				storage.setLastUpdate({time: now, count, inProgress: false});
			})
			.catch((e) => {

				global.console.error(e);
				return storage.updateLastUpdate({inProgress: false})});

	} else {
		ui.setCount(lastUpdate ? lastUpdate.count : 0);
		return Promise.resolve();
	}
};
