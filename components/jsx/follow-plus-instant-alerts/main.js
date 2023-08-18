
/**
 * This is just an example to highlight how we could add clientside JS to demos
 */
export const init = () => {
	const button = document.querySelector('[data-component="myft-follow-plus-instant-alert"]');

	button.addEventListener('click', (event) => {
		event.preventDefault();
		alert('clicked');
	});
};
