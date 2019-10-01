import * as storage from './storage';
import countUnreadArticles from './count-unread-articles';
import * as ui from './ui';
import * as tracking from './tracking';

const UPDATE_INTERVAL = 1000 * 60 * 5; // how often to get an update from the server.
const UPDATE_TIMEOUT = 1000 * 60 * 10; // how long before we assume an update finished without tidying up.

export default function update (now) {
	const lastUpdate = storage.getLastUpdate();

	const readyToUpdate =
		// Always update if there has never been an update before.
		!lastUpdate || (
			// Update if an update is overdue, and
			(!lastUpdate.time || now.getTime() - lastUpdate.time.getTime() > UPDATE_INTERVAL) &&
			// there is no update underway, or
			// the update started so long ago that it must have failed or completed by now.
			(!lastUpdate.updateStarted || now.getTime() - lastUpdate.updateStarted.getTime() > UPDATE_TIMEOUT)
		);

	if (readyToUpdate) {

		storage.updateLastUpdate({updateStarted: now});

		const startTime = storage.getFeedStartTime();

		return countUnreadArticles(startTime)
			.then((count) => {

				ui.setCount(count);

				if( !lastUpdate || count !== lastUpdate.count ) {
					tracking.onCountChange(count, startTime);
				}

				storage.setLastUpdate({time: now, count, updateStarted: false});
			})
			.catch(() => storage.updateLastUpdate({updateStarted: false}));

	} else {
		ui.setCount(lastUpdate ? lastUpdate.count : 0);
		return Promise.resolve();
	}
};
