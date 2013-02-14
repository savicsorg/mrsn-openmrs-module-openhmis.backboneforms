define(
	[
		openhmis.url.backboneBase + 'js/lib/backbone',
		openhmis.url.backboneBase + 'js/lib/underscore',
		openhmis.url.backboneBase + 'js/model/generic'
	],
	function(Backbone, _, openhmis) {
		openhmis.FieldGenHandler = Backbone.Model.extend({
			urlRoot: openhmis.url.openmrs + 'fieldgenhandlers.json',
			parse: function(resp) {
				return { uuid: resp, name: resp };
			},
			toString: function() { return this.get('name'); }
		});
		
		openhmis.FieldFormatCollection = openhmis.GenericCollection.extend({
			model: openhmis.FieldGenHandler,
			parse: function(response) {
				var results = response.results;
				for (var result in results) {
					switch (results[result]) {
						// As per PersonAttributeTypeFormController.java, remove inapplicable formats
						case "java.util.Date":
						case "org.openmrs.Patient.exitReason":
						case "org.openmrs.DrugOrder.discontinuedReason":
							results[result] = undefined;
							break;
					}
				}
				do {
					var undefinedId = _.indexOf(results, undefined);
					if (undefinedId !== -1)
						results.splice(undefinedId, 1);
				} while (undefinedId !== -1)
				results.unshift("java.lang.Character");
				results.unshift("java.lang.Integer");
				results.unshift("java.lang.Float");
				results.unshift("java.lang.Boolean");
				return results;
			}
		});
	}
);