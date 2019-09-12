import Tooltip from 'o-tooltip';
import myftClient from 'next-myft-client';

const isMyftPage = window.location.pathname.startsWith('/myft');
const externalReferrer = !document.referrer || !(new URL(document.referrer).hostname.endsWith('ft.com'));
const myftHeaderLogo = document.querySelector('.o-header__top-link--myft');
const flagIsEnabled = window.FT && window.FT.flags && window.FT.flags.get('myFT_HeaderTooltip');

export const init = () => {
	if (!externalReferrer || isMyftPage || !myftHeaderLogo || !flagIsEnabled) {
		return;
	}

	return myftClient.getAll('followed', 'concept')
		.then(followedConcepts => {
			if (followedConcepts.length) {
				const concepts = followedConcepts
					.sort((a, b) => b.lastPublished - a.lastPublished)
					.map(({name}) => `<span style="no-wrap">${name}</span>`).slice(0, 3);
				let content = 'Read the latest on ';

				if (concepts.length === 3) {
					content += `${concepts.shift()}, `;
				}

				content += concepts.join(' and ');
				content += ' stories.';

				new Tooltip(myftHeaderLogo, {
					target: 'myft-header-tooltip',
					content: content,
					showOnConstruction: true,
					position: 'below'
				});
			}
		});
};
