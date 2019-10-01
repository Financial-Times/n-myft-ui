/* global expect */
import sinon from 'sinon';

const NEW_ARTICLES = [
	{ id: 'article-1' },
	{ id: 'article-2' },
	{ id: 'article-3' },
];
const FEED_START_TIME = '2018-06-05T10:00:00.000Z';

describe('unread stories indicator', () => {
	let unreadStoriesIndicator;
	let mockUpdate;
	let mockInitialiseFeedStartTime;
	let mockStorage;
	let mockUi;
	let isStorageAvailable;

	beforeEach(() => {
		mockStorage = {
			getFeedStartTime: sinon.stub().returns(FEED_START_TIME),
			setFeedStartTime: sinon.stub(),
			updateLastUpdate: sinon.stub(),
			isAvailable: sinon.stub().callsFake(() => isStorageAvailable)
		};
		mockUi = {
			createIndicators: sinon.stub(),
			setCount: sinon.stub(),
			getState: sinon.stub(),
		};
		mockUpdate = sinon.stub().returns(Promise.resolve(NEW_ARTICLES));
		mockInitialiseFeedStartTime = sinon.stub().resolves();

		unreadStoriesIndicator = require('inject-loader!../../components/unread-articles-indicator')({
			'next-session-client': {
				uuid: sinon.stub().resolves({uuid: '00000000-0000-0000-0000-000000000000'})
			},
			'./storage': mockStorage,
			'./ui': mockUi,
			'./update': mockUpdate,
			'./initialise-feed-start-time': mockInitialiseFeedStartTime
		});
	});

	describe('default export', () => {
		describe('storage availability', () => {
			it('should not do anything if storage is not available', () => {
				isStorageAvailable = false;
				unreadStoriesIndicator();
				expect(mockUi.createIndicators).to.not.have.been.called;
				expect(mockUi.setCount).to.not.have.been.called;
				expect(mockInitialiseFeedStartTime).to.not.have.been.called;
			});
		});

		describe('initialisation', () => {
			beforeEach(() => {
				isStorageAvailable = true;
				return unreadStoriesIndicator();
			});

			it('should initialise feed start time', () => {
				expect(mockInitialiseFeedStartTime).to.have.been.calledOnce;
			});

			it('should create ui indicators', () => {
				expect(mockUi.createIndicators).to.have.been.calledOnce;
			});

			it('should handle clicks', () => {
				const args = mockUi.createIndicators.firstCall.args;

				expect(args[1].onClick).to.be.a('function');

				args[1].onClick();

				expect(mockStorage.updateLastUpdate).to.have.been.calledOnce;
			});
		});
	});
});
