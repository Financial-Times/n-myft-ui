const sinon = require('sinon');
const expect = require('chai').expect;
describe('Tracking', () => {
	const followEvent = {
		subjectType: 'concept',
		action: 'add',
		subjectId: '1234',
		postedData: {}
	};
	const unfollowEvent = {
		subjectType: 'concept',
		action: 'remove',
		subjectId: '4321',
		postedData: {}
	};
	const instantOn = {
		subjectType: 'concept',
		action: 'update',
		subjectId: '5678',
		postedData: {
			_rel: {
				instant: 'true'
			}
		}
	};
	const instantOff = {
		subjectType: 'concept',
		action: 'update',
		subjectId: '8765',
		postedData: {
			_rel: {
				instant: 'false'
			}
		}
	};
	const savedArticle = {
		subjectType: 'content',
		action: 'add',
		subjectId: 'abcd',
		postedData: {}
	};
	const unsavedArticle = {
		subjectType: 'content',
		action: 'remove',
		subjectId: 'dcba',
		postedData: {}
	};
	const otherAction = {
		subjectType: 'foo',
		action: 'bar',
		subjectId: '123',
		postedData: {}
	};

	const tracking = require('../../../ui/lib/tracking');

	beforeEach(() => {
		sinon.stub(document.body, 'dispatchEvent').returnsArg(0);
		sinon.stub(window, 'CustomEvent');
	});
	afterEach(() => {
		document.body.dispatchEvent.restore();
		window.CustomEvent.restore();
	});
	it('sends an event for followed concepts', () => {
		tracking.custom(followEvent);
		expect(window.CustomEvent.called).to.be.true;
		expect(document.body.dispatchEvent.called).to.be.true;
		expect(window.CustomEvent.getCall(0).args[0]).to.equal('oTracking.event');
		expect(window.CustomEvent.getCall(0).args[1]).to.have.deep.property('detail.category', 'myFT');
		expect(window.CustomEvent.getCall(0).args[1]).to.have.deep.property('detail.action', 'follow');
		expect(window.CustomEvent.getCall(0).args[1]).to.have.deep.property('detail.concept_id', '1234');
		expect(window.CustomEvent.getCall(0).args[1]).to.not.have.deep.property('detail.article_id');
	});
	it('sends an event for unfollowed concepts', () => {
		tracking.custom(unfollowEvent);
		expect(window.CustomEvent.called).to.be.true;
		expect(document.body.dispatchEvent.called).to.be.true;
		expect(window.CustomEvent.getCall(0).args[0]).to.equal('oTracking.event');
		expect(window.CustomEvent.getCall(0).args[1]).to.have.deep.property('detail.category', 'myFT');
		expect(window.CustomEvent.getCall(0).args[1]).to.have.deep.property('detail.action', 'unfollow');
		expect(window.CustomEvent.getCall(0).args[1]).to.have.deep.property('detail.concept_id', '4321');
		expect(window.CustomEvent.getCall(0).args[1]).to.not.have.deep.property('detail.article_id');
	});
	it('sends an event for added instant alerts', () => {
		tracking.custom(instantOn);
		expect(window.CustomEvent.called).to.be.true;
		expect(document.body.dispatchEvent.called).to.be.true;
		expect(window.CustomEvent.getCall(0).args[0]).to.equal('oTracking.event');
		expect(window.CustomEvent.getCall(0).args[1]).to.have.deep.property('detail.category', 'myFT');
		expect(window.CustomEvent.getCall(0).args[1]).to.have.deep.property('detail.action', 'instant-alert-on');
		expect(window.CustomEvent.getCall(0).args[1]).to.have.deep.property('detail.concept_id', '5678');
		expect(window.CustomEvent.getCall(0).args[1]).to.not.have.deep.property('detail.article_id');
	});
	it('sends an event for removed instant alerts', () => {
		tracking.custom(instantOff);
		expect(window.CustomEvent.called).to.be.true;
		expect(document.body.dispatchEvent.called).to.be.true;
		expect(window.CustomEvent.getCall(0).args[0]).to.equal('oTracking.event');
		expect(window.CustomEvent.getCall(0).args[1]).to.have.deep.property('detail.category', 'myFT');
		expect(window.CustomEvent.getCall(0).args[1]).to.have.deep.property('detail.action', 'instant-alert-off');
		expect(window.CustomEvent.getCall(0).args[1]).to.have.deep.property('detail.concept_id', '8765');
		expect(window.CustomEvent.getCall(0).args[1]).to.not.have.deep.property('detail.article_id');
	});
	it('sends an event for saved articles', () => {
		tracking.custom(savedArticle);
		expect(window.CustomEvent.called).to.be.true;
		expect(document.body.dispatchEvent.called).to.be.true;
		expect(window.CustomEvent.getCall(0).args[0]).to.equal('oTracking.event');
		expect(window.CustomEvent.getCall(0).args[1]).to.have.deep.property('detail.category', 'myFT');
		expect(window.CustomEvent.getCall(0).args[1]).to.have.deep.property('detail.action', 'save');
		expect(window.CustomEvent.getCall(0).args[1]).to.have.deep.property('detail.article_id', 'abcd');
		expect(window.CustomEvent.getCall(0).args[1]).to.not.have.deep.property('detail.concept_id');
	});
	it('sends an event for un-saved articles', () => {
		tracking.custom(unsavedArticle);
		expect(window.CustomEvent.called).to.be.true;
		expect(document.body.dispatchEvent.called).to.be.true;
		expect(window.CustomEvent.getCall(0).args[0]).to.equal('oTracking.event');
		expect(window.CustomEvent.getCall(0).args[1]).to.have.deep.property('detail.category', 'myFT');
		expect(window.CustomEvent.getCall(0).args[1]).to.have.deep.property('detail.action', 'unsave');
		expect(window.CustomEvent.getCall(0).args[1]).to.have.deep.property('detail.article_id', 'dcba');
		expect(window.CustomEvent.getCall(0).args[1]).to.not.have.deep.property('detail.concept_id');
	});
	it('does not send an event for a subject type that is neither a concept nor content', () => {
		tracking.custom(otherAction);
		expect(window.CustomEvent.called).to.be.false;
		expect(document.body.dispatchEvent.called).to.be.false;
	});
});
