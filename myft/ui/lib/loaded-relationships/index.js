import myFtClient from 'next-myft-client';
import relationshipConfig from '../relationship-config';
import * as loadedRelationshipsConfig from './config';

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
			}, loadedRelationshipsConfig.assumeNoneTimeout);
		}
	});
}

export function addRelationship (relationshipName, data) {
    if (relationshipsByName[relationshipName]) {
        const relationshipIdx = findRelationship(relationshipName, data.uuid);
        if(relationshipIdx === -1) {
        	relationshipsByName[relationshipName].push(data);
        }

	} else {
        relationshipsByName[relationshipName] = [data];
	}
}

export function removeRelationship (relationshipName, uuid) {
    const relationshipIdx = findRelationship(relationshipName, uuid);
    if(relationshipIdx !== -1) {
    	relationshipsByName[relationshipName].splice(relationshipIdx, 1);
    }
}

const findRelationship = (relationshipName, uuid) => {
	return relationshipsByName[relationshipName].findIndex(relationship => relationship.uuid === uuid);
};
