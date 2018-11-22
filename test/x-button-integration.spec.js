/* global expect */
import sinon from 'sinon';

const injector = require('inject-loader!../components/x-button-integration');

const createButtonMock = (attribute, id) => {
	const xInteractionWrapper = document.createElement('div');
	const form = document.createElement('form');

	form.setAttribute(attribute, id);
	xInteractionWrapper.appendChild(form);

	return {
		id: id,
		el: xInteractionWrapper
	};
};

const dispatchBodyEvent = (name, detail = {}) => document.body.dispatchEvent(new CustomEvent(name, { detail }));

describe('x-button-integration', () => {
	let xButtonIntegration;
	let mockClient;
	let mockButtons;

	beforeEach(() => {
		mockClient = {
			init: sinon.stub().returns(Promise.resolve()),
			load: sinon.stub(),
			loaded: {}
		};
		xButtonIntegration = injector({
			'next-myft-client': mockClient
		});
	});

	describe('initFollowButtons', () => {
		beforeEach(() => {
			mockButtons = [
				createButtonMock('data-concept-id', 'concept-id-1'),
				createButtonMock('data-concept-id', 'concept-id-2')
			];
			mockButtons.forEach(button => document.body.appendChild(button.el));
		});

		afterEach(() => {
			mockButtons.forEach(buttonMock => buttonMock.el.remove());
		});

		describe('handling myFT client load of followed concepts', () => {
			beforeEach(() => {
				mockClient.loaded = {
					'followed.concept': {
						items: [
							{ uuid: mockButtons[0].id }
						]
					}
				};
				xButtonIntegration.initFollowButtons();
			});

			it('should set states of any buttons found in page', done => {
				mockButtons[0].el.addEventListener('x-interaction.trigger-action', event => {
					expect(event.detail).to.deep.equal({ action: 'followed' });
					done();
				});

				dispatchBodyEvent('myft.user.followed.concept.load');
			});
		});

		describe('handling myFT client followed event', () => {
			beforeEach(() => {
				xButtonIntegration.initFollowButtons();
			});

			it('should set states of any buttons found in page', done => {
				mockButtons[0].el.addEventListener('x-interaction.trigger-action', event => {
					expect(event.detail).to.deep.equal({ action: 'followed' });
					done();
				});

				dispatchBodyEvent('myft.user.followed.concept.add', { subject: mockButtons[0].id });
			});
		});

		describe('handling myFT client unfollowed event', () => {
			beforeEach(() => {
				xButtonIntegration.initFollowButtons();
			});

			it('should set states of any buttons found in page', done => {
				mockButtons[0].el.addEventListener('x-interaction.trigger-action', event => {
					expect(event.detail).to.deep.equal({ action: 'unfollowed' });
					done();
				});

				dispatchBodyEvent('myft.user.followed.concept.remove', { subject: mockButtons[0].id });
			});
		});
	});

	describe('initSaveButtons', () => {
		beforeEach(() => {
			mockButtons = [
				createButtonMock('data-content-id', 'content-id-1'),
				createButtonMock('data-content-id', 'content-id-2')
			];
			mockButtons.forEach(button => document.body.appendChild(button.el));
		});

		afterEach(() => {
			mockButtons.forEach(buttonMock => buttonMock.el.remove());
		});

		describe('handling myFT client load of saved content', () => {
			beforeEach(() => {
				mockClient.loaded = {
					'saved.content': {
						items: [
							{ uuid: mockButtons[0].id }
						]
					}
				};
				xButtonIntegration.initSaveButtons();
			});

			it('should set states of any buttons found in page', done => {
				mockButtons[0].el.addEventListener('x-interaction.trigger-action', event => {
					expect(event.detail).to.deep.equal({ action: 'saved' });
					done();
				});

				dispatchBodyEvent('myft.user.saved.content.load');
			});
		});

		describe('handling myFT client save event', () => {
			beforeEach(() => {
				xButtonIntegration.initSaveButtons();
			});

			it('should set states of any buttons found in page', done => {
				mockButtons[0].el.addEventListener('x-interaction.trigger-action', event => {
					expect(event.detail).to.deep.equal({ action: 'saved' });
					done();
				});

				dispatchBodyEvent('myft.user.saved.content.add', { subject: mockButtons[0].id });
			});
		});

		describe('handling myFT client unsaved event', () => {
			beforeEach(() => {
				xButtonIntegration.initSaveButtons();
			});

			it('should set states of any buttons found in page', done => {
				mockButtons[0].el.addEventListener('x-interaction.trigger-action', event => {
					expect(event.detail).to.deep.equal({ action: 'unsaved' });
					done();
				});

				dispatchBodyEvent('myft.user.saved.content.remove', { subject: mockButtons[0].id });
			});
		});
	});

});
