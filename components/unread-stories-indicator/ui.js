const getIndicatorElements = () => {
	const containers = [...document.querySelectorAll('.o-header__top-link--myft')];

	return containers.map(container => {
		let indicator = container.querySelector('.myft__indicator');

		if (!indicator) {
			container.classList.add('myft__indicator-container');
			indicator = document.createElement('span');
			indicator.classList.add('myft__indicator');
			container.appendChild(indicator);
		}

		return indicator;
	});
};

export const showIndicator = count => {
	getIndicatorElements().forEach(el => {
		el.innerText = count > 0 ? count : '';
	});
};
