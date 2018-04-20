import divideUnreadRead from './divide-unread-read';

export default (data) => {
	const digestData = data.user.digest;
	const result = digestData;

	// reading history for past 7 days
	const articlesUserRead = data.user.articlesFromReadingHistory ? data.user.articlesFromReadingHistory.articles : [];
	if (articlesUserRead.length > 0) {
		const digestDataDivided = divideUnreadRead(digestData, articlesUserRead);
		result.articles = digestDataDivided.unreadArticles.concat(digestDataDivided.readArticles);
	}

	return result;
};
