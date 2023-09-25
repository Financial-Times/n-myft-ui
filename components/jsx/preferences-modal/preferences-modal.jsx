import React from 'react';

/**
 * @typedef {Object} PreferencesProperties
 * @property {string} conceptId
 * Concept id of the concept which the modal controls
 * @property {Record<string, boolean>} flags
 * FT.com feature flags
 * @property {boolean} visible
 * Controls the visibility of the modal
 */

/**
 * Create a popup modal to manage myFT alert preferences
 * @public
 * @param {PreferencesProperties}
 * @returns {React.ReactElement}
*/
export default function InstantAlertsPreferencesModal({ flags, conceptId, visible }) {
	if (!flags.myFtApiWrite) {
		return null;
	}

	return (
		<div
			className={`n-myft-ui__preferences-modal ${visible ? 'n-myft-ui__preferences-modal--show' : ''}`}
			data-component-id="myft-preferences-modal"
			data-concept-id={conceptId}
		>
			<div className="n-myft-ui__preferences-modal__content">
				<span className="o-forms-input o-forms-input--checkbox">
					<label htmlFor="receive-instant-alerts">
						<input
							id="receive-instant-alerts"
							type="checkbox"
							name="receive-instant-alerts"
							value="receive-instant-alerts"
							data-component-id="myft-preferences-modal-checkbox"
						/>
						<span className="o-forms-input__label n-myft-ui__preferences-modal__checkbox__message">
							Get instant alerts for this topic
						</span>
					</label>
				</span>

				<p data-component-id="myft-preferences-modal-list" className="n-myft-ui__preferences-modal__text"></p>
				<a className="n-myft-ui__preferences-modal__text" href="/myft/alerts" data-trackable="pop-up-box|contact-preference">Manage your delivery channels here</a>
				<span className="n-myft-ui__preferences-modal-error" data-component-id="myft-preference-modal-error"></span>
				<button className="n-myft-ui__preferences-modal__remove-button" data-component-id="myft-preference-modal-remove" data-trackable="pop-up-box|remove-from-myFT">Remove from myFT</button>
			</div>
		</div>
	);
};
