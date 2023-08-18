import FollowPlusInstantAlerts from './follow-plus-instant-alerts';

// Add component styles
import './main.scss';

export default {
	title: 'Follow Plus Instant Alerts',
	component: FollowPlusInstantAlerts,
	parameters: {
		layout: 'centered',
	},
	tags: ['autodocs'],
	argTypes: {
		conceptId: { control: 'text'},
		name: { control: 'text'},
		setInstantAlertsOn: { control: 'boolean' },
		setFollowButtonStateToSelected: {
			control: 'boolean',
			description: 'This might be combined with "cacheablePersonalisedUrl" set to true',
		},
		cacheablePersonalisedUrl: { control: 'boolean' },
		flags: { control: 'object' },
	},
};

export const Button = {
	args: {
		flags: {
			myFtApiWrite: true
		}
	}
};