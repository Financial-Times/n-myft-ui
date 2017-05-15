const oErrors = require('o-errors')
const idPropertiesMap = require('./relationship-maps/id-properties');
const uiSelectorsMap = require('./relationship-maps/ui-selectors');
const nextButtons = require('../../../myft-common');

export function toggleButton (buttonEl, pressed) {
	const alreadyPressed = buttonEl.getAttribute('aria-pressed') === 'true';
	if (pressed !== alreadyPressed) {
		nextButtons.toggleState(buttonEl);
	}
	buttonEl.removeAttribute('disabled');
}

export function setStateOfManyButtons (relationshipName, subjectIds, state, context = document) {

	if (!uiSelectorsMap.get(relationshipName)) {
		oErrors.warn(`Unexpected relationshipName passed to updateButton: ${relationshipName}`)
		return;
	}

	const buttonsSelector = uiSelectorsMap.get(relationshipName);
	const idProperty = idPropertiesMap.get(relationshipName);
	const forms = Array.from(context.querySelectorAll(buttonsSelector))
		.map(buttonEl => buttonEl.closest('form'));

	forms.forEach(el => {
		if (subjectIds.includes(el.getAttribute(idProperty))) {
			toggleButton(el.querySelector('button'), state);
		}
	});

}

export function setStateOfButton (relationshipName, subjectId, state, context = document) {
	return setStateOfManyButtons(relationshipName, [subjectId], state, context)
}
