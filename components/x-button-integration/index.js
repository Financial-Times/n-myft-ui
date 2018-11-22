import nextMyftClient from 'next-myft-client';

const listenForButtonClicks = (buttonEventName) => {
	document.body.addEventListener(buttonEventName, ({ detail }) => {
		const formData = {
			token: detail.token
		};

		nextMyftClient[detail.action](detail.actorType, detail.actorId, detail.relationshipName, detail.subjectType, detail.subjectId, formData);
	});
};

const dispatchButtonAction = (selector, action) => {
	const event = new CustomEvent('x-interaction.trigger-action', {
		detail: { action }
	});
	const buttonsForContentId = Array.from(document.querySelectorAll(selector));

	buttonsForContentId.forEach(el => el.parentNode.dispatchEvent(event));
};

export const initFollowButtons = () => {
	const getSelector = id => `form[data-concept-id="${id}"]`;

	document.body.addEventListener('myft.user.followed.concept.load', () => {
		nextMyftClient.loaded['followed.concept'].items.forEach(item =>
			dispatchButtonAction(getSelector(item.uuid), 'followed'));
	});

	document.body.addEventListener('myft.user.followed.concept.add', ({ detail }) =>
		dispatchButtonAction(getSelector(detail.subject), 'followed'));

	document.body.addEventListener('myft.user.followed.concept.remove', ({ detail }) =>
		dispatchButtonAction(getSelector(detail.subject), 'unfollowed'));

	listenForButtonClicks('x-follow-button');
};

export const initSaveButtons = () => {
	const getSelector = id => `form[data-content-id="${id}"]`;

	document.body.addEventListener('myft.user.saved.content.load', () => {
		nextMyftClient.loaded['saved.content'].items.forEach(item =>
			dispatchButtonAction(getSelector(item.uuid), 'saved'));
	});

	document.body.addEventListener('myft.user.saved.content.add', ({ detail }) =>
		dispatchButtonAction(getSelector(detail.subject), 'saved'));

	document.body.addEventListener('myft.user.saved.content.remove', ({ detail }) =>
		dispatchButtonAction(getSelector(detail.subject), 'unsaved'));

	listenForButtonClicks('x-article-save-button');
};
