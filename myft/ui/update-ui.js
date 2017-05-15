const personaliseLinks = require('./personalise-links');
const loadedRelationships = require('./lib/loaded-relationships');
const buttonStates = require('./lib/button-states');
const uiSelectorsMap = require('./lib/relationship-maps/ui-selectors');

export default function (contextEl, ignoreLinks) {
	if (!ignoreLinks) {
		personaliseLinks(contextEl);
	}

	for (let relationshipName of uiSelectorsMap.keys()) {
		const relationships = loadedRelationships.getRelationships(relationshipName);
		if (relationships.length > 0) {
			const subjectIds = relationships.map(item => item.uuid);
			buttonStates.setStateOfManyButtons(relationshipName, subjectIds, true, contextEl);
		}
	}
}
