import Cookies from 'js-cookie';
const desiredTokenLength = 36;

export default () => {
	const token = Cookies.get('FTSession_s') || Cookies.get('FTSession');
	const trimmedToken = token ? token.slice(-desiredTokenLength) : '';
	return trimmedToken;
};
