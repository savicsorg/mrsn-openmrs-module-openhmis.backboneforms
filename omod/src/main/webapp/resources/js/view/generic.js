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
		openhmis.url.backboneBase + 'js/openhmis',
		openhmis.url.backboneBase + 'js/lib/backbone-forms',
		openhmis.url.backboneBase + 'js/model/generic',
		openhmis.url.backboneBase + 'js/view/list',
		openhmis.url.backboneBase + 'js/view/paginate',
		openhmis.url.backboneBase + 'js/view/editors',
		'link!' + openhmis.url.backboneBase + 'css/style.css',
		'link!/openmrs/scripts/jquery/dataTables/css/dataTables_jui.css'
	],
	function($, _, Backbone, __, openhmis) {

		/*======================================================================
		 *
		 * GenericAddEditView
		 *
		 */
		openhmis.GenericAddEditView = Backbone.View.extend(
		/** @lends GenericAddEditView.prototype */
		{
			tmplFile: openhmis.url.backboneBase + 'template/generic.html',
			tmplSelector: '#add-edit-template',
			titleSelector: 'b.title',
			formSelector: 'div.form',

			/**
			 * @class GenericAddEditView
			 * @classdesc Generic view for performing add/edit/delete operations
			 *     on a GenericModel
			 * @constructor GenericAddEditView
			 * @param {map} options Optional. View options.
			 */
			initialize: function(options) {
				_.bindAll(this);
				this.collection = options.collection;
				this.model = new this.collection.model();
				this.template = this.getTemplate();
			},

			events: {
				'click a.addLink': 'beginAdd',
				'click .cancel': 'cancel',
				'click .submit': 'save',
				'submit form': 'save',
				'click button.retireOrVoid': 'retireOrVoid',
				'click button.unretireOrUnvoid': 'unretireOrUnvoid',
				'click button.purge': 'purge'
			},

			/**
			 * Prepare a Backbone form based on a model
			 *
			 * @static
			 * @param {Model} model A model with a defined backbone-forms schema
			 * @param {map} options Options for the Backbone form
			 * @returns {Form} A prerendered Backbone form
			 */
			prepareModelForm: function(model, options) {
				options = options ? options : {};
				var schema = options.schema ? options.schema : model.schema;
				var formFields = [];
				for (var key in schema) {
					if (key === 'retired') continue;
					if (schema[key].hidden === true) continue;
					formFields.push(key);
				}

                var formOptions = {
					model: model,
					fields: formFields,
					classNames: { errClass: "error" }
				};
				formOptions = _.extend(options, formOptions);

                var modelForm = new Backbone.Form(formOptions);
				modelForm.render();

				return modelForm;
			},

			/** Switch to Add mode, for adding a new model. */
			beginAdd: function() {
				this.model = new this.collection.model(null, { urlRoot: this.collection.url });
				this.render();
				$(this.addLinkEl).hide();
				$(this.retireVoidPurgeEl).hide();
				$(this.titleEl).show();
				this.modelForm = this.prepareModelForm(this.model);
				$(this.formEl).prepend(this.modelForm.el);
				$(this.formEl).show();
				$(this.formEl).find('input')[0].focus();
			},

			/**
			 * Cancel the current view
			 *
			 * @fires cancel
			 */
			cancel: function() {
				this.trigger('cancel');
				$(this.addLinkEl).show();
				$('.addLink').show();
				$(this.titleEl).hide();
				$(this.formEl).hide();
				$(this.retireVoidPurgeEl).hide();
			},

			/**
			 * Switch to edit mode, for editing a model
			 *
			 * @param {GenericModel} A model for editing
			 */
			edit: function(model) {
				this.model = model;
				var self = this;
				this.model.fetch({
					success: function(model, resp) {
						self.render();
						$('.addLink').hide();
						$(self.titleEl).show();
						self.modelForm = self.prepareModelForm(self.model);

						if (self.modelForm) {
							$(self.formEl).prepend(self.modelForm.el);
						}

						$(self.formEl).show();
						$(self.retireVoidPurgeEl).show();
                        var input = $(self.formEl).find('input');
                        if (input && input.length > 0) {
                            input[0].focus();
                        }
					},
					error: openhmis.error
				});
			},

			/**
			 * Save the current model
			 *
			 * @param {event} event Optional.  Pass an event.
			 */
			save: function(event, options) {
				if (event) {
					event.preventDefault();
				}
				
				if (this.modelForm) {
					var errors = this.modelForm.commit();
					if (errors) {
						return;
					}
				}

                // Allow callers to execute code after commit but before save
                if (options && options.postCommit) {
                    var continueSave = options.postCommit();
                    if (continueSave === false) {
                        return;
                    }
                }

                options = options ? options : {};
                var success = options.success;
                var error = options.error;

				var view = this;
				this.model.save(null, {
					success: function(model, resp) {
						if (model.collection === undefined) {
							view.collection.add(model);
						}
						model.trigger("sync");
						view.cancel();

                        if (success) {
                            success(model, resp);
                        }
					},
					error: function(model, resp) {
                        openhmis.error(resp);
                        if (error) {
                            error(model, resp);
                        }
                    }
				});
			},

			/** Retire or void an existing model */
			retireOrVoid: function() {
				var reason = this.$('#reason').val();
				var view = this;
				this.model.retire({
					reason: reason,
					success: function(model, resp) {
						view.cancel();
					},
					error: function(model, resp) { openhmis.error(resp); }
				});
			},

			/** Unretire or unvoid an existing model */
			unretireOrUnvoid: function() {
				if (confirm(openhmis.getMessage('openhmis.backboneforms.system.unretire.message'))) {
					var view = this;
					this.model.unretire({
						success: function(model, resp) {
							view.model.trigger('sync', model, resp);
							view.cancel();
						},
						error: function(model, resp) { openhmis.error(resp); }
					});
				}
			},

			/** Purge an existing model */
			purge: function() {
				if (confirm(__(openhmis.getMessage('openhmis.backboneforms.system.purge.message')))) {
					var view = this;
					this.model.purge({
						success: function(model) {
							view.cancel(); 
							model.trigger('destroyItem');
						},
						error: function(model, resp) { openhmis.error(resp); }
					});
				}
			},

			/**
			 * Render the view
			 * @returns {View} The rendered view
			 */
			render: function() {
				this.$el.html(this.template({ model: this.model }));
				this.addLinkEl = this.$('p.addLink');
				this.titleEl = this.$(this.titleSelector);
				this.formEl = this.$(this.formSelector);
				this.retireVoidPurgeEl = this.$('div.retireVoidPurge');
				return this;
			}
		});


		/*======================================================================
		 *
		 * GenericListItemView
		 *
		 */
		openhmis.GenericListItemView = Backbone.View.extend(
		/** @lends GenericListItemView.prototype */
		{
			// Name of the HTML tag to use for the view's containing element
			tagName: "tr",

			// The template file to use
			tmplFile: openhmis.url.backboneBase + "template/generic.html",

			// The jQuery selector for the template
			tmplSelector: '#generic-list-item',

			/**
			 * List of actions (strings) that the view should support by default.
			 * GenericListItemView supports: <ul>
			 *     <li><b>remove:</b> Support removing list items</li>
			 *     <li><b>inlineEdit:</b> Support editing the values of the item attributes</li>
			 * </ul>
			 *
			 * @type Array
			 */
			actions: [], // see enableActions()

			/**
			 * @class GenericListItemView
			 * @classdesc Displays a single model in a GenericListView
			 * @constructor GenericListItemView
			 * @param {map} options Options for the GenericListItemView
			 */
			initialize: function(options) {
				if (options !== undefined) {
					this.fields = options.fields ? options.fields : _.keys(this.model.schema);
					if (options.actions) {
						this.actions = this.actions.concat(options.actions);
					}
					if (options.schema) {
						this.schema = options.schema;
					}
				}
				_.bindAll(this);
				this.template = this.getTemplate();
				this.model.on("sync", this.render);
				this.model.on('destroyItem', this.remove);
				this.model.on("change", this.onModelChange);
				this._enableActions();
			},

			events: {
				'click td': 'select',
			},

			/**
			 * Cause the item to be selected
			 * @fires select
			 */
			select: function() {
				// If this list item has a form, we'll use that for focus
				if (this.form !== undefined) {
					return;
				}
				if (this.$el.hasClass("row_selected")) {
					return;
				}
				this.trigger('select', this);
				this.$el.addClass("row_selected");
			},
			
			/**
			 * Focus the item
			 * @fires focus
			 */
			focus: function() {
				this.trigger("focus", this);
				this.$el.addClass("row_selected");
			},

			/**
			 * Blur the item (cancel focus)
			 * @param {event} event Optional. Because blur will commit form data
			 *     if applicable, it may be helpful to pass on an event, if this
			 *     method is used as an event handler.
			 */
			blur: function(event) {
				this.$el.removeClass("row_selected");
				this.commitForm(event);
			},
			
			/**
			 * Called when the view's model changes
			 *
			 * @param {Model} model The model that has changed
			 * @fires change
			 */
			onModelChange: function(model) {
				if (model.hasChanged()) {
					this.trigger("change", this);
				}
			},

			/**
			 * Default way to display validation errors for the view, for
			 * example in the case that it supports inline editing of fields.
			 *
			 * @param {map} errorMap A map from model attributes or form fields
			 *     to error messages
			 * @param {event} event Optional. The event that triggered the
			 *     failed validation.
			 */
			displayErrors: function(errorMap, event) {
				for(var item in errorMap) {
					var $errorEl = this.$('.field-' + item + ' .editor');
					if ($errorEl.length > 0) {
						openhmis.validationMessage($errorEl, errorMap[item]);
					}
				}
			},

			/**
			 * Commit the current form data, triggering validation.
			 *
			 * @param {event} event Optional. Triggering event.
			 * @returns {map} A map from field names to error messages, or
			 *     undefined if validation is successful
			 */
			commitForm: function(event) {
				var errors = this.form.commit();
				if (errors && this.displayErrors) {
					this.displayErrors(errors, event);
				}
				return errors;
			},

			/**
			 * Called when the remove action has been chosen for the item
			 *
			 * @param {event} event Optional. Triggering event.
			 */
			onRemove: function(event) {
				if (confirm(__(openhmis.getMessage('openhmis.backboneforms.system.remove.selected.item.prompt.message')))) {
					this._removeItem(event);
					return true;
				} else {
					// Prevent this event from propagating
					return false;
				}
			},

			/**
			 * Render the list item
			 *
			 * @returns {View} The rendered view
			 */
			render: function() {
				this.$el.html(this.template({
					model: this.model,
					actions: this.actions,
					fields: this.fields,
					GenericCollection: openhmis.GenericCollection
				})).addClass("selectable");
				if (_.indexOf(this.actions, 'inlineEdit') !== -1) {
					//this.form.render();
					this.$el.append(this.form.$('td'));
				}
				return this;
			},


			/**
			 * Remove this item
			 *
			 * @private
			 */
			_removeItem: function(event) {
				this._removeModel();
				Backbone.View.prototype.remove.call(this);
				this.trigger('remove', this.model);
				this.off();
			},

			/**
			 * Destroy the view's model
			 *
			 * @private
			 */
			_removeModel: function() {
				this.model.destroy();
			},

			/**
			 * Enable actions according to this.actions
			 *
			 * @private
			 */
			_enableActions: function() {
				for (var act in this.actions) {
					switch (this.actions[act]) {
						// Display remove action for the item
						case 'remove':
							this.events['click .remove'] = 'onRemove'
							break;
						case 'details':
							this.events['click .details'] = 'onDetails'
							break;
						case 'inlineEdit':
							var schema = _.extend({}, this.model.schema, this.schema || {});
							this.form = openhmis.GenericAddEditView.prototype.prepareModelForm.call(this, this.model, {
								schema: schema,
								template: 'trForm',
								fieldsetTemplate: 'blankFieldset',
								fieldTemplate: 'tableField'
							});
							this.form.on('blur', this.blur);
							this.form.on('focus', this.focus);
							break;
					}
				}
				this.delegateEvents();
			}
		});


		/*======================================================================
		 *
		 * GenericListView
		 *
		 */
		openhmis.GenericListView = Backbone.View.extend(
		/** @lends GenericListView.prototype */
		{
			// The template file to use
			tmplFile: openhmis.url.backboneBase + 'template/generic.html',

			// The jQuery selector for the template
			tmplSelector: '#generic-list',

			/** The default ListItemView to use to display each item */
			itemView: openhmis.GenericListItemView,

			/**
			 * A list of other FetchHelpers that may affect the fetch results
			 * for this view.  A FetchHelper must implement the
			 * <b>getFetchOptions<b> method which will return
			 *
			 * @type Array
			 */
			fetchable: null,

			/**
			 * @class GenericListView
			 * @classdesc Displays a GenericCollection in a tabular list
			 * @constructor GenericListView
			 * @param {map} options Options for the GenericListView.
			 * 	  <ul>
			 *     <li><b>model:</b> Expected to be a GenericCollection</li>
			 *     <li><b>itemView:</b> The view type to use to display each item in the list. Defaults to GenericListItemView.</li>
			 *     <li><b>schema:</b> Can be specified to override the schema of the models in the collection.</li>
			 *     <li><b>listTitle:</b> Title to be displayed for the list.</li>
			 *     <li><b>itemActions:</b> A list of actions to enable for the items in the list. GenericListItemView supports "remove" and "inlineEdit".</li>
			 *     <li><b>listFields:</b> A list of attributes in the model's schema to display as columns in the list.  Defaults to all the attributes in the model's schema.</li>
			 *     <li><b>listExcludeFields:</b> A list of attributes in the model's schema to exclude from the list's columns.</li>
			 *     <li><b>showPaging:</b> Whether to display pagination controls. Defaults to true.</li>
			 *     <li><b>pageSize:</b> Set the initial number of results to show in the list</li>
			 *     <li><b>showRetiredOption:</b> Whether to display the option of showing/hiding retired/voided items.</li>
			 *     <li><b>hideIfEmpty:</b> If true and the view's collection is empty, the entire list view will not be displayed.  Defaults to false.</li>
			 *    </ul>
			 */
			initialize: function(options) {
				var itemView = this.itemView; // bindAll can messes this up for extending classes
				_.bindAll(this);
				this.itemView = itemView;
				this.options = {};

				this.paginateView = new openhmis.PaginateView({ model: this.model, pageSize: 5 });
				this.paginateView.on("fetch", this.fetch);
				this.fetchable = [];
				this.fetchable.push(this.paginateView);

				// Load options
				if (options !== undefined) {
					this.itemView = options.itemView ? options.itemView : openhmis.GenericListItemView;
					if (options.schema) {
						this.schema = options.schema;
					}

					// Why is this inside options??
					this.template = this.getTemplate();

					this.options.listTitle = options.listTitle;

					this.options.itemActions = options.itemActions || [];
					var itemViewActions = this.itemView.prototype.actions;
					if (itemViewActions) {
						this.options.itemActions = this.options.itemActions.concat(itemViewActions);
					}

					this.options.includeFields = options.listFields;
					this.options.excludeFields = options.listExcludeFields;
					this.options.showPaging = options.showPaging !== undefined ? options.showPaging : true;
					if (options.pageSize) {
						this.paginateView.setPageSize(options.pageSize);
					}
					this.options.showRetiredOption = options.showRetiredOption !== undefined ? options.showRetiredOption : true;
					this.options.hideIfEmpty = options.hideIfEmpty !== undefined ? options.hideIfEmpty : false;

					this.options.spinnerEnabled = options.spinnerEnabled !== undefined ? options.spinnerEnabled : true;
					this.options.loadingText = options.loadingText !== undefined ? options.loadingText : true;
				}

				this.model.on("reset", this.render);
				this.model.on("add", this.addOne);
				this.model.on("remove", this.onItemRemoved);

				this.showRetired = false;
				this._determineFields();
			},

			events: {
				'change #showRetired': '_toggleShowRetired',
				'change #pageSize': '_loadSpinnerElements'
			},

			/**
			 * Add another item to the view.
			 *
			 * Hooks up:
			 *     <ul>
			 *      <li><b>itemSelected</b> on ListItemView <b>select</b> and <b>focus</b></li>
			 *      <li><b>itemRemoved</b> on ListItemView <b>remove</b></li>
			 *     </ul>

			 * @param {model} model Required. A GenericModel to be added to the
			 *     list.
			 * @param {schema} schema Optional. A schema to override the model's
			 *     schema.
			 * @param {int} lineNumber Optional. The lineNumber of the item,
			 *     used to determine styles for alternating rows.  Otherwise
			 *     this is determined using jQuery and the DOM.
			 */
			addOne: function(model, schema, lineNumber) {
				if (this.showRetired === false && model.isRetired()) {
					return null;
				}
				if ((this.$el.html() === "" && this.options.hideIfEmpty === true)
					|| this.$("p.empty").length === 1) {
					this.render();
					// Re-rendering the entire list means we don't have to
					// continue adding this item
					return null;
				}
				schema = schema ? _.extend({}, model.schema, schema) : _.extend({}, this.model.model.prototype.schema, this.schema || {});

				// Determine class name for alternating row styling
				var className = "evenRow";
				if (lineNumber && !isNaN(lineNumber)) {
					className = lineNumber % 2 === 0 ? "evenRow" : "oddRow";
				} else {
					var $rows = this.$('tbody.list tr');
					if ($rows.length > 0) {
					var lastRow = $rows[$rows.length - 1];
					if ($(lastRow).hasClass("evenRow")) {
							 className = "oddRow";
						}
					}
				}
				var itemView = new this.itemView({
					model: model,
					fields: this.fields,
					schema: schema,
					className: className,
					actions: this.options.itemActions
				});
				model.view =itemView;
				this.$('tbody.list').append(itemView.render().el);
				itemView.on('select focus', this.onItemSelected);
				itemView.on('remove', this.onItemRemoved);
				var view =this;

				model.on("retire", function(item) {
					if (!view.showRetired) {
						itemView.remove();
					}
					view.onItemRemoved(item);
				});
				return itemView;
			},

			/**
			 * Called when a ListItemView is removed.
			 *
			 * @param {GenericListItemView} item The view that has been removed
			 */
			onItemRemoved: function(item) {
				if (this._visibleItemCount() === 0) {
					this.render();
				} else {
					this._colorRows();
				}
			},

			/**
			 * Called when a ListItemView is selected.
			 *
			 * @param {GenericListItemView} view The view that has been selected
			 */
			onItemSelected: function(view) {
				this._deselectAll();
				this.selectedItem = view;
				this.trigger("itemSelect", view);
			},

			/** Called when the view loses form focus. */
			blur: function() {
				this._deselectAll();
			},

			/** Called when the view gains form focus. */
			focus: function() {
				if (this.selectedItem) {
					this.selectedItem.focus();
				}
			},

			/**
			 * Use the GenericCollection to fetch an updated list of items from
			 * the server.  Uses the list of fetchables.
			 *
			 * @param {map} options Options for the fetch operation.
			 * @param {FetchHelper} sender Optional. The FetchHelper that
			 *     called for this fetch.
			 */
			fetch: function(options, sender) {
				options = options ? options : {};
				for (var f in this.fetchable) {
					if (this.fetchable[f] !== sender) {
						options = this.fetchable[f].getFetchOptions(options);
					}
				}
				if(this.showRetired) {
					options.queryString = openhmis.addQueryStringParameter(options.queryString, "includeAll=true");
				}
				this.trigger("fetch", options, this);
				this.model.fetch(options);
			},

			/**
			 * Render the list view
			 *
			 * @param {map} extraContext Optional. Extra context to override the
			 *     base context and be passed to the template.
			 * @returns {View} The rendered view
			 */
			render: function(extraContext) {
				var self = this;
				var length = this._visibleItemCount();
				if (length === 0 && this.options.hideIfEmpty) {
					this.$el.html("");
					return this;
				}
				var schema = _.extend({}, this.model.model.prototype.schema, this.schema || {});
				var pagingEnabled = this.options.showPaging && length > 0;
				var context = {
					list: this.model,
					listLength: length,
					fields: this.fields,
					modelType: this.model.model.prototype,
					modelMeta: this.model.model.prototype.meta,
					modelSchema: schema,
					showRetired: this.showRetired,
					pagingEnabled: pagingEnabled,
					options: this.options,
					pageSize: this.pageSize
				}
				if (extraContext !== undefined) {
					if (extraContext.options) {
						context.options = _.extend({}, context.options, extraContext.options);
						delete extraContext.options;
					}
					context = _.extend(context, extraContext);
				}
				this.$el.html(this.template(context));
				if (pagingEnabled) {
					this.paginateView.setElement(this.$(".paging-container"));
					this.paginateView.render();
					this.paginateView.getRenderedPageSizeEl(this.$("span.pageSize"));
				}
				var view = this;
				var lineNumber = 0;
				this._hideSpinnerElements();
				this.model.each(function(model) {
					view.addOne(model, schema, lineNumber)
					lineNumber++;
				});
				return this;
			},

			/**
			 * Reassigns alternating styles to item views.
			 *
			 * @private
			 */
			_colorRows: function() {
				var lineNumber = 0;
				this.$el.find('tbody tr').each(function() {
					$(this)
					.removeClass("evenRow oddRow")
					.addClass((lineNumber % 2 === 0) ? "evenRow" : "oddRow");
					lineNumber++;
				});
			},

			/**
			 * Determine the number of items in the collection that are
			 * actually visible according to UI settings
			 *
			 * @private
			 */
			_visibleItemCount: function() {
				if (this.showRetired) {
					return this.model.length;
				}
				return this.model.filter(function(item) { return !item.isRetired() }).length;
			},

			/**
			 * Determine the fields that should be shown as columns in the table
			 *
			 * @private
			 */
			_determineFields: function() {
				if (this.options.includeFields !== undefined) {
					this.fields = this.options.includeFields;
				} else {
					this.fields = _.keys(this.model.model.prototype.schema);
				}
				if (this.options.excludeFields !== undefined) {
					var argv = _.clone(this.options.excludeFields);
					argv.unshift(this.fields);
					this.fields = _.without.apply(this, argv);
				}
			},

			/**
			 * Remove selection style from all rows.
			 *
			 * @private
			 */
			_deselectAll: function() {
				this.$('tr').removeClass('row_selected');
			},

			/**
			 * Event handler for the "Show Retired" control.
			 *
			 * @private
			 */
			_toggleShowRetired: function(event) {
				this.showRetired = event.target.checked;
				this.fetch();
			},

			/**
			* Show all the elements that handle the spinner
			*/
			_loadSpinnerElements: function() {
				$('.modalSpinner').show();
				$('.spinner').show();
				$('.overlay').show();
				this.listEl = this.$('tbody.list');
				$(this.listEl).hide();
				this.tblEl = this.$('div.tSpace');
				$(this.tblEl).show();
			},

			/**
			 * Hides all the elements that handle the spinner
			 */
			_hideSpinnerElements: function() {
				$('.spinner').hide();
				$('.modalSpinner').hide();
				$('.overlay').hide();
				this.listEl = this.$('tbody.list');
				$(this.listEl).show();
				this.tblEl = this.$('div.tSpace');
				$(this.tblEl).hide();
			}
		});


		/*======================================================================
		 *
		 * GenericListEntryView
		 *
		 */
		openhmis.GenericListEntryView = openhmis.GenericListView.extend({
			initialize: function(options) {
				var viewOptions = { showRetiredOption: false, showPaging: false };
				options = _.extend(viewOptions, options);

                openhmis.GenericListView.prototype.initialize.call(this, options);
			},

			addOne: function(model, schema) {
				var view = openhmis.GenericListView.prototype.addOne.call(this, model, schema);
				if (this.newItem && view.model.cid === this.newItem.cid) {
					this.selectedItem = view;
					view.on("change", this._addItemFromInputLine);
				} else {
					view.on("change remove", this.model.setUnsaved);
				}

                view.on("focusNext", this.focusNextFormItem);

                return view;
			},

			onItemRemoved: function(item) {
				delete item.view;

				openhmis.GenericListView.prototype.onItemRemoved.call(this, item);

				if (item === this.newItem && !item.view) {
					this.setupNewItem();
				}
			},

			focusNextFormItem: function(itemView) {
				var index = this.model.indexOf(itemView.model);
				var next = (index >= 0) ? this.model.at(index + 1) : undefined;
				if (next !== undefined) {
					next.view.focus();
				} else if (itemView.model !== this.newItem) {
					this.newItem.view.focus();
				} else {
					this.trigger("focusNext", this);
				}
			},

			/**
			 * Set up an empty input item and line.
			 */
			setupNewItem: function() {
				this.newItem = new this.model.model();

				// Don't add the item to the collection, but give it a reference
				this.newItem.collection = this.model;

				// If the list is completely empty, we will re-render
				if (this.$('p.empty').length > 0) {
					this.render();
				} else {
					this.addOne(this.newItem);
				}
			},

			render: function(extraContext) {
				if (this.newItem) {
					this.model.add(this.newItem, { silent: true });
				}

				openhmis.GenericListView.prototype.render.call(this, extraContext);

                if (this.newItem) {
					this.model.remove(this.newItem, { silent: true });
				}

                return this;
			},

			/**
			 * Add the item from the input line to the main collection, and set
			 * up a new input line.
			 */
			_addItemFromInputLine: function(inputLineView) {
                // Handle adding an item from the input line
                if (inputLineView !== undefined) {
                    // Prevent multiple change events causing duplicate views
                    if (this.model.getByCid(inputLineView.model.cid)) {
                        return;
                    }

                    inputLineView.off("change", this._addItemFromInputLine);
                    this.model.add(inputLineView.model, { silent: true });
                }

                this.setupNewItem();
			}
		});


		/*======================================================================
		 *
		 * NestedListItemView
		 *
		 */
		openhmis.NestedListItemView = openhmis.GenericListItemView.extend(
		/** @lends NestedListItemView.prototype */
		{
			// Property name on model to access nested objects
			modelChildren: "children",

			// Action for expanding to show nested items
			actions: ["expand"],

			initialize: function(options) {
				if (options) {
					this.modelChildren = options.modelChildren || this.model.meta.children || this.modelChildren;
				}
				this.expandArrowTemplate = this.getTemplate("", "#expand-arrow-template");
				this.expandRowTemplate = this.getTemplate("", "#expand-row-template");
				openhmis.GenericListItemView.prototype.initialize.call(this, options);
			},

			expandCollapse: function(event) {
				var $el = $(event.target);
				if ($el.hasClass("collapsed")) {
					// Expand
					$el.removeClass("collapsed");
					$el.addClass("expanded");
					$el.attr("src", openhmis.url.backbone + "images/expanded.png");
					if (!this.$nestedRow)
						this._addNestedView();
					var self = this;
					this.$nestedRow.stop().hide().show(0, function() { self.childrenView.$el.stop().hide().slideDown(100); });
				} else {
					// Collapse
					$el.removeClass("expanded");
					$el.addClass("collapsed");
					$el.attr("src", openhmis.url.backbone + "images/collapsed.png");
					if (this.$nestedRow) {
						var self = this;
						this.childrenView.$el.stop().show().slideUp(100, function() { self.$nestedRow.stop().show().hide() });
					}
				}
				if (event.stopPropagation) event.stopPropagation();
			},

			render: function() {
				openhmis.GenericListItemView.prototype.render.call(this);
				if (this.model.get(this.modelChildren).length > 0) {
					this.$(".item-actions").append(this.expandArrowTemplate({}));
				}
				return this;
			},

			_addNestedView: function() {
				this.$nestedRow = $(this.expandRowTemplate({ colspan: this.fields.length }));
				this.$nestedRow.addClass(this.$el.hasClass("evenRow") ? "evenRow" : "oddRow");
				this.$el.after(this.$nestedRow);
				this.childrenView = new openhmis.GenericListView({
					model: this.model.get("workOrders"),
					listFields: this.fields,
					listTitle: "",
					itemView: openhmis.NestedListItemView,
					showRetiredOption: false,
					showPaging: false
				});
				var self = this;
				this.childrenView.on("itemSelect", function(view) {
					self.trigger("select", view);
				});
				this.$nestedRow.find(".children").append(this.childrenView.render().el);
			},

			_enableActions: function() {
				openhmis.GenericListItemView.prototype._enableActions.call(this);
				if (this.model.get(this.modelChildren).length > 0) {
					this.events['click .expand'] = 'expandCollapse';
				}
			}
		});

		/**
		 * <b>Not a real class!</b>  Interface/pseudoclass for documentation
		 * purposes.
		 *
		 * @class FetchHelper
		 * @classdesc A FetchHelper is a view that can be used by a base view
		 *     (such as {@link GenericListView}) to affect the query sent to the
		 *     server when fetch() is called.  A FetchHelper view should
		 *     implement the getFetchOptions() method.<br>
		 *     <br>
		 *     <b>NOTE: This is not a real class.</b>  It's an interface and is
		 *     listed here for documentation purposes.  {@link NameSearchView}
		 *     and {@link DepartmentAndNameSearchView} are examples of
		 *     FetchHelpers.
		 */

		/**
		 * @function FetchHelper#getFetchOptions
		 * @param {map} options The current fetch options.  Should not be
		 *     modified.
		 * @returns {map} options The fetch options that the FetchHelper wants
		 *     to submit.
		 */


		/*======================================================================
		 *
		 * GenericSearchableListView
		 *
		 */
		openhmis.GenericSearchableListView = openhmis.GenericListView.extend(
		/** @lends GenericSearchableListView.prototype */
		{
			/**
			 * @class GenericSearchableListView
			 * @extends GenericListView
			 * @classdesc Specialized GenericListView that supports filtering
			 *     results by search criteria.
			 * @constructor GenericSearchableListView
			 * @param {map} options Optional.  View options.
			 *     GenericSearchableListView-specific options are: <ul>
			 *      <li><b>searchView:</b> A FetchHelper view to be used for setting the search filter</li>
			 * </ul>
			 */
			initialize: function(options) {
				_.bindAll(this);
				openhmis.GenericListView.prototype.initialize.call(this, options);

                var searchViewOptions = {
                    modelType: this.model.model
                };
                searchViewOptions = _.extend(options, searchViewOptions);

                this.searchViewType = options.searchView;
				this.searchView = new this.searchViewType(searchViewOptions);
				this.searchView.on("fetch", this.onSearch);
				this.fetchable.push(this.searchView);
			},

			/**
			 * Called when the search view fires a fetch event
			 *
			 * @param {map} options Fetch options
			 * @param {SearchView} sender The view that is triggering the search
			 */
			onSearch: function(options, sender) {
				if (this.paginateView) this.paginateView.setPage(1);
				this.fetch(options, sender);
			},

			/**
			 * Render the view.  Overrides GenericListView.render()
			 *
			 * @returns {View} The rendered view
			 */
			render: function() {
				if (this.searchView.lastSearch)
					this.options.listTitle = __('Results for "%s"', this.searchView.lastSearch);
				else
					this.options.listTitle = undefined;
				openhmis.GenericListView.prototype.render.call(this);
				this.$el.prepend(this.searchView.render().el);
				this.searchView.delegateEvents();
				this.searchView.focus();
				return this;
			}
		});

		// Create new generic add/edit screen
		openhmis.startAddEditScreen = function(model, options) {
			if (!options.listElement) {
				$("#content").append('<div id="existing-form"></div>');
				options.listElement = $("#existing-form");
			}

			if (!options.addEditElement) {
				$("#content").append('<div id="add-edit-form"></div>');
				options.addEditElement = $("#add-edit-form");
			}

			var collection = new openhmis.GenericCollection([], {
				url: model.prototype.meta.restUrl,
				model: model
			});

			var addEditView = options.addEditViewType
				? new options.addEditViewType({ collection: collection })
				: new openhmis.GenericAddEditView({ collection: collection });
			addEditView.setElement(options.addEditElement);
			addEditView.render();
			var viewOptions = _.extend({
				model: collection,
				addEditView: addEditView
			}, options);
			var listViewType = options.listView ? options.listView : openhmis.GenericListView;
			var listView = new listViewType(viewOptions);
			addEditView.on("cancel", listView.blur);
			listView.on("itemSelect", function(view) { addEditView.edit(view.model) });
			listView.setElement(options.listElement);
			listView.fetch();

			// Look for a 'uuid' url parameter
			var uuid = openhmis.getQueryStringParameter("uuid");
			if (uuid && uuid !== "") {
				// Create the model and set the id
				var modelInstance = new model();
				modelInstance.id = uuid;

				modelInstance.fetch({
					success: function(model) {
						// Display the model (this will load the model)
						addEditView.edit(model);
					}
				});
			}
		};

		Backbone.Form.setTemplates({
			trForm: '<b>{{fieldsets}}</b>',
			blankFieldset: '<b class="fieldset">{{fields}}</b>',
			tableField: '<td class="bbf-field field-{{key}}"><span class="editor">{{editor}}</span></td>'
		}, {
			errClass: "error"
		});

		return openhmis;
	}
);
