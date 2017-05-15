const personaliseLinks = require('./personalise-links');
const myFtStuffOnPageLoad = require('./myft-stuff-on-page-load');
const buttonStates = require('./button-states');

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