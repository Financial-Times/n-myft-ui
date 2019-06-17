import nextMyftClient from 'next-myft-client';
import {offerInstantAlerts} from '../../myft/ui/lib/push-notifications';

const listenForFollowButtonClicks = (buttonEventName, pushNotificationsAreEnabled) => {
	const buttonEventHandler = ({ detail }) => {
		const formData = {
			token: detail.token
		};

		nextMyftClient[detail.action](detail.actorType, detail.actorId, detail.relationshipName, detail.subjectType, detail.subjectId, formData)
			.then( () => {
				if( pushNotificationsAreEnabled ) {
					if (detail.action === 'add' && detail.relationshipName === 'followed') {
						offerInstantAlerts(detail.subjectId);
					}
				}
			});
	};
	document.body.removeEventListener(buttonEventName, buttonEventHandler);
	document.body.addEventListener(buttonEventName, buttonEventHandler);
};

const listenForSaveButtonClicks = (buttonEventName) => {
	const buttonEventHandler = ({ detail }) => {
		const formData = {
			token: detail.token
		};

		nextMyftClient[detail.action](detail.actorType, detail.actorId, detail.relationshipName, detail.subjectType, detail.subjectId, formData);
	};
	document.body.removeEventListener(buttonEventName, buttonEventHandler);
	document.body.addEventListener(buttonEventName, buttonEventHandler);
};

export const initFollowButtons = (pushNotificationsAreEnabled=false) => listenForFollowButtonClicks('x-follow-button', pushNotificationsAreEnabled);
export const initSaveButtons = () => listenForSaveButtonClicks('x-article-save-button');
