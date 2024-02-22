const { Task } = require('@dotcom-tool-kit/types');
const { spawn } = require('child_process');
const { hookFork, waitOnExit } = require('@dotcom-tool-kit/logger');
const karmaCLIPath = require.resolve('karma/bin/karma');

class Karma extends Task {
	async run () {
		const args = ['start', 'karma.conf.js'];
		this.logger.info(`running karma ${args.join(' ')}`);
		const child = spawn(karmaCLIPath, args);
		hookFork(this.logger, 'karma', child);
		return waitOnExit('karma', child);
	}
}

exports.tasks = [ Karma ];
