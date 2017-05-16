const personaliseLinks = require('./personalise-links');
const loadedRelationships = require('./lib/loaded-relationships');
const buttonStates = require('./lib/button-states');
const relationshipConfig = require('./lib/relationship-config');

export default function (contextEl) {
	personaliseLinks(contextEl);
	Object.keys(relationshipConfig).forEach(relationshipName => {
		const relationships = loadedRelationships.getRelationships(relationshipName);
		if (relationships.length > 0) {
			const subjectIds = relationships.map(item => item.uuid);
			buttonStates.setStateOfManyButtons(relationshipName, subjectIds, true, contextEl);
		}
	});
}
