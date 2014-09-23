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
		openhmis.url.backboneBase + 'js/model/generic',
		openhmis.url.backboneBase + 'js/lib/i18n',
		openhmis.url.backboneBase + 'js/model/patient'
	],
	function(openhmis, __) {
		openhmis.Visit = openhmis.GenericModel.extend({
			meta: {
				name: __("Visit"),
				namePlural: __("Visits"),
				restUrl: "v1/visit"
			},
			schema: {
				startDatetime: { type: "Text" },
				stopDatetime: { type: "Text" }
			},
			
			/**
			 * fetchVisitsByPatient
			 *
			 * Fetches a list of visits for the specified patient
			 * @returns GenericCollection of Visits
			 */
			fetchVisitsByPatient: function(options) {
				var patientUuid;
				var success = (options && options.success) ? options.success : undefined;
				if (options && options.patient instanceof openhmis.Patient)
					patientUuid = options.patient.get("uuid")
				else if (options && typeof options.patient === "string")
					patientUuid = options.patient;
				else
					throw __("Invalid patient argument provided");
				var query = "?patient=" + encodeURIComponent(patientUuid);
				var patientCollection = new openhmis.GenericCollection([], { model: openhmis.Visit });
				patientCollection.fetch({
					url: patientCollection.url + query,
					success: function(model, resp) {
						if (options && options.active === true)
							model.reset(model.reject(function(visit) { return visit.get("stopDatetime") }));
						if (success)
							success(model, resp);
					}
				});
				return patientCollection;
			},
			
			end: function(date, options) {
				date = date ? date : new Date();
				this.set("stopDatetime", openhmis.iso8601Date(date));
				this.save([], options);
			}
		});
		
		return openhmis;
	}
)