const myFtButtons = require('./myft-buttons');
const lists = require('./lists');
const personaliseLinks = require('./personalise-links');
const updateUi = require('./update-ui');

function init (opts) {
	myFtButtons.init(opts);
	if (opts.flags.get('myftLists')) {
		lists.init();
	}
}

export {
	init,
	personaliseLinks,
	updateUi
};