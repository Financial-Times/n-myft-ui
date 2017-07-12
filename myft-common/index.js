module.exports = {
	toggleState: function (btn, alreadyToggled) {

		const ariaLabel = btn.getAttribute('aria-label');
		const alternateAriaLabel = btn.getAttribute('data-alternate-label');

		if (ariaLabel) {
			btn.setAttribute('aria-label', alternateAriaLabel);
			btn.setAttribute('title', alternateAriaLabel);
			btn.setAttribute('data-alternate-label', ariaLabel);
		}
		const text = btn.textContent || btn.innerText;

		if (text) {
			const textVariant = btn.getAttribute('data-text-variant');
			const textEl = textVariant ? btn.querySelector('[data-variant-label]') : btn;
			const alternateText = btn.getAttribute('data-alternate-text') || alternateAriaLabel;
			textEl.textContent = alternateText;
			if(textVariant) {
				const setAltText = alternateText.includes('Saved') ? 'Save ' : 'Saved ';
				btn.setAttribute('data-alternate-text', setAltText);
			} else {
				btn.setAttribute('data-alternate-text', text);
			}
		}

		const isPressed = btn.getAttribute('aria-pressed') === 'true';

		if (!alreadyToggled) {
			btn.setAttribute('aria-pressed', !isPressed);
		}

		btn.dispatchEvent(new CustomEvent('nButtons.stateChange', {
			detail: {
				state: isPressed
			},
			bubbles: true
		}));

		return btn;
	}
};
