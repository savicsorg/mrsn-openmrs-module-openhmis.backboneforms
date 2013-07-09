define(
	[
		openhmis.url.backboneBase + 'js/model/generic',
		openhmis.url.backboneBase + 'js/lib/i18n'
	],
	function(openhmis, __) {
		openhmis.Location = openhmis.GenericModel.extend({
			meta: {
				name: __("Visit"),
				namePlural: __("Visits"),
				restUrl: 'v1/location'
			},

			schema: {
				name: 'Text'
			},

			toString: function() {
				return this.get("display") || this.get("name");
			}
		});

		return openhmis;
	}
);
