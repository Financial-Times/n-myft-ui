import getToken from './get-csrf-token';

export default function ({
	token = getToken(),
	container = document.body,
	inputs = container.querySelectorAll('[data-myft-csrf-token]')
} = {}) {
	Array.from(inputs).forEach(input => {
		input.value = token;
	});
}
