/**
 * This is just an example to highlight how we could add clientside JS to demos
 */
export const init = () => {
	document.addEventListener('n-myft-ui.load-preference-modal', () => {
		alert('Preference modal was trigged');
	});
};
