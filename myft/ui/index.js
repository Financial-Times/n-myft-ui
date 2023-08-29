import * as myFtButtons from './myft-buttons';
import * as lists from './lists';
import personaliseLinks from './personalise-links';
import updateUi from './update-ui';


function init (opts) {
	myFtButtons.init(opts);
	lists.init();
}

export {
	init,
	personaliseLinks,
	updateUi
};
