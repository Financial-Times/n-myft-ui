/* global expect */

const getDataFromInputs = require('../../myft/ui/myft-buttons/get-data-from-inputs');

describe('Get data from inputs', () => {

	let container;

	beforeEach(() => {
		container = document.createElement('div');
	});

	it('should return an object with all the info in the passed in input elements', () => {
		container.innerHTML = `
			<input type="hidden" name="hiddenProp" value="hiddenVal"></button>
			<button name="buttonProp" value="buttonVal"></button>
		`;

		expect(getDataFromInputs(Array.from(container.children))).to.deep.equal({
			buttonProp: 'buttonVal',
			hiddenProp: 'hiddenVal'
		});
	});

	it('should put input properties with names that start with `_rel.` into a nested `_rel` property', () => {
		container.innerHTML = `
			<input type="hidden" name="hiddenProp" value="hiddenVal"></button>
			<input type="hidden" name="_rel.prop1" value="relVal1"></button>
			<input type="hidden" name="_rel.prop2" value="relVal2"></button>
			<button name="buttonProp" value="buttonVal"></button>
		`;

		expect(getDataFromInputs(Array.from(container.children))).to.deep.equal({
			buttonProp: 'buttonVal',
			hiddenProp: 'hiddenVal',
			_rel: {
				prop1: 'relVal1',
				prop2: 'relVal2'
			}
		});
	});

	it('should not include a weird empty property if any of the inputs have no name or value', () => {
		container.innerHTML = `
			<input type="hidden" name="hiddenProp" value="hiddenVal"></button>
			<button></button>
		`;

		expect(getDataFromInputs(Array.from(container.children))).to.deep.equal({
			hiddenProp: 'hiddenVal'
		});
	});

});
