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

		beforeEach(() => {
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
					data-concept-id="some-concept-id"
					data-myft-ui="follow"
				>
					<button aria-pressed="false">
						Concept 2
					</button>
				</form>
				<form
					data-content-id="some-content-id"
					data-myft-ui="saved"
				>
					<button aria-pressed="false">
						Content 1
					</button>
				</form>
			`;
		})

		it('should set the state of the button in the form that matches the relationship and subject ID', () => {

			const relationship = 'followed';
			const subjectId = 'some-concept-id';

			buttonStates.setStateOfButton(relationship, subjectId, true, container);

			const pressedValues = Array.from(container.querySelectorAll('button')).map(buttonEl => buttonEl.getAttribute('aria-pressed'));
			expect(pressedValues)
				.to.deep.equal([
					'false',
					'true',
					'false'
				])
		});


		it('not update the states of buttons for forms that are not of the requested relationship, regardless of the ID', () => {

			const relationship = 'followed';
			const subjectId = 'some-content-id';

			buttonStates.setStateOfButton(relationship, subjectId, true, container);

			const pressedValues = Array.from(container.querySelectorAll('button')).map(buttonEl => buttonEl.getAttribute('aria-pressed'));
			expect(pressedValues)
				.to.deep.equal([
					'false',
					'false',
					'false'
				])
		});

		it('should not error when there are no buttons to find', () => {

			container.innerHTML = '<p>lol</p>';

			const relationship = 'followed';
			const subjectId = 'a-concept-id';

			buttonStates.setStateOfButton(relationship, subjectId, true, container);
		});
	});

	describe('setStateOfManyButtons', () => {
		
		beforeEach(() => {
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
					data-content-id="some-content-id"
					data-myft-ui="saved"
				>
					<button aria-pressed="false">
						Content 1
					</button>
				</form>
				<form
					data-content-id="some-other-content-id"
					data-myft-ui="saved"
				>
					<button aria-pressed="false">
						Content 2
					</button>
				</form>
				<form
					data-content-id="some-other-other-content-id"
					data-myft-ui="saved"
				>
					<button aria-pressed="false">
						Content 3
					</button>
				</form>
			`;
		})

		it('should set the state of the buttons in the forms that match the relationship and any of the subject IDs', () => {

			const relationship = 'saved';
			const subjectIds = ['some-other-content-id', 'some-other-other-content-id'];

			buttonStates.setStateOfManyButtons(relationship, subjectIds, true, container);

			const pressedValues = Array.from(container.querySelectorAll('button')).map(buttonEl => buttonEl.getAttribute('aria-pressed'));
			expect(pressedValues)
				.to.deep.equal([
					'false',
					'false',
					'true',
					'true'
				])
		});

	});
});
