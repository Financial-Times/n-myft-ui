const personaliseLinks = require('./personalise-links');
const loadedRelationships = require('./lib/loaded-relationships');
const buttonStates = require('./lib/button-states');

export default function (contextEl, ignoreLinks) {
	if (!ignoreLinks) {
		personaliseLinks(contextEl);
	}

	for (let relationship of uiSelectorsMap.keys()) {
		const relationships = loadedRelationships.getRelationships(relationship);
		if (relationships) {
			const subjectIds = relationships.items.map(item => item.uuid)
			buttonStates.setStateOfManyButtons(relationship, subjectIds, true, contextEl);
		}
	}
}