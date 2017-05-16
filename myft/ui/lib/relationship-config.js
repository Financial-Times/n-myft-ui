export default {
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
	preferred: {
		actorType: 'user',
		idProperty: 'data-preference-name',
		subjectType: 'preference',
		uiSelector: '[data-myft-ui="prefer"]'
	},
	contained: {
		actorType: 'list',
		idProperty: 'data-content-id',
		subjectType: 'content',
		uiSelector: '[data-myft-ui="contained"]'
	}
}