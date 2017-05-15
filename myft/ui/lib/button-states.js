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

export function setStateOfManyButtons (relationship, subjectIds, state, context = document) {

	if (!uiSelectorsMap.get(relationship)) {
		oErrors.warn(`Unexpected relationship passed to updateButton: ${relationship}`)
		return;
	}

	const buttonsSelector = uiSelectorsMap.get(relationship);
	const idProperty = idPropertiesMap.get(relationship);
	const forms = Array.from(context.querySelectorAll(buttonsSelector))
		.map(buttonEl => buttonEl.closest('form'));

	forms.forEach(el => {
		if (subjectIds.includes(el.getAttribute(idProperty))) {
			toggleButton(el.querySelector('button'), state);
		}
	});

}

export function setStateOfButton (relationship, subjectId, state, context = document) {
	return setStateOfManyButtons(relationship, [subjectId], state, context)
}
