import myFtClient from 'next-myft-client';
import relationshipConfigs from '../../myft/ui/lib/relationship-config';
import * as buttonStates from '../../myft/ui/lib/button-states';
import uuidv4 from '../../myft/ui/lib/uuid';

const { idProperty } = relationshipConfigs.followed;

function getConceptsData (formEl, rawFormData) {
	const subjectIds = formEl.getAttribute(idProperty).split(',');
	const names = rawFormData.name.split(',');
	const directTypes = rawFormData.directType ? rawFormData.directType.split(',') : [];

	const eventId = uuidv4();

	return subjectIds.map((id, i) => {

		delete rawFormData.name;
		delete rawFormData.type;

		const formData = Object.assign({
			name: names[i],
			_rel: {
				eventId,
				eventType:'coll-add-all'
			}
		}, rawFormData);

		if (directTypes[i]) {
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
