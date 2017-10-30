/* global expect */

function rejectAfter (milliseconds) {
	return new Promise((_, reject) => setTimeout(() => reject(new Error(`Rejected after ${milliseconds}ms`)), milliseconds));
}

describe('Loaded relationships', () => {

	const mocks = {
		myFtClient: {
			loaded: {}
		},
		config: {
			assumeNoneTimeout: 200
		}
	};

	let loadedRelationships;

	beforeEach(() => {
		const loadedRelationshipsInjector = require('inject-loader!../../../ui/lib/loaded-relationships');
		loadedRelationships = loadedRelationshipsInjector({
			'next-myft-client': mocks.myFtClient,
			'./config': mocks.config
		});
		mocks.myFtClient.loaded = {};
	});

	describe('waitForRelationshipsToLoad', () => {
		it('should return a promise that resolves instantly if the requested relationships have already been loaded', () => {
			mocks.myFtClient.loaded = {
				'followed.concept': {}
			};
			return Promise.race([
				loadedRelationships.waitForRelationshipsToLoad('followed'),
				rejectAfter(100)
			]);
		});

		it('should return a promise that resolves when the relationships have been loaded if they haven\'t already', () => {
			mocks.myFtClient.loaded = {};

			setTimeout(() => {
				// we can rely on this being populated once the event has fired
				mocks.myFtClient.loaded = {
					'followed.concept': {items: []}
				};
				document.body.dispatchEvent(new Event('myft.user.followed.concept.load'));
			}, 10);

			return Promise.race([
				loadedRelationships.waitForRelationshipsToLoad('followed'),
				rejectAfter(100)
			]);
		});

		it('should assume after n seconds that there will be no event, and resolve', () => {
			mocks.myFtClient.loaded = {};
			return Promise.race([
				loadedRelationships.waitForRelationshipsToLoad('followed'),
				rejectAfter(300)
			]);
		});
	});

	describe('getRelationships', () => {
		it('should return the relationships that stored on a previous call to waitForRelationshipsToLoad', () => {
			mocks.myFtClient.loaded = {
				'followed.concept': {cool: 'cool'}
			};
			loadedRelationships.waitForRelationshipsToLoad('followed');
			expect(loadedRelationships.getRelationships('followed')).to.deep.equal({cool: 'cool'});
		});

		it('should return an empty list if the requested relationship has not been loaded', () => {
			expect(loadedRelationships.getRelationships('followed')).to.deep.equal([]);
		});
	});

	describe('addRelationship', () => {
		it('should add a relationship to the list', () => {
			const loadedRelationships = require('../../../ui/lib/loaded-relationships');
			loadedRelationships.addRelationship('foo', {uuid: 123});
			expect(loadedRelationships.getRelationships('foo')).to.deep.equal([{uuid: 123}]);
		});
	});

	describe('removeRelationship', () => {
		it('should remove a relationship from the list', () => {
			const loadedRelationships = require('../../../ui/lib/loaded-relationships');
			loadedRelationships.addRelationship('foo', {uuid: 123});
			expect(loadedRelationships.getRelationships('foo')).to.deep.equal([{uuid: 123}]);
			loadedRelationships.removeRelationship('foo', 123);
			expect(loadedRelationships.getRelationships('foo')).to.deep.equal([]);
		});
	});
});
