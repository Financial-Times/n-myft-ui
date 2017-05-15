const myFtClient = require('next-myft-client');
const typesMap = require('./relationship-maps/types');

const myFtStuff = {};

export function getMyFtStuff (relationship) {
	return myFtStuff[relationship];
}

export function waitForMyFtStuffToLoad (relationship) {
	return new Promise(resolve => {
		const nodeType = typesMap.get(relationship);
		const loadedKey = `${relationship}.${nodeType}`;

		if (myFtClient.loaded[loadedKey]) {
			myFtStuff[relationship] = myFtClient.loaded[loadedKey];
			return resolve();
		} else {

			function storeAndResolve() {
				myFtStuff[relationship] = myFtClient.loaded[loadedKey];
				resolve();
			}

			const loadEvent = `myft.user.${relationship}.${nodeType}.load`;
			document.body.addEventListener(loadEvent, storeAndResolve);

			setTimeout(() => {
				document.body.removeEventListener(loadEvent, storeAndResolve);
				resolve();
			}, 3 * 1000);
		}
	})
}
