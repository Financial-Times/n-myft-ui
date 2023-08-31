import React from 'react';
import CsrfToken from '../csrf-token/input';

/**
 * @typedef {object} FollowProperties
 * @property {string} conceptId
 * 	The ID for the concept
 * @property {string} name
 * 	The user facing label for the concept
  * @property {string} [csrfToken]
 * 	A token to mitigate Cross Site Request Forgery
 * @property {boolean} [setFollowButtonStateToSelected]
 * 	An indicator to state whether the button state should be set to selected on the server side
 * @property {boolean} [cacheablePersonalisedUrl]
 * 	An indicator to decide whether its safe to set the button state on the server side. eg. there is no cache or the cache is personalised
 * @property {boolean} [setInstantAlertsOn]
 * 	An indicator to switch the rendering to show instant alerts as turned on
 * @property {object.<string, boolean>} flags
 * 	FT.com feature flags
 */

/**
 * Create a follow plus instant alerts button component
 * @public
 * @param {FollowProperties}
 * @returns {React.ReactElement}
*/

export default function FollowPlusInstantAlerts({ conceptId, name, csrfToken, setFollowButtonStateToSelected, cacheablePersonalisedUrl, setInstantAlertsOn, flags }) {
	if (!flags.myFtApiWrite) {
		return null;
	}

	const dynamicFormAttributes = setFollowButtonStateToSelected && cacheablePersonalisedUrl ? {
		'action': `/myft/remove/${conceptId}`,
		'data-js-action': `/__myft/api/core/followed/concept/${conceptId}?method=delete`
	} : {
		'action': `/myft/add/${conceptId}`,
		'data-js-action': `/__myft/api/core/followed/concept/${conceptId}?method=put`
	};

	const dynamicButtonAttributes = setFollowButtonStateToSelected && cacheablePersonalisedUrl ? {
		'aria-label': `Added ${name} to myFT: click to manage alert preferences or remove from myFT`,
		'title': `Manage ${name} alert preferences or remove from myFT`,
		'data-alternate-label': `Add to myFT: ${name}`,
		'aria-pressed': true,
		'data-alternate-text': 'Add to myFT'
	} : {
		'aria-label': `Add ${name} to myFT`,
		'title': `Add ${name} to myFT`,
		'data-alternate-label': `Added ${name} to myFT: click to manage alert preferences or remove from myFT`,
		'aria-pressed': false,
		'data-alternate-text': 'Added'
	};

	const buttonText = setFollowButtonStateToSelected && cacheablePersonalisedUrl ?
		'Added' :
		'Add to myFT';

	return (
		<form
			{...dynamicFormAttributes}
			className="n-myft-ui n-myft-ui--follow"
			method="GET"
			data-myft-ui="follow"
			data-concept-id={conceptId}>
			<div
				className="n-myft-ui__announcement o-normalise-visually-hidden"
				aria-live="assertive"
				data-pressed-text={`Now following ${name}.`}
				data-unpressed-text={`No longer following ${name}.`}
			></div>
			<CsrfToken
				cacheablePersonalisedUrl={cacheablePersonalisedUrl}
				csrfToken={csrfToken}
			/>
			<button
				{...dynamicButtonAttributes}
				className={`n-myft-follow-button n-myft-follow-button--instant-alerts ${setInstantAlertsOn ? 'n-myft-follow-button--instant-alerts--on' : ''}`}
				data-concept-id={conceptId}
				data-trackable="follow"
				type="submit"
				data-component-id="myft-follow-plus-instant-alerts">
				{buttonText}
			</button>
		</form>
	);
};
