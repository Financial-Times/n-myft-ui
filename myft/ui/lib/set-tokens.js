import { $$ as findElements } from 'n-ui-foundations';

export default function (token) {
	const inputs = findElements('[data-myft-csrf-token]');

	inputs.forEach(input => {
		input.value = token;
	});
}
