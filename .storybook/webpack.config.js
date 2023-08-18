// This configuration extends the existing Storybook Webpack config.
// See https://storybook.js.org/configurations/custom-webpack-config/ for more info.

const glob = require('glob');
const path = require('path');

module.exports = ({ config }) => {
	config.resolve.alias['mathsass/dist/math'] = path.resolve(__dirname, '../', 'node_modules/mathsass/dist/_math');

	config.module.rules.push({
		test: /\.(scss|sass)$/,
		use: [
			{
				loader: require.resolve('style-loader')
			},
			{
				loader: require.resolve('css-loader'),
				options: {
					url: false,
					import: false
				}
			},
			{
				loader: require.resolve('sass-loader'),
				options: {
					sassOptions: {
						includePaths: glob.sync('./components/*/node_modules', { absolute: true })
					}
				}
			}
		]
	});

	return config;
};
