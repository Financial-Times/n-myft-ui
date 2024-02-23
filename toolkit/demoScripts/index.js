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
		let command = process.argv[4];
		if (!['demo-build', 'demo', 'static-demo'].includes(command)) {
			command = 'demo-build';
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

class RunPa11yCi extends Task {
	async run () {
		let serverProcess;

		const serverStartedPromise = new Promise((resolve, reject) => {
			serverProcess = spawn('node', ['demos/app.js']);
			hookFork(this.logger, 'server', serverProcess);

			serverProcess.stdout.on('data', data => {
				const message = data.toString();
				if (message.includes('event: "EXPRESS_START"')) {
					this.logger.info('Server started successfully.');
					resolve();
				}
			});

			serverProcess.on('error', error => {
				reject(error);
			});
		});

		await serverStartedPromise;

		const pa11yProcess = spawn('pa11y-ci', ['--config', '.pa11yci.js']);
		hookFork(this.logger, 'pa11y', pa11yProcess);

		await waitOnExit('pa11y', pa11yProcess);

		serverProcess.kill('SIGINT');
		this.logger.info('Server and related processes stopped.');
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

exports.tasks = [ DemoBuilder, DeployGhPages, TranspileJsx, RunPa11yCi ];
