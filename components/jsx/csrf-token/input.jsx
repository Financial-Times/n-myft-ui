const React = require('react');

/**
 * @typedef {object} CsrfInputProperties
 * @property {string} [csrfToken]
 * 	A token to mitigate Cross Site Request Forgery
 * @property {boolean} [cacheablePersonalisedUrl]
 * 	An indicator to decide whether its safe to set the button state on the server side. eg. there is no cache or the cache is personalised
 */

/**
 * Create a follow plus instant alerts button component
 * @public
 * @param {CsrfInputProperties}
 * @returns {React.ReactElement}
*/

module.exports = ({ csrfToken, cacheablePersonalisedUrl }) => {

	const token = cacheablePersonalisedUrl ? csrfToken : '';
	return (
		<input
			data-myft-csrf-token
			value={token}
			type="hidden"
			name="token" />
	);
}
