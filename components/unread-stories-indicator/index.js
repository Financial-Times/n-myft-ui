import { determineNewContentSinceTime } from './determine-new-content-since-time';
import * as storage from './storage';
import fetchNewContent from './fetch-new-content';
import getUuidFromSession from '../../myft-notification/get-uuid-from-session';

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
	const storedLastVisitedAt = storage.getLastVisitedAt();
	const storedNewContentSinceTime = storage.getNewContentSinceTime();
	const newContentSinceTime = determineNewContentSinceTime(storedLastVisitedAt, storedNewContentSinceTime);

	getUuidFromSession()
		.then(userId => fetchNewContent(userId, newContentSinceTime))
		.then(articles => {
			const unreadArticles = articles.filter(article => !article.hasBeenRead);

			setUnreadArticleCount(unreadArticles.length);
		})
		.catch(() => {});

	storage.setNewContentSinceTime(newContentSinceTime);
	storage.setLastVisitedAt();
};
