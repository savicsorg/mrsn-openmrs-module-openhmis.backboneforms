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
		openhmis.url.backboneBase + 'js/lib/underscore',
		openhmis.url.backboneBase + 'js/lib/backbone',
		openhmis.url.backboneBase + 'js/openhmis'
	],
	function(_, Backbone, openhmis) {
		/**
		 * GenericModel
		 *
		 * Generic JS model class for interacting with OpenMRS REST resources.
		 * 
		 */
		openhmis.GenericModel = Backbone.Model.extend({
			
			/**
			 * @constructor
			 * @param {map} attributes Model attributes
			 * @param {map} options Model options
			 */
			initialize: function(attributes, options) {
				_.bindAll(this, 'setUnsaved');
				if (options !== undefined) {
					this.urlRoot = options.urlRoot;
					this.trackUnsaved = options.trackUnsaved;
				}
				if (this.trackUnsaved === true) {
					this.unsaved = false;
					this.on("change", this.setUnsaved);
				}
			},
			
		    url: function() {
				var url;
				try {
					url = Backbone.Model.prototype.url.call(this);
				} catch (e) {
					if (this.meta && this.meta.restUrl) {
						this.urlRoot = openhmis.url.rest + this.meta.restUrl;
						url = Backbone.Model.prototype.url.call(this);
					}
					else
						throw e;
				}
				return url + (this.meta && this.meta.modelType ? "?t=" + this.meta.modelType : "");
			},
			
			setUnsaved: function() {
				if (this.trackUnsaved === undefined)
					throw("trackUnsaved option should be enabed to use this funtion.");
				this.unsaved = true;
			},
			
			/**
			 * @returns {boolean} whether the model has changed since the last
			 *     time it was saved (if option trackUnsaved was specified)
			 */
			isUnsaved: function() {
				return this.unsaved;
			},
			
			/**
			 * Override Backbone model save() to support isUnsaved()
			 */
			save: function(key, value, options) {
				// Handle a "normal" save where options are specified as the
				// second parameter
				if (value && value.success) {
					var self = this;
					var success = value.success;
					value.success = function(model, resp) {
						self.unsaved = false;
						if (success) success(model, resp);
						else self.trigger("sync");
					}
					return Backbone.Model.prototype.save.call(this, key, value);
				}
				return Backbone.Model.prototype.save.call(this, key, value, options);
			},
			
			/**
			 * OpenMRS-specific delete functions
			 */
			retire: function(options) {
				options = options ? _.clone(options) : {};
				if (options.reason !== undefined)
					options.url = this.url() + "?reason=" + encodeURIComponent(options.reason);
				
				if (this.isNew()) {
					return false;
				}
				
				var model = this;
				var success = options.success;
				options.success = function(resp) {
					model._setRetired();
					model.trigger("retire sync", model, resp, options);
					if (success)
						success(model, resp);
				};
				
				options.error = Backbone.wrapError(options.error, model, options);
				var xhr = (this.sync || Backbone.sync).call(this, 'delete', this, options);
				return xhr;
			},
			
			unretire: function(options) {
				// Temporarily remove id to get base URL
				var savedId = this.id;
				this.id = undefined
				var proxy = new openhmis.GenericModel(
					{ uuid: savedId },
					{ urlRoot: this.url() }
				);
				this.id = savedId;
				proxy.set(this.getDataType() === "data" ? "voided": "retired", false);

				var success = options.success;
				var self = this;
				options.success = function(model, resp) {
					self._setRetired(false);
					if (success) success(self, resp);
					else self.trigger("unretire sync");
				}
				proxy.save([], options);
			},
			
			purge: function(options) {
				options = options ? options : {};
				options.url = this.url() + "?purge=true";
				Backbone.Model.prototype.destroy.call(this, options);
			},
		
			isRetired: function() {
				return this.get('retired') || this.get('voided');
			},
			
			modelName: function() {
				if (!this.meta || !this.meta.name)
					return "Unnamed Model";
				return this.meta.name;
			},
			
			modelNamePlural: function() {
				if (!this.meta || !this.meta.namePlural) {
					return openhmis.pluralize(this.modelName());
				}

				return this.meta.namePlural;
			},
			
			_setRetired: function(retired) {
				retired = retired !== undefined ? retired : true;
				switch (this.getDataType()) {
					case "data":
						this.set("voided", retired);
						break;
					default:
						this.set("retired", retired);
				}
			},
		
			getDataType: function () {
				if (this.meta && this.meta.openmrsType)
					return this.meta.openmrsType;
				if (this.get("retired") !== undefined)
					return "metadata";
				if (this.get("voided") !== undefined)
					return "data";
				return "unknown";
			},
			
			toJSON: function(options) {
				var attributes;
				if (options && options.objRef === true && this.id !== undefined)
					return this.id;
				if (this.schema === undefined)
					attributes = Backbone.Model.prototype.toJSON.call(this, options);
				else {
					attributes = {};
					for (var attr in this.attributes) {
						// This gets added to representations but cannot be set
						if (attr === 'resourceVersion') continue;
						
						if (this.schema[attr] !== undefined) {
							if (this.schema[attr].readOnly === undefined
								|| this.schema[attr].readOnly === false)
									attributes[attr] = this.attributes[attr];
							if (this.schema[attr].objRef === true) {
								if (attributes[attr] instanceof openhmis.GenericCollection)
									attributes[attr] = attributes[attr].toJSON({ objRef: true })
								else if (attributes[attr] instanceof Array) {
									var model = this.schema[attr].model || Backbone.Model;
									attributes[attr] = new openhmis.GenericCollection(
										attributes[attr],
										{ model: model })
									.toJSON({ objRef: true });
								}
								else if (attributes[attr].id !== undefined)
									attributes[attr] = attributes[attr].id;
							}
						}
						else if (attr === "retired" || attr === "voided" && this.attributes[attr]) {
							attributes[attr] = this.attributes[attr];
						}
					}
				}
				if (options
						&& (options.objRef === true || options.subResource === true)
						&& this.attributes[this.idAttribute])
					attributes[this.idAttribute] = this.attributes[this.idAttribute];
				else
					// This is never createable for the base resource
					delete attributes[this.idAttribute];
				return attributes;
			},
			
			toString: function() {
				var str = this.get("display");
					return str ? str : Backbone.Model.prototype.toString.call(this);
			}
		});
		
		/**
		 * GenericCollection
		 *
		 */
		openhmis.GenericCollection = Backbone.Collection.extend({
			baseUrl: openhmis.url.rest,
			
			/**
			 * @constructor
			 * @param {array} models Models with which to initialize the
			 *     collection
			 * @param {map} options Options for the collection
			 */
			initialize: function(models, options) {
				if (options) {
					if (options.baseUrl) this.baseUrl = options.baseUrl;
				}
				this.url = options && options.url ? this.baseUrl + options.url : this.baseUrl;
				if (this.model) {
					if (this.model.prototype.urlRoot !== undefined)
						this.url = this.model.prototype.urlRoot;
					else if (this.model.prototype.meta && this.model.prototype.meta.restUrl)
						this.url = this.baseUrl + this.model.prototype.meta.restUrl;
				}
			},
			
			fetch: function(options) {
				options = options ? options : {};
				var success = options.success;
				var error = options.error;
				var silent = options.silent;
				options.success = function(collection, resp) {
					// totalLength tracks the total number of objects available
					// on the server, even if they are not all fetched
					if (resp.length)
						collection.totalLength = resp.length;
					else
						collection.totalLength = collection.length;
					if (resp.links && collection.page === undefined) collection.page = 1;
					if (silent === undefined) collection.trigger("reset", collection, options);
					if (success) success(collection, resp);
				}
				options.error = function(model, data) {
					openhmis.error(data);
					if (error !== undefined)
						error(model, data);
				}
				if (this.model.prototype.meta && this.model.prototype.meta.modelType) {
					options.queryString = openhmis.addQueryStringParameter(options.queryString,
							"t=" + this.model.prototype.meta.modelType);
				}
				if (options.queryString)
					options.url = this.url + "?" + options.queryString;
				options.silent = true; // So that events aren't triggered too soon
				Backbone.Collection.prototype.fetch.call(this, options)
			},
			
			search: function(query, options) {
				options = options ? options : {};
				if (query)
					options.queryString = openhmis.addQueryStringParameter(options.queryString, query);
				return this.fetch(options);
			},
			
			add: function(models, options) {
				this.totalLength++;
				return Backbone.Collection.prototype.add.call(this, models, options);
			},
			
			remove: function(models, options) {
				if (this.totalLength > 0) this.totalLength--;
				return Backbone.Collection.prototype.remove.call(this, models, options);
			},
			
			parse: function(response) {
				return response.results;
			},
			
			toString: function(schema) {
				var collection = this;
				if (schema !== undefined) {
					collection = new openhmis.GenericCollection(this, { model: schema.model });
				}
				var str = "";
				collection.each(function(model) {
					str += str === "" ? model.toString() : ", " + model.toString();
				});
				return str;
			}
		});
		
		return openhmis;
	}
);