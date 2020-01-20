const Overlay = require('o-overlay').default;

const buildOverlayContent = isBlocked => `
<div class='instant-alerts-confirmation__info'>
	<div class='instant-alerts-confirmation-info__icon'></div>
	<div class='instant-alerts-confirmation-info__text'>Would you like to receive instant alerts on this device?</div>
</div>
${isBlocked ? '<div class=\'instant-alerts-confirmation-info__subtext\'>Unblock notifications to receive them on this device.</div>' : ''}
<div class='instant-alerts-confirmation__buttons'>
	<button
			class="o-buttons o-buttons--secondary instant-alerts-confirmation__button js-instant-alerts-confirmation-no"
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

module.exports = (isBlocked) => {
	const overlayName = 'instant-alerts-confirmation';
	// If an overlay already exists of the same name destroy it.
	const overlays = Overlay.getOverlays();
	const existingOverlay = overlays[overlayName];
	if (existingOverlay) {
		existingOverlay.destroy();
	}
	const overlay = new Overlay(overlayName, {
		heading: {
			title: 'You have added this topic to <abbr title="myFT" class="myft-ui__icon"></abbr>',
			shaded: false
		},
		modal: true,
		html: buildOverlayContent(isBlocked)
	});

	overlay.open();

	return overlay;
};
