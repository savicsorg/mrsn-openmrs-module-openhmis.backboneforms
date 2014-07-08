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
            openhmis.url.backboneBase + 'js/lib/jquery',
            openhmis.url.backboneBase + 'js/lib/underscore',
            openhmis.url.backboneBase + 'js/lib/backbone',
            openhmis.url.backboneBase + 'js/lib/i18n',
            openhmis.url.backboneBase + 'js/view/generic',
            openhmis.url.backboneBase + 'js/model/generic'
    ],
    function($, _, Backbone, __, openhmis) {
        openhmis.CustomizableInstanceTypeAddEditView = openhmis.GenericAddEditView.extend({
            prepareModelForm: function (model, options) {
                var form = openhmis.GenericAddEditView.prototype.prepareModelForm.call(this, model, options);
                form.on('attributeTypes:change', this.makeTypesSortable);
                this.makeTypesSortable(form);

                return form;
            },

            makeTypesSortable: function (form) {
                form = form ? form : this.modelForm;
                form.$('.bbf-list ul').sortable();
            },

            save: function () {
                // Sets the ID of each attribute type element to the order within the list
                var attributes = this.$('.bbf-list ul').sortable("widget").children();
                $(attributes).each(function () {
                    $(this).attr("id", "attr-" + $(attributes).index(this));
                });

                // Sets the attribute order field on the model object
                var items = this.modelForm.fields['attributeTypes'].editor.items;
                for (var id in items) {
                    var getValue = items[id].getValue;
                    var newGetValue = function () {
                        var order = $(this.el).attr("id");
                        order = parseInt(order.substring(order.lastIndexOf('-') + 1));
                        var value = getValue.call(this);

                        // Set the proper field based on whether this is a backbone model or a new object
                        if (value.attributes != undefined) {
                            value.set('attributeOrder', order);
                        } else {
                            value.attributeOrder = order;
                        }

                        return value;
                    }
                    items[id].getValue = newGetValue;
                }

                // On to the real save method
                openhmis.GenericAddEditView.prototype.save.call(this);
            }
        });
    }
);