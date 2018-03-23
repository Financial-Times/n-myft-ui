exports.init = () => {
	getPackageExpanders().forEach(synchroniseExpansion);
};

function getPackageExpanders (opts) {
	const expanders = [...document.querySelectorAll('.myft-notification')];
	const except = opts && opts.except;
	return except ? expanders.filter(x => x !== except) : expanders;
}

function synchroniseExpansion (expander) {
	expander.addEventListener('oExpander.expand', (event) => {
		getPackageExpanders({ except: event.target }).forEach(expand);
	});
	expander.addEventListener('oExpander.collapse', (event) => {
		getPackageExpanders({ except: event.target }).forEach(collapse);
	});
}

function expand (el) {
	setState(el, 'expanded');
}

function collapse (el) {
	setState(el, 'collapsed');
}

function setState (el, state) {
	const toggle = el.querySelector('.o-expander__toggle');
	const content = el.querySelector('.o-expander__content');
	toggle.setAttribute('aria-expanded', state === 'collapsed' ? 'false' : 'true');
	content.setAttribute('aria-hidden', state === 'collapsed' ? 'true' : 'false');
}
