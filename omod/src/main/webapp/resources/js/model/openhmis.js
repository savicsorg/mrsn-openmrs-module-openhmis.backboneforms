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
			openhmis.url.backboneBase + 'js/model/fieldGenHandler'
	],
	function(openhmis, __) {
		openhmis.AttributeTypeBase = openhmis.GenericModel.extend({
			meta: {},
			schema: {},

			initialize: function (attributes, options) {
				openhmis.GenericModel.prototype.initialize.call(this, attributes, options);

				// All instance attribute types are metadata
				this.meta.openmrsType = "metadata";

				// Add default names if not defined
				if (this.meta === undefined || this.meta.name === undefined) {
					this.meta.name = "Attribute Type";
				}
				if (this.meta === undefined || this.meta.namePlural === undefined) {
					this.meta.namePlural = "Attribute Types";
				}

				// Add default schema fields
				this.schema.name = { type: 'Text' };
				this.schema.format = {
					type: 'Select',
					options: new openhmis.FieldFormatCollection()
				};
				this.schema.foreignKey = { type: 'BasicNumber' };
				this.schema.regExp = { type: 'Text' };
				this.schema.required = { type: 'Checkbox' };
                this.schema.attributeOrder = {type: 'Hidden'};
			},

			validate: function (attrs, options) {
				if (!attrs.name) {
					return { name: __("A name is required") }
				}
				return null;
			},

			toString: function () {
				return this.get('name');
			}
		});

		openhmis.CustomizableInstanceTypeBase = openhmis.GenericModel.extend({
            meta: {},
            schema: {},

            attributeType: null,

			initialize: function(attributes, options) {
				this.schema.attributeTypes = {
					type: 'List',
					itemType: 'NestedModel',
					model: this.attributeType
				};
			},

			parse: function(resp) {
				if (resp.attributeTypes) {
					var attributeTypes = resp.attributeTypes;
					resp.attributeTypes = [];

					for (var attrType in attributeTypes) {
						var type = new this.attributeType(attributeTypes[attrType], { parse: true });
						if (attributeTypes[attrType].order !== undefined) {
							resp.attributeTypes[attributeTypes[attrType].order] = type;
						} else {
							resp.attributeTypes.push(type);
						}
					}
				}
				return resp;
			}
		});
	}
);