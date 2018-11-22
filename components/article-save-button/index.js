import nextMyftClient from 'next-myft-client';
import * as xButtonIntegration from '../x-button-integration';

const loadSavedArticles = () => {
	return nextMyftClient.init()
		.then(() => {
			if (!nextMyftClient.loaded['saved.content']) {
				nextMyftClient.load({
					relationship: 'saved',
					type: 'content'
				});
			}
		});
};

// This entry point is deprecated. Use x-button-integration directly.
module.exports = {
	init: () => {
		xButtonIntegration.initSaveButtons();
		loadSavedArticles();
	}
};
