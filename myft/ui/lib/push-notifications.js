import instantAlertsConfirmation from '../../../components/instant-alerts-confirmation';
import myftClient from 'next-myft-client';
import getToken from '../lib/get-csrf-token';

const csrfToken = getToken();
const isLocalOrHTTPS = document.location.protocol === 'https:' ||
	document.location.href.indexOf('local') >= 0;

let isServiceWorkerInitialised = false;

const fcmPublicKey = 'BFJGSlVTZ08KYS3heiwOovUPEURcYea478jEXXA5luZ1wo6O6MJ_o2NQckxHudMxa15tOh3YcjDZ-_bKZkPG274';
let subscribeOptions;

function urlB64ToUint8Array (base64String) {
	const padding = '='.repeat((4 - base64String.length % 4) % 4);
	const base64 = (base64String + padding)
		.replace(/\-/g, '+')
		.replace(/_/g, '/');

	const rawData = window.atob(base64);
	const outputArray = new Uint8Array(rawData.length);

	for (let i = 0; i < rawData.length; ++i) {
		outputArray[i] = rawData.charCodeAt(i);
	}
	return outputArray;
}

function endpointWorkaround (pushSubscription) {
	// Make sure we only mess with GCM
	if (pushSubscription.endpoint.indexOf('https://android.googleapis.com/gcm/send') !== 0) {
		return pushSubscription.endpoint;
	}

	let mergedEndpoint = pushSubscription.endpoint;
	// Chrome 42 + 43 will not have the subscriptionId attached
	// to the endpoint.
	if (pushSubscription.subscriptionId &&
		pushSubscription.endpoint.indexOf(pushSubscription.subscriptionId) === -1) {
		// Handle version 42 where you have separate subId and Endpoint
		mergedEndpoint = pushSubscription.endpoint + '/' +
			pushSubscription.subscriptionId;
	}
	return mergedEndpoint;
}

function sendSubscriptionToServer (subscription, isRemove) {

	return myftClient.init()
		.then(() => myftClient.getAll('enabled', 'endpoint'))
		.then(function (currentSubscription) {
			let endpoints = [];
			let thisEndpoint = endpointWorkaround(subscription);

			if (currentSubscription && currentSubscription.items && currentSubscription.items.length) {
				endpoints = currentSubscription.items;
			}

			const authKey = subscription.getKey ? btoa(String.fromCharCode.apply(null, new Uint8Array(subscription.getKey('p256dh')))) : '';
			const authSecret = subscription.getKey ? btoa(String.fromCharCode.apply(null, new Uint8Array(subscription.getKey('auth')))) : '';
			const index = endpoints.indexOf(thisEndpoint);

			if (isRemove || (!thisEndpoint && index >= 0)) {
				myftClient.remove('user', null, 'enabled', 'endpoint', encodeURIComponent(thisEndpoint), {token: csrfToken});
			} else if (index < 0) {
				myftClient.add('user', null, 'enabled', 'endpoint', encodeURIComponent(thisEndpoint), {
					authKey: authKey,
					authSecret: authSecret,
					token: csrfToken
				});
			}
			return true;
		});

}

function enableInstantAlerts (conceptId) {
	return myftClient.init()
		.then(() => myftClient.add('user', null, 'followed', 'concept', conceptId, {
				token: csrfToken,
				_rel: {instant: 'true'}
			})
		);
}

// Once the service worker is registered set the initial state
// Returns Rejected if not supported, true if subscribed, false if not subscribed
export function init (fcmSwitch) {

	if (!isLocalOrHTTPS) {
		return Promise.reject();
	}

	// Are Notifications supported in the service worker?
	if (!(window.ServiceWorkerRegistration) || !('showNotification' in window.ServiceWorkerRegistration.prototype)) {
		return Promise.reject();
	}

	// Check if push messaging is supported
	if (!('PushManager' in window)) {
		return Promise.reject();
	}

	subscribeOptions = fcmSwitch ? {
		userVisibleOnly: true,
		applicationServerKey: urlB64ToUint8Array(fcmPublicKey)
	} : {
		userVisibleOnly: true
	};

	// We need the service worker registration to check for a subscription
	return navigator.serviceWorker.ready.then(function (serviceWorkerRegistration) {
		isServiceWorkerInitialised = true;
		// Do we already have a push message subscription?
		serviceWorkerRegistration.pushManager.getSubscription()
			.then(function (subscription) {
				// Enable any UI which subscribes / unsubscribes from
				// push messages.
				if (subscription) {
					// We aren't subscribed to push, so set UI
					// to allow the user to enable push
					// Keep your server in sync with the latest subscriptionId
					sendSubscriptionToServer(subscription);
					return true;
				} else {
					return false;
				}
			});
	});
}

// Returns true on success, or Rejected otherwise
export function subscribe () {

	return navigator.serviceWorker.ready.then(function (serviceWorkerRegistration) {
		serviceWorkerRegistration.pushManager.subscribe(subscribeOptions)
			.then(function (subscription) {
				return sendSubscriptionToServer(subscription);
			});
	});
}

// Returns true on success, false if no subscription, or Rejected otherwise
export function unsubscribe () {

	return navigator.serviceWorker.ready.then(function (serviceWorkerRegistration) {
		// To unsubscribe from push messaging, you need get the
		// subscription object, which you can call unsubscribe() on.
		serviceWorkerRegistration.pushManager.getSubscription().then(
			function (subscription) {
				// Check we have a subscription to unsubscribe
				if (!subscription) {
					return false;
				}

				// We have a subscription, so call unsubscribe on it
				return subscription.unsubscribe()
					.then(() => sendSubscriptionToServer(subscription, true));
			});
	});
}

export function offerInstantAlerts (conceptId) {
	if (isServiceWorkerInitialised && Notification.permission !== 'denied') {
		const overlay = instantAlertsConfirmation();
		overlay.context.addEventListener('oOverlay.ready', () => {
			const yesButton = overlay.context.querySelector('.js-instant-alerts-confirmation-yes');
			yesButton.addEventListener('click', () => {
				overlay.close();
				subscribe();
				enableInstantAlerts(conceptId);
			});
			const noButton = overlay.context.querySelector('.js-instant-alerts-confirmation-no');
			noButton.addEventListener('click', () => {
				overlay.close();
			});
		}, false);
	}
}
