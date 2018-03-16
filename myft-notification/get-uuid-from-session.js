const sessionClient = require('next-session-client');

module.exports = async function () {
	return sessionClient.uuid()
		.then(({ uuid }) => uuid);
};
