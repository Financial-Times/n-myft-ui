const chai = require('chai');
const fetchMock = require('fetch-mock');
const fetchDigestData = require('../fetch-digest-data');

chai.use(require('sinon-chai'));

const createMockArticle = id => ({ id });

const mockData = {
	data: {
		user: {
			digest: {
				type: 'daily',
				concepts: [
					{
						articles: [
							createMockArticle('article-0-0'),
							createMockArticle('article-0-1')
						]
					},
					{
						articles: [
							createMockArticle('article-1-0'),
							createMockArticle('article-1-1')
						]
					}
				]
			}
		}
	}
};

const expect = chai.expect;
const USER_UUID = '0-0-0-0';
const allArticles = mockData.data.user.digest.concepts.reduce((acc, concept) => acc.concat(concept.articles), []);

describe('fetch-digest-data', () => {
	let data1;
	let data2;
	let data3;

	beforeEach(() => {
		fetchMock.get('*', mockData);
	});

	afterEach(fetchMock.reset);

	describe('http request - cached', () => {
		beforeEach(() => {
			return Promise.all([
				fetchDigestData(USER_UUID),
				fetchDigestData(USER_UUID),
				fetchDigestData(USER_UUID)
			]);
		});

		it('should request the data only once', () => {
			expect(fetchMock.calls().matched.length).to.equal(1);
		});
	});

	describe('http request - forced', () => {
		beforeEach(() => {
			return Promise.all([
				fetchDigestData(USER_UUID, true),
				fetchDigestData(USER_UUID, true)
			]);
		});

		it('should request the data each time', () => {
			expect(fetchMock.calls().matched.length).to.equal(2);
		});
	});

	describe('resolved values', () => {
		beforeEach(() => {
			return Promise.all([
				fetchDigestData(USER_UUID),
				fetchDigestData(USER_UUID),
				fetchDigestData(USER_UUID)
			]).then(values => [data1, data2, data3] = values);
		});

		it('should return a new object each time', () => {
			expect(data1).not.to.equal(data2);
			expect(data1).not.to.equal(data3);
			expect(data2).not.to.equal(data3);
		});

		it('should extract the articles from the concepts', () => {
			expect(Array.isArray(data1.user.digest.articles)).to.equal(true);
			expect(data1.user.digest.articles.length).to.equal(allArticles.length);
		});
	});
});
