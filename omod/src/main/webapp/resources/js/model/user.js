define(
	[
		openhmis.url.backboneBase + 'js/lib/backbone',
		openhmis.url.backboneBase + 'js/model/generic'
	],
	function(Backbone, openhmis) {
		openhmis.User = openhmis.GenericModel.extend({
			meta: {
				restUrl: 'v1/user'
			},

			schema: {
				name: 'Text'
			},

			toString: function() {
				return this.get('name');
			}
		});

		return openhmis;
	}
);
