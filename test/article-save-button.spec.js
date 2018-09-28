/* global expect */
import sinon from 'sinon';

const injector = require('inject-loader!../components/article-save-button');

const createSaveButtonMock = contentId => {
	const form = document.createElement('form');

	form.setAttribute('data-content-id', contentId);

	return {
		id: contentId,
		el: form
	};
};

const dispatchBodyEvent = (name, detail = {}) => document.body.dispatchEvent(new CustomEvent(name, { detail }));

describe('article-save-button', () => {
	let articleSaveButton;
	let mockClient;
	let mockButtons;

	beforeEach(() => {
		mockButtons = [
			createSaveButtonMock('content-id-1'),
			createSaveButtonMock('content-id-2')
		];
		mockButtons.forEach(button => document.body.appendChild(button.el));
		mockClient = {
			init: sinon.stub().returns(Promise.resolve()),
			load: sinon.stub(),
			loaded: {}
		};
		articleSaveButton = injector({
			'next-myft-client': mockClient
		});
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
			articleSaveButton.init();
		});

		it('should init the myft client', () => {
			expect(mockClient.init).to.have.been.called;
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
			return articleSaveButton.init();
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
			return articleSaveButton.init();
		});

		it('should set states of any buttons found in page', done => {
			mockButtons[0].el.addEventListener('x-interaction.trigger-action', event => {
				expect(event.detail).to.deep.equal({ action: 'unsaved' });
				done();
			});

			dispatchBodyEvent('myft.user.saved.content.remove', { subject: mockButtons[0].id });
		});
	});

	describe('initialise and load next myFT client', () => {
		describe('and the saved articles have not yet been loaded', () => {
			beforeEach(() => {
				mockClient.loaded = {};
				return articleSaveButton.init();
			});

			it('should init the myft client', () => {
				expect(mockClient.init).to.have.been.called;
			});

			it('should load saved content', () => {
				expect(mockClient.load).to.have.been.calledWith({
					relationship: 'saved',
					type: 'content'
				});
			});
		});

		describe('and the saved articles have been loaded', () => {
			beforeEach(() => {
				mockClient.loaded = { 'saved.content': {} };
				return articleSaveButton.init();
			});

			it('should init the myft client', () => {
				expect(mockClient.init).to.have.been.called;
			});

			it('should not load saved content', () => {
				expect(mockClient.load).to.not.have.been.called;
			});
		});
	});
});
