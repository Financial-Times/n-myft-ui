/* global expect */
const buttonStates = require('../../ui/button-states');
const expect = require('chai').expect;

describe('Buttons', () => {

	let container;

	beforeEach(() => {
		container = document.createElement('div');
	})

	describe('toggleButton', () => {

		it('should set an upressed button to pressed', () => {

			container.innerHTML = `
				<button aria-pressed="false">
					Test
				</button>
			`;
			const button = container.querySelector('button');

			// test set up correctly
			expect(button.getAttribute('aria-pressed')).to.equal('false');

			buttonStates.toggleButton(button, true);
			expect(button.getAttribute('aria-pressed')).to.equal('true');
		});

		it('should set a pressed button to unpressed', () => {

			container.innerHTML = `
				<button aria-pressed="true">
					Test
				</button>
			`;
			const button = container.querySelector('button');

			// test set up correctly
			expect(button.getAttribute('aria-pressed')).to.equal('true');

			buttonStates.toggleButton(button, false);
			expect(button.getAttribute('aria-pressed')).to.equal('false');
		});

		it('should remove the disabled attribute of the button', () => {

			container.innerHTML = `
				<button aria-pressed="true" disabled>
					Test
				</button>
			`;
			const button = container.querySelector('button');

			// test set up correctly
			expect(button.getAttribute('aria-pressed')).to.equal('true');

			buttonStates.toggleButton(button, false);
			expect(button.getAttribute('aria-pressed')).to.equal('false');
		});
	});

	describe('setStateOfButton', () => {

		it('should set the state of the button in the form that matches the relationship and subject ID', () => {
			container.innerHTML = `
				<form
					data-concept-id="foo"
					data-myft-ui="follow"
				>
					<button aria-pressed="false">
						Concept 1
					</button>
				</form>
				<form
					data-concept-id="the-right-concept-id"
					data-myft-ui="follow"
				>
					<button aria-pressed="false">
						Concept 2
					</button>
				</form>
				<form
					data-content-id="bar"
					data-myft-ui="saved"
				>
					<button aria-pressed="false">
						Content 1
					</button>
				</form>
			`;

			const relationship = 'followed';
			const subjectId = 'the-right-concept-id';

			buttonStates.setStateOfButton(relationship, subjectId, true, container);

			const pressedValues = Array.from(container.querySelectorAll('button')).map(buttonEl => buttonEl.getAttribute('aria-pressed'));
			expect(pressedValues)
				.to.deep.equal([
					'false',
					'true',
					'false'
				])
		});

		it.skip('should not error when there are no buttons to find', () => {
			throw new Error('TODO');
		});
	});
});
