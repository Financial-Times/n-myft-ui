const personaliseLinks = require('./personalise-links');
const myFtStuffOnPageLoad = require('./lib/myft-stuff-on-page-load');
const buttonStates = require('./lib/button-states');

export default function (contextEl, ignoreLinks) {
	if (!ignoreLinks) {
		personaliseLinks(contextEl);
	}

	for (let relationship of uiSelectorsMap.keys()) {
		const loadedRelationships = myFtStuffOnPageLoad.getMyFtStuff(relationship);
		if (loadedRelationships) {
			const subjectIds = loadedRelationships.items.map(item => item.uuid)
			buttonStates.setStateOfManyButtons(relationship, subjectIds, true, contextEl);
		}
	}
}