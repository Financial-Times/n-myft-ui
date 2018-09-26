const relationshipConfig = {
	saved: {
		actorType: 'user',
		idProperty: 'data-content-id',
		subjectType: 'content',
		uiSelector: '[data-myft-ui="saved"]'
	},
	followed: {
		actorType: 'user',
		idProperty: 'data-concept-id',
		subjectType: 'concept',
		uiSelector: '[data-myft-ui="follow"]'
	},
	contained: {
		actorType: 'list',
		idProperty: 'data-content-id',
		subjectType: 'content',
		uiSelector: '[data-myft-ui="contained"]'
	}
};

export default relationshipConfig;
