/* global expect */
import { showIndicator } from '../ui';

describe('unread stories indicator - ui', () => {

	describe('showIndicator', () => {
		let containers;
		const mockContainer = document.createElement('div');

		mockContainer.classList.add('o-header__top-link--myft');

		beforeEach(() => {
			containers = [0, 1].map(() => {
				const cont = mockContainer.cloneNode(false);

				document.body.appendChild(cont);

				return cont;
			});
		});

		afterEach(() => {
			containers.forEach(container => container.remove());
		});

		describe('given the count is greater than 0', () => {
			const FIRST_COUNT = 3;
			const SECOND_COUNT = 4;

			beforeEach(() => {
				showIndicator(FIRST_COUNT);
			});

			it('should set a class on each container', () => {
				containers.forEach(container => {
					expect(container.classList.contains('myft__indicator-container')).to.equal(true);
				});
			});

			it('should add only one count element to each container', () => {
				showIndicator(SECOND_COUNT);
				containers.forEach(container => {
					const els = container.querySelectorAll('.myft__indicator');

					expect(els.length).to.equal(1);
				});
			});

			it('should set the count in the count element', () => {
				containers.forEach(container => {
					const el = container.querySelector('.myft__indicator');

					expect(el.innerText).to.equal(String(FIRST_COUNT));
				});
			});

			it('should clear the contents of the count element when count is zero', () => {
				showIndicator(0);
				containers.forEach(container => {
					const el = container.querySelector('.myft__indicator');

					expect(el.innerText).to.equal('');
				});
			});
		});
	});
});
