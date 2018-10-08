import nextMyftClient from 'next-myft-client';

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

const listenForApiSaveEvents = () => {
	document.body.addEventListener('myft.user.saved.content.load', () => {
		nextMyftClient.loaded['saved.content'].items.map(item => setButtonState(item.uuid, true));
	});
	document.body.addEventListener('myft.user.saved.content.add', ({ detail }) => setButtonState(detail.subject, true));
	document.body.addEventListener('myft.user.saved.content.remove', ({ detail }) => setButtonState(detail.subject, false));
};

const listenForSaveButtonClicks = () => {
	document.body.addEventListener('x-article-save-button', ({ detail }) => {
		const formData = {
			token: detail.token
		};

		nextMyftClient[detail.action](detail.actorType, detail.actorId, detail.relationshipName, detail.subjectType, detail.subjectId, formData);
	});
};

const setButtonState = (id, saved) => {
	const event = new CustomEvent('x-interaction.trigger-action', {
		detail: {
			action: saved ? 'saved' : 'unsaved'
		}
	});
	const buttonsForContentId = Array.from(document.querySelectorAll(`form[data-content-id="${id}"]`));

	buttonsForContentId.forEach(el => el.parentNode.dispatchEvent(event));
};

let initialised = false;

module.exports = {
	init: () => {
		if (initialised) {
			return Promise.resolve();
		}

		initialised = true;
		listenForApiSaveEvents();
		listenForSaveButtonClicks();
		return loadSavedArticles();
	}
};
