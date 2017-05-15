const myFtClient = require('next-myft-client');
const typesMap = require('./relationship-maps/types');

const relationshipsByName = {};

export function getRelationships (relationshipName) {
	return relationshipsByName[relationshipName];
}

export function waitForRelationshipsToLoad (relationshipName) {
	return new Promise(resolve => {
		const nodeType = typesMap.get(relationshipName);
		const loadedKey = `${relationshipName}.${nodeType}`;

		if (myFtClient.loaded[loadedKey]) {
			relationshipsByName[relationshipName] = myFtClient.loaded[loadedKey];
			return resolve();
		} else {

			function storeAndResolve() {
				relationshipsByName[relationshipName] = myFtClient.loaded[loadedKey].items;
				resolve();
			}

			const loadEvent = `myft.user.${relationshipName}.${nodeType}.load`;
			document.body.addEventListener(loadEvent, storeAndResolve);

			// if it ain't here after 5 seconds, assume there are none
			setTimeout(() => {
				document.body.removeEventListener(loadEvent, storeAndResolve);
				resolve();
			}, 5 * 1000);
		}
	})
}
