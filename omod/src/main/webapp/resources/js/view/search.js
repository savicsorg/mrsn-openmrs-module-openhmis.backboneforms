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
		openhmis.url.backboneBase + 'js/openhmis'
	],
	function($, _, Backbone, __, openhmis) {
		openhmis.BaseSearchView = Backbone.View.extend(
		/** @lends BaseSearchView.prototype */
		{
			tagName: "div",
			tmplFile: openhmis.url.backboneBase + "template/search.html",

			/**
			 * @class BaseSearchView
			 * @classdesc Base class for search views
			 * @constructor BaseSearchView
			 * @param {map} options View options. <ul>
			 *     <li><b>modelType:</b> The model type being searched.  Used mostly for model metadata</li>
			 * </ul>
			 */
			initialize: function(options) {
				this.template = this.getTemplate();
				if (options) {
					this.modelType = options.modelType;
				}
				this.model = new this.modelType();
			},
			
			events: {
				"submit form": "onFormSubmit"
			},
			
			/**
			 * Get the view's current search filter
			 * 
			 * @returns {Object} The search filter being used by the search view
			 */
			getSearchFilter: function() { return this.searchFilter; },
			
			/**
			 * Set the search filter
			 * 
			 * @param {Object} query The filter to set for the search view
			 */
			setSearchFilter: function(query) { this.searchFilter = query; },
			
			// Why is this here if it's only used in one extending class?
			onKeyPress: function(event) {
				if (event.which === 13) {
					event.stopPropagation();
				}
			},

			/**
			 * Abstract - should be implemented by extending class.  Should
			 * collect and parse input from search form.
			 */
			commitForm: function() { throw "A search view needs to implement a commitForm() method!" },

			/**
			 * Abstract - should be implemented by extending class.  Should
			 * handle taking form focus.
			 */
			focus: function() { throw "A search view needs to implement a focus() method!" },
			
			/** Called when the search should be submitted */
			onFormSubmit: function(event) {
				event.preventDefault();
				this.commitForm();
				this.fetch();
			},
			
			/**
			 * Get options and trigger fetch
			 * 
			 * @fires fetch
			 */
			fetch: function(options) {
				options = _.extend({}, this.getFetchOptions(), options);
				this.trigger("fetch", options, this);
			}
		});
		
		
		openhmis.NameSearchView = openhmis.BaseSearchView.extend(
		/** @lends NameSearchView.prototype */
		{
			tmplSelector: '#name-search',
			
			/**
			 * @class NameSearchView
			 * @extends BaseSearchView
			 * @classdesc A search view that supports searching by name.
			 * @constructor NameSearchView
			 * @param {map} options View options.  See options for
			 *     {@link BaseSearchView}.
			 */
			initialize: function(options) {
				this.events["keypress #nameSearchName"] = "onKeyPress";
				openhmis.BaseSearchView.prototype.initialize.call(this, options);
			},
			
			/** Collect user input */
			commitForm: function() {
				var name = this.$("#nameSearchName").val();
				this.searchFilter = name;
			},
			
			/**
			 * Get fetch options
			 *
			 * @param {map} options Fetch options from base view
			 * @returns {map} Map of fetch options
			 */
			getFetchOptions: function(options) {
				options = options ? options : {}
				if (this.searchFilter)
					options.queryString = openhmis.addQueryStringParameter(options.queryString, "q=" + encodeURIComponent(this.searchFilter));
				return options;
			},
			
			/** Focus the search form */
			focus: function() { this.$("#nameSearchName").focus(); },
			
			/**
			 * Render the view
			 * @returns {View} The rendered view
			 */
			render: function() {
				this.$el.html(this.template({
					model: this.model,
					searchFilter: this.searchFilter || undefined,
					__: __
				}));
				return this;
			}
		});
		
		return openhmis;
	}
)