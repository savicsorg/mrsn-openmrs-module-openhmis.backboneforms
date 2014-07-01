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
		openhmis.url.backboneBase + 'js/lib/i18n'
	],
	function(openhmis, __) {
		openhmis.Role = openhmis.GenericModel.extend({
			meta: {
				name: __("Role"),
				namePlural: __("Roles"),
				restUrl: 'v1/role'
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
