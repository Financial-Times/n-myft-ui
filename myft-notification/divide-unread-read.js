const hasBeenRead = (targetArticle, readArticles) => readArticles.find(readArticle => readArticle.id === targetArticle.id);

export default (digestData, articlesUserRead) => {
	const readArticles = [];
	const unreadArticles = [];
	digestData.articles.forEach(article => {
		hasBeenRead(article, articlesUserRead) ? readArticles.push(article) : unreadArticles.push(article);
	});

	return { readArticles, unreadArticles };
};
