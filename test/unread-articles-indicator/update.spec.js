/* global expect */
import sinon from 'sinon';

const MOCK_COUNT = 1234;
const MOCK_PREVIOUS_COUNT = 1230;
const MOCK_NOW = new Date('2019-09-23T11:29:00Z');
const MOCK_EARLIEST_CUTOFF_TIME = new Date('2019-09-22T00:00:00Z');
const MOCK_OVERDUE_REFRESH_TIME = new Date('2019-09-23T11:23:59Z');
const MOCK_UNDUE_REFRESH_TIME = new Date('2019-09-23T11:24:01Z');

const mocks = {
	countUnreadArticles: sinon.stub().resolves(MOCK_COUNT),
	setCount: sinon.stub(),
	onCountChange: sinon.stub()
};

const mockStorage = {
	_lastUpdate: undefined,
	_setLastUpdate: sinon.spy( function (x) { this.default.lastUpdate = x; } ),
	getLastUpdate () { return this.default.lastUpdate; },
	setLastUpdate (x) { this._setLastUpdate(x); },
	updateLastUpdate (x) { this._setLastUpdate(x); },
	getFeedStartTime () { return MOCK_EARLIEST_CUTOFF_TIME; }
};

function resetMocks () {
	mocks.countUnreadArticles.resetHistory();
	mocks.setCount.resetHistory();
	mockStorage._setLastUpdate.resetHistory();
}

describe('update function', () => {

	const injector = require('inject-loader!../../components/unread-articles-indicator/update');
	const update = injector({
		'./storage': mockStorage,
		'./count-unread-articles': mocks.countUnreadArticles,
		'./ui': {setCount: mocks.setCount},
		'./tracking': {onCountChange: mocks.onCountChange}
	});

	context('when there is no previous update', () => {
		before( function () {
			resetMocks();
			mockStorage.lastUpdate = undefined;
			return update(MOCK_NOW);
		} );

		it('checks for new articles', () => {
			expect(mocks.countUnreadArticles).calledWith(MOCK_EARLIEST_CUTOFF_TIME);
		});

		it('updates the ui', () => {
			expect(mocks.setCount).calledWith(MOCK_COUNT);
		});

		it('marked an update as in progress', () => {
			expect(mockStorage._setLastUpdate.firstCall.args[0].updateStarted.toISOString()).equal(MOCK_NOW.toISOString());
		});

		it('updates the local storage', () => {
			expect(mockStorage.lastUpdate.count).equal(MOCK_COUNT);
		});

	});


	context('when an update is due', () => {
		before( function () {
			resetMocks();
			mockStorage.lastUpdate = {time: MOCK_OVERDUE_REFRESH_TIME};
			return update(MOCK_NOW);
		} );

		it('checks for new articles', () => {
			expect(mocks.countUnreadArticles).calledWith(MOCK_EARLIEST_CUTOFF_TIME);
		});

		it('updates the ui', () => {
			expect(mocks.setCount).calledWith(MOCK_COUNT);
		});

		it('updates the local storage', () => {
			expect(mockStorage.lastUpdate.count).equal(MOCK_COUNT);
		});

		it('marked an update as in progress', () => {
			expect(mockStorage._setLastUpdate.firstCall.args[0].updateStarted.toISOString()).equal(MOCK_NOW.toISOString());
		});

		it('doesn\'t block further updates', () => {
			expect(mockStorage.lastUpdate.updateStarted).equal(false);
		});
	});

	context('when an update is not due', () => {
		const lastUpdate = {time: MOCK_UNDUE_REFRESH_TIME, count: MOCK_PREVIOUS_COUNT};
		before( function () {
			resetMocks();
			mockStorage.lastUpdate = lastUpdate;
			return update(MOCK_NOW);
		} );

		it('does not check for new articles', () => {
			expect(mocks.countUnreadArticles.notCalled).equal(true,'Unexpected call to countUnreadArticles()');
		});

		it('updates the ui with the current value', () => {
			expect(mocks.setCount).calledWith(MOCK_PREVIOUS_COUNT);
		});

		it('did not mark an update as in progress', () => {
			expect(mockStorage._setLastUpdate.notCalled).equal(true,'Unexpected storage update');
		});

		it('doesn\'t update the local storage', () => {
			expect(mockStorage.lastUpdate).equal(lastUpdate);
		});
	});

	context('when an update fails', () => {
		before( () => {
			resetMocks();
			mocks.countUnreadArticles.rejects('boom');
			mockStorage.lastUpdate = undefined;
			return update(MOCK_NOW);
		} );

		after( () => {
			mocks.countUnreadArticles.resolves(MOCK_COUNT);
		});

		it('marks the update as in progress', () => {
			expect(mockStorage._setLastUpdate.firstCall.args[0].updateStarted.toISOString()).equal(MOCK_NOW.toISOString());
		});

		it('doesn\'t update the ui', () => {
			expect(mocks.setCount.notCalled).equal(true,'Unexpected call to ui.setCount()');
		});

		it('doesn\'t block further updates', () => {
			expect(mockStorage.lastUpdate.updateStarted).equal(false);
		});
	});

	context('when an update is due but already happening', () => {
		before( function () {
			resetMocks();
			mockStorage.lastUpdate = {time: MOCK_OVERDUE_REFRESH_TIME, count: MOCK_PREVIOUS_COUNT, updateStarted: MOCK_OVERDUE_REFRESH_TIME};
			return update(MOCK_NOW);
		} );

		it('does not check for new articles', () => {
			expect(mocks.countUnreadArticles.notCalled).equal(true,'Unexpected call to countUnreadArticles()');
		});

		it('updates the ui with the current value', () => {
			expect(mocks.setCount).calledWith(MOCK_PREVIOUS_COUNT);
		});

		it('does not touch local storage', () => {
			expect(mockStorage._setLastUpdate.notCalled).equal(true,'Unexpected storage update');
		});

	});
});
