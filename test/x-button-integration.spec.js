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
	const ACTOR_ID = null;
	const ACTOR_TYPE = 'user';
	const CSRF_TOKEN = 'dummy-token';
	const CONCEPT_ID = '0000-0000-0000-0000';
	const CONTENT_ID = '1111-1111-1111-1111';
	let xButtonIntegration;
	let mockClient;
	let mockButtons;

	beforeEach(() => {
		mockClient = {
			remove: sinon.spy(),
			saved: sinon.stub(),
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
			xButtonIntegration.initFollowButtons();
		});

		afterEach(() => {
			mockButtons.forEach(buttonMock => buttonMock.el.remove());
		});

		it('invokes myft client when a button dispatches its event', () => {
			mockButtons[0].el.dispatchEvent(new CustomEvent('x-follow-button', {
				bubbles: true,
				detail: {
					action: 'remove',
					actorType: ACTOR_TYPE,
					actorId: ACTOR_ID,
					relationshipName: 'followed',
					subjectType: 'concept',
					subjectId: CONCEPT_ID,
					token: CSRF_TOKEN
				}
			}));

			expect(mockClient.remove).to.have.been.calledWith(ACTOR_TYPE, ACTOR_ID, 'followed', 'concept', CONCEPT_ID, sinon.match({
				token: CSRF_TOKEN
			}));
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

		describe('invokes myFT client when a button dispatches its event', () => {
			beforeEach(() => {
				xButtonIntegration.initSaveButtons();
			});

			it('invokes myft client when a button dispatches its event', () => {
				mockButtons[0].el.dispatchEvent(new CustomEvent('x-article-save-button', {
					bubbles: true,
					detail: {
						action: 'remove',
						actorType: ACTOR_TYPE,
						actorId: ACTOR_ID,
						relationshipName: 'saved',
						subjectType: 'content',
						subjectId: CONTENT_ID,
						token: CSRF_TOKEN
					}
				}));

				expect(mockClient.remove).to.have.been.calledWith(ACTOR_TYPE, ACTOR_ID, 'saved', 'content', CONTENT_ID, sinon.match({
					token: CSRF_TOKEN
				}));
			});
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
