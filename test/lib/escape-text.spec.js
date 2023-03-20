const expect = require('chai').expect;
const escapeText = require('../../myft/ui/lib/escape-text');

describe('escapeText', function () {
	it('should escape an anchor tag', () => {
		const input = '<a onclick="console.log(\'muahaha\')"></a>';
		const expectedOutput = '&lt;a onclick="console.log(\'muahaha\')"&gt;&lt;/a&gt;';
		expect(escapeText(input)).to.equal(expectedOutput);
	});

	it('should escape ampersands', () => {
		const input = '&lt;a onclick="console.log(\'muahaha\')"&gt;&lt;/a&gt;';
		const expectedOutput = '&amp;lt;a onclick="console.log(\'muahaha\')"&amp;gt;&amp;lt;/a&amp;gt;';
		expect(escapeText(input)).to.equal(expectedOutput);
	});

	it('should return empty string for inputs that are not strings', () => {
		const input = true;
		const expectedOutput = '';
		expect(escapeText(input)).to.equal(expectedOutput);
	});
});
