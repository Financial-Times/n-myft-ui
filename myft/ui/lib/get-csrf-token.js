import Cookies from 'js-cookie';

module.exports = () => Cookies.get('FTSession_s') || Cookies.get('FTSession');
