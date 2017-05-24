
import myFtClient from 'next-myft-client';
import relationshipConfigs from '../lib/relationship-config';
import * as buttonStates from '../lib/button-states';

const idProperty = relationshipConfigs['followed'].idProperty;

function getConceptsData (formEl, rawFormData) {
	const subjectIds = formEl.getAttribute(idProperty).split(',');
	const names = rawFormData.name.split(',');

	// CAPI2_CLEANUP
	let taxonomies = [];
	if (rawFormData.taxonomy) {
		taxonomies = rawFormData.taxonomy.split(',');
	}

	let directTypes = [];
	if (rawFormData.directType) {
		directTypes = rawFormData.directType.split(',');
	}

	return subjectIds.map((id, i) => {

		delete rawFormData.name;
		delete rawFormData.taxonomy; // CAPI2_CLEANUP
		delete rawFormData.type;

		const formData = Object.assign({
			name: names[i]
		}, rawFormData);

		// CAPI2_CLEANUP
		if(taxonomies[i]) {
			formData.taxonomy = taxonomies[i];
		}

		if(directTypes[i]) {
			formData.directType = directTypes[i];
		}

		return {
			id,
			formData
		};
	});
}

export function formIsFollowCollection (relationshipName, formEl) {
	return relationshipName === 'followed' && formEl.getAttribute(idProperty).includes(',');
}

export function doAction (action, userId, formEl, rawFormData) {
	return Promise.all(getConceptsData(formEl, rawFormData).map(concept => {
		return myFtClient[action]('user', userId, 'followed', 'concept', concept.id, concept.formData);
	}))
		// usually, buttons states are updated on e.g. a `myft.user.followed.concept.add` event, but for
		// collections, this must be triggered manually
		.then(() => buttonStates.toggleButton(formEl.querySelector('button'), action === 'add'));
}
