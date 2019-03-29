const Overlay = require('o-overlay');

const overlayContent = `
<div class='instant-alerts-confirmation__text'>Would you like to receive instant alerts?</div>
<div class='instant-alerts-confirmation__buttons'>
	<button
			class="o-buttons instant-alerts-confirmation__button js-instant-alerts-confirmation-no"
			data-trackable="decline-instant-alerts"
			type="submit"
			aria-label="Not now"
			title="Not now">
		Not now
	</button><button
			class="o-buttons o-buttons--primary instant-alerts-confirmation__button js-instant-alerts-confirmation-yes"
			data-trackable="accept-instant-alerts"
			type="submit"
			aria-label="Yes"
			title="Yes">
		Yes
	</button>
	</div>
</div>
`;

module.exports = () => {
	const overlay = new Overlay('instant-alerts-confirmation', {
		heading: {
			title: 'You have added this topic to <abbr title="myFT" class="myft-ui__icon"></abbr>',
			shaded: false
		},
		modal: true,
		html: overlayContent
	});

	overlay.open();

	return overlay;
};
