
class IndicatorOriginal {
	constructor (container, {onClick} = {}) {
		this.container = container;
		this.container.classList.add('myft__indicator-container');

		this.el = document.createElement('span');
		this.el.classList.add('myft__indicator-original');

		container.appendChild(this.el);

		if (typeof onClick === 'function') {
			this.container.addEventListener('click', () => onClick());
		}
	}

	setCount (count) {
		this.el.innerText = count > 0 ? count : '';
	}
}

class Indicator {
	constructor (container, {onClick} = {}) {
		this.count = undefined;

		this.container = container;
		this.container.classList.add('myft__indicator-container');

		this.el = document.createElement('span');
		this.el.classList.add('myft__indicator');
		this.el.classList.add('myft__indicator--hidden');

		container.appendChild(this.el);

		if (typeof onClick === 'function') {
			this.container.addEventListener('click', () => onClick());
		}
	}

	setCount (count) {
		if( count === this.count ) {
			return;
		}
		if( count < 1 ) {
			this.el.classList.add('myft__indicator--hidden');
		} else {
			this.el.classList.remove('myft__indicator--hidden');
			if( count < 10 ) {
				this.el.classList.add('myft__indicator--single-digit');
			} else {
				this.el.classList.remove('myft__indicator--single-digit');
			}
			this.el.innerText = count > 0 && count < 200 ? count : '';
		}
		this.count = count;
	}
}

class Favicon {
	constructor () {
		this.count = undefined;
		this.faviconLinks =
			Array.from(document.querySelectorAll('head link[rel=icon]'))
				.concat(Array.from(document.querySelectorAll('head link[rel=apple-touch-icon]')));
		this.showDot = false;
	}

	setCount (count) {
		if( count === this.count ) {
			return;
		}
		this.showDot = count > 0;
		const newImage = this.showDot ? 'brand-ft-logo-square-coloured-dot' : 'brand-ft-logo-square-coloured-no-dot';
		this.faviconLinks.forEach(link => {
			link.href = link.href.replace(/brand-ft-logo-square-coloured(-dot|-no-dot)?/, newImage);
		});
		this.count = count;
	}
}

class Title {
	constructor () {
		this.count = undefined;
		this.originalTitle = document.title;
	}

	setCount (count) {
		if( count === this.count ) {
			return;
		}
		document.title = count > 0 ? `(${count}) ${this.originalTitle}` : this.originalTitle;
		this.count = count;
	}
}

let indicators;
let favicon;
let title;

export const createIndicators = (targets, options = {}) => {
	if( options.flags && options.flags.myftNewUnreadIndicator ) {
		indicators = [...targets].map(target => new Indicator(target, options));
	} else {
		indicators = [...targets].map(target => new IndicatorOriginal(target, options));
	}
	if (options.flags && options.flags.myftUnreadFavicon) {
		favicon = new Favicon();
		title = new Title();
	}
};

export const setCount = count => {
	indicators.forEach(indicator => indicator.setCount(count));
	if (favicon) {
		favicon.setCount(count);
	}
	if (title) {
		title.setCount(count);
	}
};

export const getState = () => ({
	faviconHasDot: favicon ? favicon.showDot : false,
	numberInTitle: title ? title.count : 0
});
