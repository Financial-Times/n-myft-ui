const customDataSettings = {
	concept: {
		idLabel: 'concept_id',
		add: 'follow',
		remove: 'unfollow'
	},
	content: {
		idLabel: 'article_id',
		add: 'save',
		remove: 'unsave'
	}
};

/**
 * sendEvent - dispatches event to oTracking
 * @param {Object} customData extra data to send through in the custom event. { action: 'someaction', thingtype_id: 'someid'}
 */
const sendEvent = (customData) => {
	const detail = Object.assign({}, customData, { category: 'myFT' });
	document.body.dispatchEvent(new CustomEvent('oTracking.event', { detail, bubbles: true }));
};
/**
 * getExtraContext. Data team require a keyname for the subject's ID that matches the type of subject
 * @param {String} subjectType what type of subject has been changed
 * @param {String} subjectId ID of the subject
 * @return {Object} key-value pair for the subject ID with appropriate keyname
 */
const getExtraContext = (subjectType, subjectId) => {
	const extraContext = {};
	const idLabel = customDataSettings[subjectType].idLabel;
	extraContext[idLabel] = subjectId;
	return extraContext;
};

/**
 * getAction get the action that matches both type and state for the custom event e.g. follow or unfollow
 * @param {String} subjectType what type of subject is affected
 * @param {String} action What was the change? 'add', 'remove', 'update'
 * @param {Object} postedData Event's extra data (required for checking if an instant alert was turned on or off)
 * @return {String} label for the action to send in the custom event
 */
const getAction = (subjectType, action, postedData) => {
	if (action === 'update' && subjectType === 'concept') {
		const updateState = (postedData && postedData._rel && postedData._rel.instant && postedData._rel.instant === 'true') ? 'on' : 'off';
	  return `instant-alert-${updateState}`;
	} else {
		return customDataSettings[subjectType][action];
	}
};

/**
 * calls custom events for following and saving to give more detail - making active or inactive, and ID of subject
 * @param {Object} eventData Data from the user event required to create this event- subjectType, action, postedData data object
 */
export function custom (eventData) {
	if (Object.keys(customDataSettings).indexOf(eventData.subjectType) !== -1) {
		const options = { action: getAction(eventData.subjectType, eventData.action, eventData.postedData) };
		const extraContext = getExtraContext(eventData.subjectType, eventData.subjectId);
		Object.assign(options, extraContext);
		sendEvent(options);
	}
}
