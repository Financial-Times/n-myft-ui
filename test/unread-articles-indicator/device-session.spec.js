/* global expect */
import sinon from 'sinon';
import dateFns from 'date-fns';
const sandbox = sinon.sandbox.create();

const expiryTimestamp = '2018-06-14T12:00:00.000Z';
const timestampBeforeExpiry = '2018-06-14T11:40:00.000Z';
const timestampAfterExpiry = '2018-06-14T12:10:00.000Z';

const SESSION_THRESHOLD_MINUTES = 30;

describe('DeviceSession', () => {

	let clock;
	let deviceSession;
	let deviceSessionExpiry;

	const mockStorage = {
		getDeviceSessionExpiry: sandbox.stub().callsFake(() => deviceSessionExpiry),
		setDeviceSessionExpiry: sandbox.spy()
	};

	const subjectInjector = require('inject-loader!../../components/unread-articles-indicator/device-session');
	const DeviceSession = subjectInjector({
		'date-fns': dateFns,
		'./storage': mockStorage
	});

	afterEach(() => {
		deviceSessionExpiry = undefined;
		clock.restore();
		sandbox.resetHistory();
	});

	describe('constructor:', () => {

		const timeNow = timestampBeforeExpiry;

		beforeEach(() => {
			clock = sinon.useFakeTimers(new Date(timeNow));
			deviceSessionExpiry = expiryTimestamp;
			deviceSession = new DeviceSession();
		});

		it('should set this.expiry a timestamp from localStorage', () => {
			expect(mockStorage.getDeviceSessionExpiry).to.have.been.calledOnce;
			expect(deviceSession.expiry).to.equal(expiryTimestamp);
		});

		it('should call storage.setDeviceSessionExpiry with correct timestamp', () => {
			const correctTimestamp = dateFns.addMinutes(timeNow, SESSION_THRESHOLD_MINUTES).toISOString();

			expect(mockStorage.setDeviceSessionExpiry).to.have.been.calledOnce;
			expect(mockStorage.setDeviceSessionExpiry).to.have.been.calledWith(correctTimestamp);
		});
	});

	describe('isNewSession:', () => {

		it('should return true if the user visits for the first time (initially no value in localStorage)', () => {
			const timeNow = '2018-06-14T08:00:00.000Z';
			const newExpiryTimestamp = dateFns.addMinutes(timeNow, SESSION_THRESHOLD_MINUTES).toISOString();

			clock = sinon.useFakeTimers(new Date(timeNow));
			deviceSessionExpiry = undefined;
			deviceSession = new DeviceSession();

			expect(deviceSession.isNewSession()).to.be.true;
			expect(mockStorage.setDeviceSessionExpiry).to.have.been.calledWith(newExpiryTimestamp);
		});

		it('should return true if the user returns after session (initial value in localStorage is in the past)', () => {
			const timeNow = timestampAfterExpiry;
			const newExpiryTimestamp = dateFns.addMinutes(timeNow, SESSION_THRESHOLD_MINUTES).toISOString();

			clock = sinon.useFakeTimers(new Date(timeNow));
			deviceSessionExpiry = expiryTimestamp;
			deviceSession = new DeviceSession();

			expect(deviceSession.isNewSession()).to.be.true;
			expect(mockStorage.setDeviceSessionExpiry).to.have.been.calledWith(newExpiryTimestamp);
		});

		it('should return false if the user returns within session (initial value in localStorage is in the future)', () => {
			const timeNow = timestampBeforeExpiry;
			const newExpiryTimestamp = dateFns.addMinutes(timeNow, SESSION_THRESHOLD_MINUTES).toISOString();

			clock = sinon.useFakeTimers(new Date(timeNow));
			deviceSessionExpiry = expiryTimestamp;
			deviceSession = new DeviceSession();

			expect(deviceSession.isNewSession()).to.be.false;
			expect(mockStorage.setDeviceSessionExpiry).to.have.been.calledWith(newExpiryTimestamp);
		});

	});

});
