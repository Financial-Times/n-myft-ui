/* global expect sinon*/

describe('Collections', () => {

	let collections;
	let container;
	let stubs;
	let mockRelationshipConfig;

	beforeEach(() => {

		stubs = {
			myFtClientAddStub: sinon.stub(),
			myFtClientRemoveStub: sinon.stub(),
			toggleButtonStub: sinon.stub()
		};

		mockRelationshipConfig = {
			followed: {
				idProperty: 'data-followed-subject-id'
			}
		};

		collections = require('inject-loader!../../../ui/myft-buttons/collections')({
			'next-myft-client': {
				add: stubs.myFtClientAddStub,
				remove: stubs.myFtClientRemoveStub
			},
			'../lib/relationship-config': mockRelationshipConfig,
			'../lib/button-states': {
				toggleButton: stubs.toggleButtonStub
			}
		});

		container = document.createElement('div');
	});

	describe('formIsFollowCollection', () => {

		it('should return true if the relationshipName is `followed` and there is a comma in the subjectId, suggesting a list', () => {
			container.innerHTML = `
				<form data-followed-subject-id="a,b,c"></form>
			`;
			expect(collections.formIsFollowCollection('followed', container.querySelector('form'))).to.be.true;
		});

		it('should return false if the relationshipName is `followed` and there is no comma in the subjectId', () => {
			container.innerHTML = `
				<form data-followed-subject-id="a"></form>
			`;
			expect(collections.formIsFollowCollection('followed', container.querySelector('form'))).to.be.false;
		});

		it('should return false if the relationshipName is not `followed` even if there is a comma in the subjectId', () => {
			container.innerHTML = `
				<form data-followed-subject-id="a,b,c"></form>
			`;
			expect(collections.formIsFollowCollection('saved', container.querySelector('form'))).to.be.false;
		});

	});

	describe('doAction', () => {

		it('should make a myFT client call with all the right data', () => {
			container.innerHTML = `
				<form data-followed-subject-id="id1,id2,id3">
					<button></button>
				</form>
			`;

			const action = 'add';
			const userId = 'some-actor-id';
			const formData = {
				commonProp: 'foo',
				taxonomy: 'tax1,tax2,tax3',
				name: 'name1,name2,name3'
			};

			collections.doAction(action, userId, container.querySelector('form'), formData);
			expect(stubs.myFtClientAddStub.callCount).to.equal(3);
			expect(stubs.myFtClientAddStub).to.have.been.calledWith(
				'user',
				'some-actor-id',
				'followed',
				'concept',
				'id1',
				{
					commonProp: 'foo',
					taxonomy: 'tax1',
					name: 'name1',
				}
			);

			expect(stubs.myFtClientAddStub).to.have.been.calledWith(
				'user',
				'some-actor-id',
				'followed',
				'concept',
				'id2',
				{
					commonProp: 'foo',
					taxonomy: 'tax2',
					name: 'name2',
				}
			);

			expect(stubs.myFtClientAddStub).to.have.been.calledWith(
				'user',
				'some-actor-id',
				'followed',
				'concept',
				'id3',
				{
					commonProp: 'foo',
					taxonomy: 'tax3',
					name: 'name3',
				}
			);

		});

		it('should do adds if the action is `add`', () => {
			container.innerHTML = `
				<form data-followed-subject-id="id1,id2,id3">
					<button></button>
				</form>
			`;

			const action = 'add';
			const userId = 'some-actor-id';
			const formData = {
				commonProp: 'foo',
				taxonomy: 'tax1,tax2,tax3',
				name: 'name1,name2,name3'
			};

			collections.doAction(action, userId, container.querySelector('form'), formData);
			expect(stubs.myFtClientAddStub.callCount).to.equal(3);
			expect(stubs.myFtClientRemoveStub).to.have.not.been.called;
		});

		it('should do removes if the action is `remove`', () => {
			container.innerHTML = `
				<form data-followed-subject-id="id1,id2,id3">
					<button></button>
				</form>
			`;

			const action = 'remove';
			const userId = 'some-actor-id';
			const formData = {
				commonProp: 'foo',
				taxonomy: 'tax1,tax2,tax3',
				name: 'name1,name2,name3'
			};

			collections.doAction(action, userId, container.querySelector('form'), formData);
			expect(stubs.myFtClientRemoveStub.callCount).to.equal(3);
			expect(stubs.myFtClientAddStub).to.have.not.been.called;
		});

		it('should toggle the button to pressed if the action is `add`', () => {
			container.innerHTML = `
				<form data-followed-subject-id="id1,id2,id3">
					<button></button>
				</form>
			`;

			const action = 'add';
			const userId = 'some-actor-id';
			const formData = {
				commonProp: 'foo',
				taxonomy: 'tax1,tax2,tax3',
				name: 'name1,name2,name3'
			};

			return collections.doAction(action, userId, container.querySelector('form'), formData)
				.then(() => {
					const theButton = container.querySelector('button');
					expect(stubs.toggleButtonStub).to.have.been.calledWith(theButton, true);
				});
		});

		it('should toggle the button to unpressed if the action is `remove`', () => {
			container.innerHTML = `
				<form data-followed-subject-id="id1,id2,id3">
					<button></button>
				</form>
			`;

			const action = 'remove';
			const userId = 'some-actor-id';
			const formData = {
				commonProp: 'foo',
				taxonomy: 'tax1,tax2,tax3',
				name: 'name1,name2,name3'
			};

			return collections.doAction(action, userId, container.querySelector('form'), formData)
				.then(() => {
					const theButton = container.querySelector('button');
					expect(stubs.toggleButtonStub).to.have.been.calledWith(theButton, false);
				});
		});
	});


});
