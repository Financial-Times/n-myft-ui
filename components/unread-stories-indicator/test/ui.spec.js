/* global expect */
import sinon from 'sinon';

describe('unread stories indicator - ui', () => {
	let ui;
	let mockStorage;

	beforeEach(() => {
		mockStorage = {
			getIndicatorDismissedTime: sinon.stub(),
			setIndicatorDismissedTime: sinon.stub(),
			getNewContentSinceTime: sinon.stub()
		};
		ui = require('inject-loader!../ui')({
			'./storage': mockStorage
		});
	});

	describe('createIndicators', () => {
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

		describe('createIndicators', () => {
			beforeEach(() => {
				ui.createIndicators(containers);
			});

			it('should set a class on each container', () => {
				containers.forEach(container => {
					expect(container.classList.contains('myft__indicator-container')).to.equal(true);
				});
			});

			it('should add a count element to each container', () => {
				containers.forEach(container => {
					const els = container.querySelectorAll('.myft__indicator');

					expect(els.length).to.equal(1);
				});
			});
		});

		describe('setCount', () => {
			beforeEach(() => {
				ui.createIndicators(containers);
				ui.setCount(3);
			});

			it('should show the count in the count element', () => {
				containers.forEach(container => {
					const el = container.querySelector('.myft__indicator');

					expect(el.innerText).to.equal('3');
				});
			});

			it('should clear the count when count is zero', () => {
				ui.setCount(0);
				containers.forEach(container => {
					const el = container.querySelector('.myft__indicator');

					expect(el.innerText).to.equal('');
				});
			});
		});

		describe('click handling', () => {
			beforeEach(() => {
				ui.createIndicators(containers);
				ui.setCount(3);
			});

			describe('given an indicator is clicked', () => {
				beforeEach(() => {
					containers[0].click();
				});

				it('should set the indicator dismissed time', () => {
					expect(mockStorage.setIndicatorDismissedTime.called).to.equal(true);
				});
			});
		});
	});
});