import myFtClient from 'next-myft-client';
import isMobile from './lib/is-mobile';
import openSaveArticleToListVariant from './save-article-to-list-variant';
import stringToHTMLElement from './lib/convert-string-to-html-element';

function showCreateListAndAddArticleOverlay (contentId, config) {
	const options = {
		name: 'myft-ui-create-list-variant',
		...config
	};

	return openSaveArticleToListVariant(contentId, options);
}

function openCreateListAndAddArticleOverlay (contentId, config) {
	return myFtClient.getAll('created', 'list')
		.then(createdLists => createdLists.filter(list => !list.isRedirect))
		.then(() => {
			return showCreateListAndAddArticleOverlay(contentId, config);
		});
}

function initialEventListeners () {

	document.body.addEventListener('myft.user.saved.content.add', event => {
		const contentId = event.detail.subject;

		// Checks if the createListAndSaveArticle variant is active
		// and will show the variant overlay if the user has no lists,
		// otherwise it will show the classic overlay
		const newListDesign = event.currentTarget.querySelector('[data-myft-ui-save-new="manageArticleLists"]');
		if (newListDesign) {
			const configKeys = newListDesign.dataset.myftUiSaveNewConfig.split(',');
			const config = configKeys.reduce((configObj, key) => (key ? { ...configObj, [key]: true} : configObj), {});

			// Temporary events on the public toggle feature.
			// These will be used to build a sanity check dashboard, and will be removed after we get clean-up this test.
			document.body.dispatchEvent(new CustomEvent('oTracking.event', {
				detail: {
					category: 'lists',
					action: 'savedArticle',
					article_id: contentId,
					teamName: 'customer-products-us-growth',
					amplitudeExploratory: true
				},
				bubbles: true
			}));

			return openCreateListAndAddArticleOverlay(contentId, config);
		}

	});

	document.body.addEventListener('myft.user.saved.content.remove', event => {
		const contentId = event.detail.subject;

		const newListDesign = event.currentTarget.querySelector('[data-myft-ui-save-new="manageArticleLists"]');
		if (newListDesign) {
			return showUnsavedNotification(contentId);
		}
	});
}

function showUnsavedNotification () {
	const parentSelector = isMobile() ? '.o-share--horizontal' : '.o-share--vertical';
	const parentNode = document.querySelector(parentSelector);

	// We're not supporting multiple notifications for now
	// If a notification is present, we'll silently avoid showing another
	if (document.querySelector('.myft-notification') || !parentNode) {
		return;
	}

	const content = `
		<p role="alert">Removed from <a href="https://www.ft.com/myft/saved-articles">saved articles</a> in myFT</p>
	`;

	const contentNode = stringToHTMLElement(content);

	const container = document.createElement('div');
	container.className = 'myft-notification';
	container.appendChild(contentNode);

	parentNode.appendChild(container);

	setTimeout(
		() => parentNode.removeChild(container),
		5 * 1000
	);
}

export function init () {
	initialEventListeners();
}
