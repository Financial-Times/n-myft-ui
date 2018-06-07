
export const showUnreadArticleCount = count => {
	const myftLogos = [...document.querySelectorAll('.o-header__top-link--myft')];

	myftLogos.forEach(logo => {
		logo.classList.add('myft__count-container');

		const countEl = document.createElement('span');

		countEl.classList.add('myft__count');
		countEl.innerText = count;

		logo.appendChild(countEl);
	});
};
