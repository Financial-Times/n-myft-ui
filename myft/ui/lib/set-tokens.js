import { $$ } from 'n-ui-foundations';

export default function (token) {
	const inputs = $$('[data-myft-csrf-token]');

	inputs.forEach(input => {
		input.value = token;
	});
}
