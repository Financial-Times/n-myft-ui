import React from 'react';
import CsrfToken from '../csrf-token/input';

/**
 * @typedef {object} PreferencesProperties
 * @property {string[]} currentPreferences
 * Current alert preferences the user has set up.
 * @property {object.<string, boolean>} flags
 * 	FT.com feature flags
 */

/**
 * Create a popup modal to manage myFT alert preferences
 * @public
 * @param {PreferencesProperties}
 * @returns {React.ReactElement}
*/
export default function InstantAlertsPreferencesModal({ flags, currentPreferences, hide=false, csrfToken, cacheablePersonalisedUrl, conceptId }) {
	if (!flags.myFtApiWrite) {
		return null;
	}

	const formattedCurrentPreferences = currentPreferences.join(', ');
	return (
		<div data-component-id="preferences-modal" className={`n-myft-ui__preferences-modal${hide ? ' n-myft-ui__preferences-modal__hide' : ''}`}>
			<div className="n-myft-ui__preferences-modal__content">
				<span className="o-forms-input o-forms-input--checkbox">
					<CsrfToken
						cacheablePersonalisedUrl={cacheablePersonalisedUrl}
						csrfToken={csrfToken}
					/>
					<input type="hidden" name="conceptId" value={conceptId}
					/>
					<label htmlFor="receive-instant-alerts">
						<input
							data-component-id="receive-instant-alerts"
							type="checkbox" name="receive-instant-alerts" value="receive-instant-alerts"
						/>
						<span className="o-forms-input__label n-myft-ui__preferences-modal__checkbox__message">
								Get instant alerts for this topic
						</span>
					</label>
				</span>
				<p className="n-myft-ui__preferences-modal__text">Your alerts are currently: {formattedCurrentPreferences}.</p>
				<a className="n-myft-ui__preferences-modal__text" href="/myft/alerts">Manage your preferences here</a>
				<button data-component-id="remove-from-myft" className="n-myft-ui__preferences-modal__remove-button">Remove from myFT</button>
			</div>
		</div>
	);
};