import startOfDay from 'date-fns/startOfDay';
import * as storage from './storage';
import * as ui from './ui';
import updateCount from './update-count';
import initialiseFeedStartTime from './initialise-feed-start-time';
import sessionClient from 'next-session-client';
import {UPDATE_INTERVAL} from './constants';

let shouldPoll;
let updateTimeout;
let initialFeedStartTime;
let userId;

const isMyftFeedPage = window.location.pathname.indexOf('/myft/following') === 0;
const doUpdate = () => updater().catch(stopPolling);

export default async (options = {}) => {
	try {
		if (!storage.isAvailable()) return;

		const myftHeaderLink = document.querySelectorAll('.o-header__top-link--myft');
		const uiOpts = Object.assign({onClick: setDismissed, flags: {}}, options);
		shouldPoll = uiOpts.flags.MyFT_UnreadArticlesIndicatorPolling;

		await getNewArticlesSinceTime();

		const {count = 0} = storage.getLastUpdate() || {};
		ui.createIndicators(myftHeaderLink, uiOpts);
		ui.setCount(count);

		document.addEventListener('visibilitychange', onVisibilityChange);
		storage.addCountChangeListeners(newCount => ui.setCount(newCount));
		if (isMyftFeedPage) setDismissed();
		return updater();
	} catch(e) {

	}
};

async function getValidSession () {
	if (!userId) {
		const {uuid} = await sessionClient.uuid();
		if (!uuid) throw new Error('No userId');
		userId = uuid;
	}
	return userId;
}

// Export used in next-myft -page to determine whether to add "New" label to articles in feed
export async function getNewArticlesSinceTime () {
	const user = await getValidSession();
	const dayStart = startOfDay(new Date());

	if (!initialFeedStartTime && storage.isAvailable()) {
		try {
			initialFeedStartTime = await initialiseFeedStartTime(user, new Date());
		} catch(e) {}
	}

	return initialFeedStartTime || dayStart;
}

async function updater () {
	const user = await getValidSession();
	await updateCount(user, new Date());
	if (!shouldPoll) return;
	updateTimeout = window.setTimeout(doUpdate, UPDATE_INTERVAL);
}

async function onVisibilityChange () {
	if (document.visibilityState !== 'visible') return;
	try {
		await getValidSession();
		await getNewArticlesSinceTime();
		if (updateTimeout) window.clearTimeout(updateTimeout);
		await updater();
	} catch(e) {
		stopPolling();
	}
}

function stopPolling () {
	userId = undefined;
	if (updateTimeout) {
		window.clearTimeout(updateTimeout);
	}
}

function setDismissed () {
	storage.updateLastUpdate({count: 0, time: new Date()});
	storage.setIndicatorDismissedTime(new Date());
}
