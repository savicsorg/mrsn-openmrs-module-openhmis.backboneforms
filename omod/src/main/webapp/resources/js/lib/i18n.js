define(openhmis.url.backboneBase + "js/lib/i18n",
	[openhmis.url.backboneBase + 'js/lib/sprintf'],
	function() {
		var __ = function() {
			return sprintf.apply(null, arguments);
		}
		return __;
	}
);