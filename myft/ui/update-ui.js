import personaliseLinks from './personalise-links';
import * as loadedRelationships from './lib/loaded-relationships';
import * as buttonStates from './lib/button-states';
import relationshipConfig from './lib/relationship-config';

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
