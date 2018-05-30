/* global expect sinon */

const tracking = require('../tracking.js');

describe('myft digest notification tracking events', () => {
	const ARTICLE_UUID = 'd1cbaa6e-3296-11e8-ac48-10c6fdc22F03';
	let oTrackingEvent;
	const html = `
		<button class="open-digest-button">Open</button>
		<button class="close-digest-button">Close</button>
		<div class="digest-links">
			<a href="/content/123" data-content-id="${ARTICLE_UUID}">Digest article headline</a>
		</div>`;

	const div = document.createElement('div');

	div.innerHTML = html;
	document.body.appendChild(div);

	beforeEach(() => {
		oTrackingEvent = sinon.stub();
		window.addEventListener('oTracking.event', oTrackingEvent);
	});

	describe('digestRendered', () => {
		beforeEach(() => {
			tracking.digestRendered();
		});

		it('should dispatch an oTracking CustomEvent', () => {
			expect(oTrackingEvent.called).to.equal(true);
			expect(oTrackingEvent.getCall(0).args[0] instanceof window.CustomEvent).to.equal(true);
		});

		it('should contain the correct detail', () => {
			expect(oTrackingEvent.getCall(0).args[0].detail).to.deep.equal({
				category: 'component',
				action: 'render',
				messaging: 'myft-digest'
			});
		});
	});

	describe('digestOpened', () => {
		beforeEach(() => {
			tracking.digestOpened();
		});

		it('should dispatch an oTracking CustomEvent', () => {
			expect(oTrackingEvent.called).to.equal(true);
			expect(oTrackingEvent.getCall(0).args[0] instanceof window.CustomEvent).to.equal(true);
		});

		it('should contain the correct detail', () => {
			expect(oTrackingEvent.getCall(0).args[0].detail).to.deep.equal({
				category: 'component',
				action: 'open',
				messaging: 'myft-digest'
			});
		});
	});

	describe('digestClosed', () => {
		beforeEach(() => {
			tracking.digestClosed();
		});

		it('should dispatch an oTracking CustomEvent', () => {
			expect(oTrackingEvent.called).to.equal(true);
			expect(oTrackingEvent.getCall(0).args[0] instanceof window.CustomEvent).to.equal(true);
		});

		it('should contain the correct detail', () => {
			expect(oTrackingEvent.getCall(0).args[0].detail).to.deep.equal({
				category: 'component',
				action: 'close',
				messaging: 'myft-digest'
			});
		});
	});

	describe('digestLinkClicked', () => {
		beforeEach(() => {
			tracking.digestLinkClicked(document.querySelector('.digest-links > a'));
		});

		it('should dispatch an oTracking CustomEvent', () => {
			expect(oTrackingEvent.called).to.equal(true);
			expect(oTrackingEvent.getCall(0).args[0] instanceof window.CustomEvent).to.equal(true);
		});

		it('should contain the correct detail', () => {
			expect(oTrackingEvent.getCall(0).args[0].detail).to.deep.equal({
				category: 'element',
				action: 'click',
				messaging: 'myft-digest-link',
				contentID: ARTICLE_UUID
			});
		});
	});

	describe('tooltipClosed', () => {
		beforeEach(() => {
			tracking.tooltipClosed();
		});

		it('should dispatch an oTracking CustomEvent', () => {
			expect(oTrackingEvent.called).to.equal(true);
			expect(oTrackingEvent.getCall(0).args[0] instanceof window.CustomEvent).to.equal(true);
		});

		it('should contain the correct detail', () => {
			expect(oTrackingEvent.getCall(0).args[0].detail).to.deep.equal({
				category: 'component',
				action: 'close',
				messaging: 'myft-digest-tooltip'
			});
		});
	});

});
