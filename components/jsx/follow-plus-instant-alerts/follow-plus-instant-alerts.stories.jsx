import FollowPlusInstantAlerts from './follow-plus-instant-alerts';
import InstantAlertsPreferencesModal from '../preferences-modal/preferences-modal';

// Add client side behaviour
import { init } from './main.js';
import { init as preferenceModalInit } from '../preferences-modal/main.js';

// Add component styles
import './main.scss';
import '../preferences-modal/main.scss';

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
		preferenceModalInit();
	}
};

const ButtonAndPrefsTemplate = {
	render: (props) => {
		return(
			<div>
				<FollowPlusInstantAlerts {...props} />
				<InstantAlertsPreferencesModal {...props} currentPreferences={[]}/>
			</div>
		)
	}
};

export const Button = {
	args: {
		flags: {
			myFtApiWrite: true
		}
	}
};


export const ButtonAndPreferenceModal = {
	...ButtonAndPrefsTemplate,
	args: {
		flags: {
			myFtApiWrite: true
		}
	}
};