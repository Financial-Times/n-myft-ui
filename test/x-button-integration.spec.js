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
	});

});
