const myftApiClient = require('next-myft-client');

const prioritise = uuid => myftApiClient.add('user', null, 'prioritised', 'concept', uuid);

const unprioritise = uuid => myftApiClient.remove('user', null, 'prioritised', 'concept', uuid);

const reloadPage = () => {
	if(window.location) {
		location.reload();
	}
};

export default (node) => {
	const uuid = node.dataset.conceptId;
	const action = node.dataset.prioritised === 'true' ? unprioritise : prioritise;
	action(uuid).then(() => {
		reloadPage();
	});
};
