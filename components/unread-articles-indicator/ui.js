class Indicator {
	constructor (container, { onClick } = {}) {
		this.container = container;
		this.container.classList.add('myft__indicator-container');

		this.el = document.createElement('span');
		this.el.classList.add('myft__indicator');

		container.appendChild(this.el);

		if (typeof onClick === 'function') {
			this.container.addEventListener('click', () => onClick());
		}
	}

	setCount (count) {
		this.el.innerText = count > 0 ? count : '';
	}
}

let indicators;

export const createIndicators = (targets, options) => {
	indicators = [...targets].map(target => new Indicator(target, options));
};

export const setCount = count => {
	indicators.forEach(indicator => indicator.setCount(count));
};
