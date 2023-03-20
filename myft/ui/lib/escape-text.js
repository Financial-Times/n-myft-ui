export default function escapeText (text) {
	if (typeof text !== 'string' || !text instanceof String) {
		return '';
	}

	const tagsToReplace = {
		'&': '&amp;',
		'<': '&lt;',
		'>': '&gt;'
	};

	return text.replace(/[&<>]/g, function (tag) {
		return tagsToReplace[tag] || tag;
	});
}
