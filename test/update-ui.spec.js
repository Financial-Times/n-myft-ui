/* global expect sinon */

describe('Update UI', () => {

	let updateUi;
	let stubs;
	let mockRelationships;

	const mockRelationshipConfig = {
		saved: {},
		followed: {},
		danced: {}
	};

	beforeEach(() => {

		mockRelationships = {
			saved: [],
			followed: [],
			danced: []
		};

		stubs = {
			getRelationshipsStub: relationshipName => mockRelationships[relationshipName],
			personaliseLinksStub: sinon.stub(),
			setStateOfManyButtonsStub: sinon.stub()
		};

		const updateUiInjector = require('inject-loader!../myft/ui/update-ui');
		updateUi = updateUiInjector({
			'./lib/loaded-relationships': { getRelationships: stubs.getRelationshipsStub },
			'./lib/button-states': { setStateOfManyButtons: stubs.setStateOfManyButtonsStub },
			'./personalise-links': stubs.personaliseLinksStub,
			'./lib/relationship-config': mockRelationshipConfig
		});
	});

	it('should call `setStateOfManyButtons` with an array of subjectIds for each relationship', () => {

		mockRelationships.saved = [
			{ uuid: 'v2ID' },
			{ uuid: 'other-v2ID' }
		];

		mockRelationships.danced = [
			{ uuid: 'dance-v2' }
		];

		updateUi(document.body);
		expect(stubs.setStateOfManyButtonsStub).to.have.been.calledTwice;

		expect(stubs.setStateOfManyButtonsStub).to.have.been.calledWithMatch(
			'saved',
			sinon.match.array.deepEquals(['v2ID', 'other-v2ID']),
			true,
			document.body
		);

		expect(stubs.setStateOfManyButtonsStub).to.have.been.calledWithMatch(
			'danced',
			sinon.match.array.deepEquals(['dance-v2']),
			true,
			document.body
		);
	});
});
