/** @type { import('@storybook/react-webpack5').StorybookConfig } */
const config = {
	stories: [
		'../components/**/*.stories.jsx'
	],
	addons: [
		'@storybook/addon-essentials',
		'@storybook/addon-interactions',
	],
	framework: {
		name: '@storybook/react-webpack5',
		options: {},
	},
	docs: {
		autodocs: 'tag',
	},
};
export default config;
