const personaliseLinks = require('./personalise-links');
const loadedRelationships = require('./lib/loaded-relationships');
const buttonStates = require('./lib/button-states');

export default function (contextEl, ignoreLinks) {
	if (!ignoreLinks) {
		personaliseLinks(contextEl);
	}

	for (let relationshipName of uiSelectorsMap.keys()) {
		const relationships = loadedRelationships.getRelationships(relationshipName);
		if (relationships) {
			const subjectIds = relationships.items.map(item => item.uuid)
			buttonStates.setStateOfManyButtons(relationshipName, subjectIds, true, contextEl);
		}
	}
}
