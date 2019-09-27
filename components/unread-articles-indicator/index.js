import * as storage from './storage';
import * as ui from './ui';
import update from './update';
import initialiseFeedStartTime from './initialise-feed-start-time';
import sessionClient from 'next-session-client';

const REFRESH_INTERVAL = 1000; //  how often each window should whether an update is due. This is the max time that the tabs can be out of sync for.

const updater = () =>
	update(new Date())
		.then(() => window.setTimeout(updater, REFRESH_INTERVAL));


export default (options = {}) => {
	if (!storage.isAvailable()) {
		return;
	}
	return sessionClient.uuid()
		.then(({uuid}) => {
			if (uuid) {
				return initialiseFeedStartTime(new Date())
					.then(() => {
						ui.createIndicators(document.querySelectorAll('.o-header__top-link--myft'),
							Object.assign({
								onClick: () => {
									ui.setCount(0);
									storage.setFeedStartTime(new Date());
								}
							},
							options));
						updater();
					});
			}
		});
};
