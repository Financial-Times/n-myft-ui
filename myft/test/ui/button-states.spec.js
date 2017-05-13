/* global expect */
const buttonStates = require('../../ui/button-states');
const expect = require('chai').expect;

describe('Buttons', () => {

	describe('toggleButton', () => {

		let container;

		beforeEach(() => {
			container = document.createElement('div');
		})

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
});
