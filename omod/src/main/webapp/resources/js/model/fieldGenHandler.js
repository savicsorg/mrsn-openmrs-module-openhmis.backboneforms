/*
 * The contents of this file are subject to the OpenMRS Public License
 * Version 2.0 (the "License"); you may not use this file except in
 * compliance with the License. You may obtain a copy of the License at
 * http://license.openmrs.org
 *
 * Software distributed under the License is distributed on an "AS IS"
 * basis, WITHOUT WARRANTY OF ANY KIND, either express or implied. See the
 * License for the specific language governing rights and limitations
 * under the License.
 *
 * Copyright (C) OpenMRS, LLC.  All Rights Reserved.
 */
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