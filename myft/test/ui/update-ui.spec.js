/* global expect sinon */

describe('Update UI', () => {

	let updateUi;
	let stubs;
	let mockRelationships;

	const mockUiSelectorsMap = new Map([
		['saved', '[data-myft-ui="saved"]'],
		['followed', '[data-myft-ui="follow"]'],
		['danced', '[data-myft-ui="danced"]']
	])

	beforeEach(() => {

		mockRelationships = {
			saved: [],
			followed: [],
			danced: []
		}

		stubs = {
			getRelationshipsStub: relationshipName => mockRelationships[relationshipName],
			personaliseLinksStub: sinon.stub(),
			setStateOfManyButtonsStub: sinon.stub()
		}

		const updateUiInjector = require('inject-loader!../../ui/update-ui');
		updateUi = updateUiInjector({
			'./lib/loaded-relationships': { getRelationships: stubs.getRelationshipsStub },
			'./lib/button-states': { setStateOfManyButtons: stubs.setStateOfManyButtonsStub },
			'./personalise-links': stubs.personaliseLinksStub,
			'./lib/relationship-maps/ui-selectors': mockUiSelectorsMap
		})
	})

	it('should call personaliseLinks if `ignoreLinks` is not truthy', () => {
		updateUi(document.body);
		expect(stubs.personaliseLinksStub).to.have.been.called;
	});

	it('should not call personaliseLinks if `ignoreLinks` is truthy', () => {
		updateUi(document.body, true);
		expect(stubs.personaliseLinksStub).to.not.have.been.called;
	});

	it('should call `setStateOfManyButtons` with an array of subjectIds for each relationship', () => {

		mockRelationships.saved = [
			{ uuid: 'some-content-id' },
			{ uuid: 'some-other-content-id' }
		]

		mockRelationships.danced = [
			{ uuid: 'some-dance-id' }
		]

		updateUi(document.body);
		expect(stubs.setStateOfManyButtonsStub).to.have.been.calledTwice;

		expect(stubs.setStateOfManyButtonsStub).to.have.been.calledWithMatch(
			'saved',
			sinon.match.array.deepEquals(['some-content-id', 'some-other-content-id']),
			true,
			document.body
		)

		expect(stubs.setStateOfManyButtonsStub).to.have.been.calledWithMatch(
			'danced',
			sinon.match.array.deepEquals(['some-dance-id']),
			true,
			document.body
		)
	});
});
