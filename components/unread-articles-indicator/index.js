import {startOfDay} from 'date-fns';
import * as storage from './storage';
import * as ui from './ui';
import update from './update';
import initialiseFeedStartTime from './initialise-feed-start-time';
import sessionClient from 'next-session-client';

const REFRESH_INTERVAL = 1000; //  how often each window should whether an update is due. This is the max time that the tabs can be out of sync for.

let initialFeedStartTime;

const updater = () =>
	update(new Date())
		.then(() => window.setTimeout(updater, REFRESH_INTERVAL));

// Used by next-myft-page to determine NEW tags on articles feed
export const getNewArticlesSinceTime = () => {
	if (initialFeedStartTime) {
		return Promise.resolve(initialFeedStartTime);
	}
	if (!storage.isAvailable()) {
		return Promise.resolve(startOfDay(new Date()));
	}
	return initialiseFeedStartTime(new Date())
		.then( (startTime) => {
			initialFeedStartTime = startTime;
			return initialFeedStartTime;
		});
};

export default (options = {}) => {
	if (!storage.isAvailable()) {
		return;
	}
	return sessionClient.uuid()
		.then(({uuid}) => {
			if (uuid) {
				return getNewArticlesSinceTime(new Date())
					.then(() => {
						ui.createIndicators(document.querySelectorAll('.o-header__top-link--myft'),
							Object.assign({
								onClick: () => {
									storage.updateLastUpdate({count: 0, time: new Date()});
									storage.setFeedStartTime(new Date());
								}
							},
							options));
						updater();
					});
			}
		});
};
