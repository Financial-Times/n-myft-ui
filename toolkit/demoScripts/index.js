const { Task, Hook } = require('@dotcom-tool-kit/types');
const { spawn } = require('child_process');
const { hookFork, waitOnExit } = require('@dotcom-tool-kit/logger');

class ShExcutor extends Task {
	async executeCommand (command, scriptPath, args = []) {
		if (!command) {
			throw new Error('Invalid command');
		}

		this.logger.info(`running sh script: ${command}`);
		const deployChild = spawn(scriptPath, args, { shell: true });
		hookFork(this.logger, command, deployChild);
		return waitOnExit(command, deployChild);
	}
}

class DemoBuilder extends ShExcutor {
	async run () {
		const command = process.argv[4];
		if (!['demo-build', 'demo', 'static-demo'].includes(command)) {
			throw new Error(`Invalid command: ${command}`);
		}

		return this.executeCommand(`build-demo: ${command}`, 'scripts/build-demo.sh', [command]);
	}
}

class DeployGhPages extends ShExcutor {
	async run () {
		return this.executeCommand('deploy-gh-pages', 'scripts/deploy-gh-pages.sh');
	}
}

class TranspileJsx extends ShExcutor {
	async run () {
		return this.executeCommand('transpile-jsx', 'scripts/transpile-jsx.sh');
	}
}
class buildDemo extends Hook {
	async check () {
		return true;
	}
}
class deployGhPages extends Hook {
	async check () {
		return true;
	}
}

exports.hooks = {
	'build:demo': buildDemo,
	'deploy:gh-pages': deployGhPages
};

exports.tasks = [ DemoBuilder, DeployGhPages, TranspileJsx ];
