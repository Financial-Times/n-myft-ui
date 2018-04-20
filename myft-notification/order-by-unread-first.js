const hasBeenRead = (targetArticle, readArticles) => readArticles.find(readArticle => readArticle.id === targetArticle.id);

function divideUnreadRead (digestData, articlesUserRead) {
	const readArticles = [];
	const unreadArticles = [];
	digestData.articles.forEach(article => {
		hasBeenRead(article, articlesUserRead) ? readArticles.push(article) : unreadArticles.push(article);
	});
	return { readArticles, unreadArticles };
}

function orderByUnreadFirst (data) {
	const digestData = data.user.digest;
	const result = digestData;

	// reading history for past 7 days
	const articlesUserRead = data.user.articlesFromReadingHistory ? data.user.articlesFromReadingHistory.articles : [];
	if (articlesUserRead.length > 0) {
		const digestDataDivided = divideUnreadRead(digestData, articlesUserRead);
		result.articles = digestDataDivided.unreadArticles.concat(digestDataDivided.readArticles);
	}

	return result;
}

module.exports = {
	orderByUnreadFirst,
	divideUnreadRead
};
