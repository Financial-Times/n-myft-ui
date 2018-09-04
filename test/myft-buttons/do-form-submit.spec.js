/* global expect sinon */

describe('Do form submit', () => {

	let doFormSubmit;
	let container;
	let stubs;
	let mockRelationshipConfig;
	let testConceptId = 'testConceptIdValue';
	let fakeExtractedFormData = {
				prop1: 'foo',
				prop2: 'bar'
			};

	beforeEach(() => {

		stubs = {
			myFtClientAddStub: sinon.stub(),
			myFtClientRemoveStub: sinon.stub(),
			followPlusDigestEmail: sinon.stub(),
			formIsFollowCollectionStub: sinon.stub().returns(false),
			collectionsDoActionStub: sinon.stub(),
			getDataFromInputsStub: sinon.stub().returns(fakeExtractedFormData)
		};

		mockRelationshipConfig = {
			followed: {
				actorType: 'followed-actor-type',
				subjectType: 'followed-subject-type',
				idProperty: 'data-followed-subject-id'
			}
		};

		doFormSubmit = require('inject-loader!../../myft/ui/myft-buttons/do-form-submit')({
			'next-myft-client': {
				add: stubs.myFtClientAddStub,
				remove: stubs.myFtClientRemoveStub,
				followPlusDigestEmail: stubs.followPlusDigestEmail
			},
			'../../../components/collections': {
				formIsFollowCollection: stubs.formIsFollowCollectionStub,
				doAction: stubs.collectionsDoActionStub
			},
			'./get-data-from-inputs': stubs.getDataFromInputsStub,
			'../lib/relationship-config': mockRelationshipConfig
		});

		container = document.createElement('div');
	});

	it('should not do anything if the button is disabled', () => {
		container.innerHTML = `
			<form>
				<button disabled>
				</button>
			</form>
		`;

		doFormSubmit('followed', container.querySelector('form'));

		expect(stubs.myFtClientAddStub).to.have.not.been.called;
		expect(stubs.myFtClientRemoveStub).to.have.not.been.called;
	});

	it('should set the button to be disabled (until later when the operation completes)', () => {
		container.innerHTML = `
			<form>
				<button>
				</button>
			</form>
		`;

		doFormSubmit('followed', container.querySelector('form'));

		const theButton = container.querySelector('button');
		expect(theButton.hasAttribute('disabled')).to.be.true;
	});

	it('should do an add if the button is not already pressed', () => {
		container.innerHTML = `
			<form data-followed-subject-id="some-subject-id">
				<button></button>
			</form>
		`;

		doFormSubmit('followed', container.querySelector('form'));
		expect(stubs.myFtClientAddStub).to.have.been.called;
	});

	it('should do a remove if the button is already pressed', () => {
		container.innerHTML = `
			<form data-followed-subject-id="some-subject-id">
				<button aria-pressed="true"></button>
			</form>
		`;

		doFormSubmit('followed', container.querySelector('form'));
		expect(stubs.myFtClientRemoveStub).to.have.been.called;
	});

	it('should make a fetch request if certain settings are extant', () => {

		container.innerHTML = `
			<form
				data-myft-ui-variant="followPlusDigestEmail"
				data-concept-id="${testConceptId}""
			>
				<button aria-pressed="false"></button>
			</form>
		`;

		doFormSubmit('followed', container.querySelector('form'));
		expect(stubs.followPlusDigestEmail).to.have.been.called;
		expect(stubs.followPlusDigestEmail).to.have.been.calledWith(
			testConceptId,
			fakeExtractedFormData
		);

	});

	it('should make a myFT client call with all the right data', () => {
		container.innerHTML = `
			<form
				data-followed-subject-id="some-subject-id"
				data-actor-id="some-actor-id"
			>
				<button></button>
			</form>
		`;

		doFormSubmit('followed', container.querySelector('form'));
		expect(stubs.myFtClientAddStub).to.have.been.calledWith(
			'followed-actor-type',
			'some-actor-id',
			'followed',
			'followed-subject-type',
			'some-subject-id',
			fakeExtractedFormData
		);

	});

	it('should pass all hidden inputs and the button to `getDataFromInputs`', () => {
		container.innerHTML = `
			<form data-followed-subject-id="some-subject-id">
				<input type="hidden" name="hiddenProp1" value="foo">
				<input type="hidden" name="hiddenProp2" value="bar">
				<button name="buttonProp" value="hello"></button>
			</form>
		`;

		doFormSubmit('followed', container.querySelector('form'));
		expect(stubs.getDataFromInputsStub).to.have.been.calledWith([
			container.querySelector('button'),
			container.querySelector('input[name="hiddenProp1"]'),
			container.querySelector('input[name="hiddenProp2"]')
		]);
	});

	it('should call `collections.doAction` with all the right params instead of directly calling the myFT client if the form is for a concept collection', () => {
		container.innerHTML = `
			<form
				data-followed-subject-id="some-subject-id"
				data-actor-id="some-actor-id"
			>
				<button></button>
			</form>
		`;

		stubs.formIsFollowCollectionStub.returns(true);

		doFormSubmit('followed', container.querySelector('form'));
		expect(stubs.myFtClientAddStub).to.have.not.been.called;
		expect(stubs.myFtClientRemoveStub).to.have.not.been.called;
		expect(stubs.collectionsDoActionStub).to.have.been.calledWith(
			'add',
			'some-actor-id',
			container.querySelector('form'),
			fakeExtractedFormData
		);
	});

});
