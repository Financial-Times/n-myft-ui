import nextMyftClient from 'next-myft-client';

const buttonEventHandler = ({ detail }) => {
	const formData = {
		token: detail.token
	};

	nextMyftClient[detail.action](detail.actorType, detail.actorId, detail.relationshipName, detail.subjectType, detail.subjectId, formData);
};

const listenForButtonClicks = (buttonEventName) => {
	document.body.removeEventListener(buttonEventName, buttonEventHandler);
	document.body.addEventListener(buttonEventName, buttonEventHandler);
};

export const initFollowButtons = () => listenForButtonClicks('x-follow-button');

export const initSaveButtons = () => listenForButtonClicks('x-article-save-button');
