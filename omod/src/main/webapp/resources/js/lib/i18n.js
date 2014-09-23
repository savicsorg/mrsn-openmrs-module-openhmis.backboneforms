define(openhmis.url.backboneBase + "js/lib/i18n",
[
	openhmis.url.backboneBase + 'js/lib/sprintf'
],
function() {
	var __ = function() {
		return sprintf.apply(null, arguments);
	}
	
	openhmis.pluralize = function(singular) {
		var endsWithS = singular.charAt(singular.length - 1) === 's';
		return endsWithS ? singular + "es" : singular + "s";
	}
	
	return __;
});