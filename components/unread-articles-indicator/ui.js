class Indicator {
	constructor (container, {onClick} = {}) {
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

class Favicon {
	constructor () {
		this.faviconLinks =
			Array.from(document.querySelectorAll('head link[rel=icon]'))
				.concat(Array.from(document.querySelectorAll('head link[rel=apple-touch-icon]')));
	}

	setCount (count) {
		const newImage = count > 0 ? 'brand-ft-logo-square-coloured-dot' : 'brand-ft-logo-square-coloured-no-dot';
		this.faviconLinks.forEach(link => {
			link.href = link.href.replace(/brand-ft-logo-square-coloured(-dot|-no-dot)?/, newImage);
		});
	}
}

class Title {
	constructor () {
		this.originalTitle = document.title;
	}

	setCount (count) {
		document.title = count > 0 ? `(${count}) ${this.originalTitle}` : this.originalTitle;
	}
}

let indicators;
let favicon;
let title;

export const createIndicators = (targets, options = {}) => {
	indicators = [...targets].map(target => new Indicator(target, options));
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
