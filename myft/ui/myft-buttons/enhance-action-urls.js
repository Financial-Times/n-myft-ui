export default function (context = document) {
	['follow', 'save', 'instant']
		.forEach(type => {
			Array.from(context.querySelectorAll(`form.n-myft-ui--${type}`))
				.forEach(form => {
					const action = form.getAttribute('data-js-action');
					if (!action) return;
					form.setAttribute('method', 'POST');
					form.setAttribute('action', action);
				});
		});
}
