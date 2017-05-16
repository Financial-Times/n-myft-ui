const myFtClient = require('next-myft-client');
const relationshipConfig = require('../relationship-config')
const config = require('./config');

const relationshipsByName = {};

export function getRelationships (relationshipName) {
	return relationshipsByName[relationshipName] || [];
}

export function waitForRelationshipsToLoad (relationshipName) {
	return new Promise(resolve => {
		const subjectType = relationshipConfig[relationshipName].subjectType;
		const loadedKey = `${relationshipName}.${subjectType}`;

		if (myFtClient.loaded[loadedKey]) {
			relationshipsByName[relationshipName] = myFtClient.loaded[loadedKey];
			return resolve();
		} else {

			function storeAndResolve () {
				relationshipsByName[relationshipName] = myFtClient.loaded[loadedKey].items;
				resolve();
			}

			const loadEvent = `myft.user.${relationshipName}.${subjectType}.load`;
			document.body.addEventListener(loadEvent, storeAndResolve);

			// if it ain't here after n milliseconds, assume there are none
			setTimeout(() => {
				document.body.removeEventListener(loadEvent, storeAndResolve);
				resolve();
			}, config.assumeNoneTimeout);
		}
	})
}
