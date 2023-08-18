import FollowPlusInstantAlerts from './follow-plus-instant-alerts';

// Add client side behaviour
import { init } from './main.js';

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
	play: () => {
		/**
		 * Slight hack
		 * Take advantage of the play option here to load the client side behaviour
		 * This works because the play command is run after the component has been rendered
		 */
		init();
	}
};

export const Button = {
	args: {
		flags: {
			myFtApiWrite: true
		}
	}
};