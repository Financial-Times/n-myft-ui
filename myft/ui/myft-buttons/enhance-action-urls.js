import relationshipConfig from '../lib/relationship-config';

export default function (context = document) {
	[
		relationshipConfig.followed.uiSelector,
		relationshipConfig.saved.uiSelector,
		'[data-myft-ui="instant"]'
	]
		.forEach(selector => {
			Array.from(context.querySelectorAll(selector))
				.forEach(form => {
					if (form.dataset.jsAction) {
						form.setAttribute('method', 'POST');
						form.setAttribute('action', form.dataset.jsAction);
						delete form.dataset.jsAction;
					}
				});
		});
}
