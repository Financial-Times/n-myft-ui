import { determineNewContentSinceTime } from './determine-new-content-since-time';
import { getLastVisitedAt, getNewContentSinceTime, setLastVisitedAt, setNewContentSinceTime } from './storage';
import fetchNewContent from './fetch-new-content';
import getUuidFromSession from '../../myft-notification/get-uuid-from-session';

// TODO: Extract UI functions out into separate file
const setUnreadArticleCount = count => {
	const myftLogos = [...document.querySelectorAll('.o-header__top-link--myft')];

	myftLogos.forEach(logo => {
		logo.classList.add('myft__count-container');

		const countEl = document.createElement('span');

		countEl.classList.add('myft__count');
		countEl.innerText = count;

		logo.appendChild(countEl);
	});
};

export default () => {
	const newContentSinceTime = determineNewContentSinceTime(getLastVisitedAt(), getNewContentSinceTime());

	return getUuidFromSession()
		.then(userId => fetchNewContent(userId, newContentSinceTime))
		.then(articles => {
			const unreadArticles = articles.filter(article => !article.hasBeenRead);

			setUnreadArticleCount(unreadArticles.length);

			setNewContentSinceTime(newContentSinceTime);
			setLastVisitedAt();
		})
		.catch(() => {});
};
