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

			initialize: function(attributes, options) {
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
                this.schema.attributeOrder = {type: 'BasicNumber'};
			},

			validate: function(attrs, options) {
				if (!attrs.name) {
					return { name: __("A name is required") }
				}
				return null;
			},

			toString: function() {
				return this.get('name');
			}
		});

        openhmis.InstanceAttributeTypeBase = openhmis.AttributeTypeBase.extend({
            initialize: function (attributes, options) {
                openhmis.AttributeTypeBase.prototype.initialize.call(this, attributes, options);

                this.schema.attributeOrder = {type: 'Hidden'};
            }
        });

        openhmis.AttributeBase = openhmis.GenericModel.extend({
            schema: {},

            attributeTypeClass: null,
            attributeTypeEditor: null,

            initialize: function(attributes, options) {
                openhmis.GenericModel.prototype.initialize.call(this, attributes, options);

                var temp = new this.attributeTypeClass();

                this.schema.attributeType = {
                    type: this.attributeTypeEditor,
                    title: temp.meta.name,
                    options: new openhmis.GenericCollection(null, {
                        model: this.attributeTypeClass,
                        url: temp.meta.restUrl
                    }),
                    objRef: true
                };
                this.schema.value = {
                    type: "Text"
                };
            },

            parse: function(resp) {
                if (resp.attributeType) {
                    resp.attributeType = new this.attributeTypeClass(resp.attributeType, { parse: true });
                }

                return resp;
            },

            toString: function() {
                return this.get('attributeType').name + ': ' + this.get('value');
            }
        });

		openhmis.CustomizableInstanceTypeBase = openhmis.GenericModel.extend({
            meta: {},
            schema: {},

            attributeTypeClass: null,

			initialize: function(attributes, options) {
                openhmis.GenericModel.prototype.initialize.call(this, attributes, options);

				this.schema.attributeTypes = {
					type: 'List',
					itemType: 'NestedModel',
					model: this.attributeTypeClass,
                    subResource: true
				};
			},

			parse: function(resp) {
				if (resp.attributeTypes) {
					var attributeTypes = resp.attributeTypes;
					resp.attributeTypes = [];

					for (var attrType in attributeTypes) {
						var type = new this.attributeTypeClass(attributeTypes[attrType], { parse: true });
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

        openhmis.CustomizableBase = openhmis.GenericModel.extend({
            meta: {},
            schema: {},

            attributeClass: null,

            initialize: function(attributes, options) {
                openhmis.GenericModel.prototype.initialize.call(this, attributes, options);

                this.schema.attributes = {
                    type: 'List',
                    itemType: 'NestedModel',
                    model: this.attributeClass,
                    subResource: true
                }
            },

            parse: function(resp) {
                if (resp.attributes) {
                    var attributes = resp.attributes;
                    resp.attributes = [];

                    for (var attribute in attributes) {
                        var instance = new this.attributeClass(attributes[attribute], { parse: true });
                        if (attributes[attribute].order !== undefined) {
                            resp.attributes[attributes[attribute].order] = instance;
                        } else {
                            resp.attributes.push(instance);
                        }
                    }
                }

                return resp;
            }
        });
	}
);
