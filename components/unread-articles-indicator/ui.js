import { setIndicatorDismissedTime } from './storage';

class Indicator {
	constructor (container) {
		this.container = container;
		this.container.classList.add('myft__indicator-container');

		this.el = document.createElement('span');
		this.el.classList.add('myft__indicator');

		container.appendChild(this.el);

		this.container.addEventListener('click', () => Indicator.dismiss());
	}

	setCount (count) {
		this.el.innerText = count > 0 ? count : '';
	}

	static dismiss () {
		setIndicatorDismissedTime();
	}
}

let indicators;

export const createIndicators = targets => {
	indicators = [...targets].map(target => new Indicator(target));
};

export const setCount = count => {
	indicators.forEach(indicator => indicator.setCount(count));
};
