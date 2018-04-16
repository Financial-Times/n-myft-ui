import { broadcast } from 'n-ui-foundations/main';

export default class Feedback {
	constructor (element, options = {}) {
		this.options = options;

		this.element = element;
		if (!this.element) {
			throw new Error('No element passed to Feedback');
		}

		this.featureName = element.dataset.feedbackFeature;
		if (!this.featureName) {
			throw new Error('Feedback element does not have a feedback-feature attribute');
		}

		this.questionEls = [...this.element.querySelectorAll('*[data-question]')];
		if (this.questionEls.length) {
			this.addResponderListeners();
		} else {
			throw new Error('Feedback element does not have any questions');
		}
	}

	addResponderListeners () {
		this.questionEls.forEach(questionEl => {
			const responderEls = [...questionEl.querySelectorAll('.js-feedback__responder')];

			responderEls.forEach(responder => {
				responder.addEventListener('click', () => {
					this.handleResponse(questionEl.dataset.question, responder.dataset.answer);
				});
			});
		});
	}

	handleResponse (question, answer) {
		const data = {
			category: this.featureName,
			action: 'feedback',
			question,
			answer
		};

		broadcast('oTracking.event', data);

		this.questionEls.forEach(questionEl => questionEl.style.display = 'none');
		this.element.querySelector('.js-feedback__complete').style.display = 'block';

		if (typeof this.options.onRespond === 'function') {
			this.options.onRespond(data);
		}
	};
}
