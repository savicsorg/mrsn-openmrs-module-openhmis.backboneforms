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
		openhmis.url.backboneBase + 'js/lib/backbone',
		openhmis.url.backboneBase + 'js/lib/underscore',
		openhmis.url.backboneBase + 'js/model/generic',
		openhmis.url.backboneBase + 'js/lib/backbone-forms',
		openhmis.url.backboneBase + 'js/lib/labelOver',
		openhmis.url.backboneBase + 'js/view/list',
		openhmis.url.backboneBase + 'js/model/location',
		openhmis.url.backboneBase + 'js/model/user',
		openhmis.url.backboneBase + 'js/model/role'
	],
	function($, Backbone, _, openhmis) {
		var editors = Backbone.Form.editors;

		editors.isNumeric = function(strVal) {
			return /^-?[0-9]*\.?[0-9]*?$/.test(strVal);
		};

		editors.BasicNumber = editors.Number.extend({
			initialize: function(options) {
				this.defaultValue = null;
				editors.Text.prototype.initialize.call(this, options);
			},

			/**
			* Check value is numeric
			*/
			onKeyPress: function(event) {
				var self = this,
					delayedDetermineChange = function() {
					  setTimeout(function() {
						self.determineChange();
					  }, 0);
					}
				if (event.keyCode == 9) {
					return;
				}
				//Allow backspace && enter
				if (event.which == 8 || event.which == 13) {
					delayedDetermineChange();
					return;
				}

				//Get the whole new value so that we can prevent things like double decimals points etc.
				var newVal = this.$el.val() + String.fromCharCode(event.which);

				if (editors.isNumeric(newVal)) {
					delayedDetermineChange();
				} else {
					event.preventDefault();
				}
			},

			setValue: function(value) {
				if (value !== undefined && value !== null && this.schema.format) {
					this.$el.val(this.schema.format(value));
				} else {
					this.$el.val(value);
				}
			},

			focus: function(select) {
				editors.Number.prototype.focus.call(this);

				if (select === true) this.$el.select();
			}
		});

		editors.CustomNumber = editors.Number.extend({
			initialize: function(options) {
				this.events = _.extend(this.events, {
					'click': 'determineChange'
				});
				editors.Number.prototype.initialize.call(this, options);
				if (options && options.schema) this.minimum = options.schema.minimum;
			},

			onKeyPress: function(event) {
				var self = this,
					delayedDetermineChange = function() {
						setTimeout(function() {
							self.determineChange();
						}, 0);
					};
				if (event.keyCode == 9) {
					return;
				}
					//Allow backspace and minus character
				if (event.which == 8 || event.which == 45) {
					delayedDetermineChange();
					return;
				}

				//Get the whole new value so that we can prevent things like double decimals points etc.
				var newVal = this.$el.val() + String.fromCharCode(event.which);

				if (editors.isNumeric(newVal)) {
					delayedDetermineChange();
				} else {
					event.preventDefault();
				}
			},

			setValue: function(value) {
				this.el.defaultValue = value;
				editors.Number.prototype.setValue.call(this, value);
			},

			determineChange: function(event) {
				if (this.minimum && parseInt(this.$el.val()) < this.minimum) {
					this.$el.val(this.minimum);
					return;
				}
				editors.Number.prototype.determineChange.call(this, event);
			},

			focus: function(select) {
				editors.Number.prototype.focus.call(this);
				if (select === true) this.$el.select();
			}
		});
		
		editors.TrueFalseCheckbox = editors.Checkbox.extend({
			getValue: function() {
				var tmpValue = editors.Checkbox.prototype.getValue.call(this);
				return tmpValue == true ? true : false;
			}
		});

		/**
		 * "Abstract" editor class.  Extend and specify modelType and
		 * displayAttr properties.  See inventory module editors.js for examples.
		 **/
		editors.GenericModelSelect = editors.Select.extend({
			blankItem: null,

			initialize: function(options) {
				editors.Select.prototype.initialize.call(this, options);

				if (this.schema.modelType) {
					this.modelType = this.schema.modelType;
				}

				if (this.schema.displayAttr) {
					this.displayAttr = this.schema.displayAttr;
				}

				this.blankItem = new this.modelType({ name: "- Not Defined -"});
			},

			renderOptions: function(options) {
				// Add in the "Not Defined" item before rendering the options
				if (this.allowNull) {
					var item0 = options.at(0);
					if (!item0 || item0.id != this.blankItem.id) {
						options.add(this.blankItem, {
							at: 0,
							silent: true
						});
					}
				}

				editors.Select.prototype.renderOptions.call(this, options);
			},

		    getValue: function() {
				$selected = this.$('option:selected');

			    var model = new this.modelType({ uuid: $selected.val() });
			    var displayAttr = this.displayAttr || "display";
				if (model == this.blankItem) {
					model.set(displayAttr, null, { silent: true });
				} else {
			        model.set(displayAttr, $selected.text(), { silent: true });
				}

				return model;
			},

			setValue: function(value) {
				if (value === null) {
					return;
				}

				if (_.isString(value)) {
					this.$el.val(value);
				} else if (value.attributes) {
					this.$el.val(value.id); // Backbone model
				} else if (!isNaN(parseFloat(value))) {
				// This should be after Backbone model because it can evaluate
				// to a number :S
					this.$el.val(value);
				} else {
					this.$el.val(value.uuid); // bare object
				}
			},

			render: function() {
				if (this.options.options !== undefined) {
					this.setOptions(this.options.options);
				} else {
                    if (this.schema.options instanceof Backbone.Collection) {
                        if (this.schema.options.length > 0) {
                            // Collection has already been loaded so just render it
                            this.renderOptions(this.schema.options);
                        } else {
                            // Load the collection manually so that we can set the limit
                            var self = this;
                            this.schema.options.fetch({
                                success: function () {
                                    // Render the options once complete
                                    self.renderOptions(self.schema.options);
                                },
                                limit: openhmis.rest.maxResults
                            });
                        }
                    } else {
                        this.setOptions(this.schema.options);
                    }
				}

				return this;
			}
		});

		editors.Autocomplete = editors.Select.extend({
			tagName: "span",
			previousValue: "",

			initialize: function(options) {
				_.bindAll(this, "onSelect");

				editors.Select.prototype.initialize.call(this, options);
				this.text = new editors.Text();

                this.minLength = options.schema.minLength ? options.schema.minLength : 2;

                var self = this;
                this.text.on("focus", function(event) { self.trigger("focus", self); });
				this.text.on("blur", function(event) { self.trigger("blur", self); });

                this.selectedItem = null;
			},

			onSelect: function(event, ui) {
				if (ui && ui.item) {
					this.selectedItem = ui.item;
					this.trigger("select", ui.item);
				}

				this.text.trigger("change", this);
			},

			getValue: function() {
				if (this.selectedItem && this.selectedItem.label === this.text.getValue()) {
					return this.selectedItem.value;
				} else {
					return this.text.getValue();
				}
			},

			setValue: function(value) {
				this.text.setValue(value);
			},

		    focus: function() {
				if (this.hasFocus) return; {
					this.text.focus();
			    }
			},

			blur: function() {
				if (this.hasFocus) {
					this.text.blur();
				}
			},

			renderOptions: function(options) {
				var source;
				var isBbCollection = false;

                if (options instanceof Backbone.Collection) {
					isBbCollection = true;
					source = options.map(function(item) {
						return { label: item.toString(), value: item }
					});
				} else {
					source = this.schema.options;
				}

				var $autoComplete = this.text.$el.autocomplete({
					minLength: this.minLength,
					source: source,
					select: this.onSelect,
					autoFocus: true
				});

				if (isBbCollection) {
					$autoComplete.data("autocomplete")._renderItem = function(ul, item) {
						return $("<li></li>").data("item.autocomplete", item)
							.append("<a>" + item.label + "</a>").appendTo(ul);
					};
				}
			},

			render: function() {
				if (this.$el.html() === "") {
					this.$el.append(this.text.el);
				}

				editors.Select.prototype.render.call(this);

				return this;
			}
		});

		editors.List.NestedModel = editors.List.NestedModel.extend({
			onModalSubmitted: function(form, modal) {
				var isNew = !this.value;

				//Stop if there are validation errors
				var error = form.validate();
				if (error) {
					return modal.preventClose();
				}
				this.modal = null;

				var idAttribute = Backbone.Model.prototype.idAttribute;
				if (this.value) {
					var id = this.value.id || this.value[idAttribute];
				}

				//If OK, render the list item
				this.value = form.getValue();

				if (id !== undefined) {
					this.value[idAttribute] = id;
				}

				this.renderSummary();

				if (isNew) {
					this.trigger('readyToAdd');
				}

				this.trigger('change', this);

				this.trigger('close', this);
				this.trigger('blur', this);
			}
		});

		editors.LocationSelect = editors.GenericModelSelect.extend({
			modelType: openhmis.Location,
			displayAttr: "name",
			allowNull: true
		});

		editors.UserSelect = editors.GenericModelSelect.extend({
			modelType: openhmis.User,
			displayAttr: "name",
			allowNull: true
		});

		editors.RoleSelect = editors.GenericModelSelect.extend({
			modelType: openhmis.Role,
			displayAttr: "name",
			allowNull: true
		});

		editors.ListSelect = editors.Base.extend({
			modalWidth: 600,
			initialize: function(options) {
				_.bindAll(this, 'updateSelected', 'clearSelection');
				options = options || {};
				editors.Base.prototype.initialize.call(this, options);
				if (!options.schema.options) {
					throw "Missing required schema.options.";
				}
			},

			getValue: function() {
				return this.value;
		    },

		    setValue: function(value) {
		    	this.value = value;
		    	this.updateSelected();
		    },

		    focus: function() {
		      if (this.hasFocus) return;

		      this.trigger("focus");
		    },

		    blur: function() {
		      if (!this.hasFocus) return;

		      this.trigger("blur");
		    },

		    initListView: function() {
		    	var options = this.schema.editorOptions || {};
		    	options.model = this.schema.options;
		    	this.listView = new openhmis.GenericListView(options);
		    },

		    updateSelected: function(view) {
		    	if (view && view.model)
		    		this.value = view.model;
		    	else if (view === null)
		    		this.value = null;
		    	this.$(".selected").text("Selected: " + (this.value || "None"));
	    		this.$(".clear_selection").css("display", this.value ? "inline" : "none");
		    },

		    clearSelection: function(event) {
		    	event.preventDefault();
		    	this.updateSelected(null);
		    	this.listView.blur();
		    },

		    render: function() {
		    	this.initListView();
		    	this.$el.html('<p><span class="selected"></span> <a href="#" title="Clear selection" class="clear_selection">Clear</a></p>');
		    	this.$el.append(this.listView.el);
		    	this.listView.fetch();
		    	this.updateSelected();
		    	this.listView.on("itemSelect", this.updateSelected);
		    	this.$(".clear_selection").click(this.clearSelection);
		    	return this;
		    }

		});

		return editors;
	}
);

/**
 * Re-orders the locations collection models collection in such a way as to get all chidren next to their parents and supports depth
 */
function reorderLocationsToSupportAllDepthChildrenNextToTheirParents(locationModels) {
	if(locationModels !== null && locationModels !== undefined && locationModels.length > 0) {
		var rootLocations = new Backbone.Collection();
		var reOrderedLocations = new Backbone.Collection();
		
		for(i = 0; i < locationModels.length; i++) {//look through all locations and pick out the root locations
			var location = locationModels[i];
			
			if(location !== null && location !== undefined) {
				location.fetch({async:false, success: function(fetchedloc) {//loads the location model with all its properties
					if(fetchedloc !== (null || undefined) && fetchedloc.get("parentLocation") !== (null || undefined)) {//true means fecthedLoc is a root location
						rootLocations.add(location);
					}
				}});
			}
		}
		
		if(rootLocations !== (null || undefined) && rootLocations.length > 0) {
			for(i = 0; i < rootLocations.length; i++) {//for each root location, walk through the location tree
				var rootLoc = rootLocations[i];
				
				if(rootLoc !== (null || undefined)) {
					walkThroughTheLocationTree(rootLoc, reOrderedLocations);
				}
			}
		}
		
	}
	return locationModels;
}

/**
 * Moves through the rootLocation properties and picks out its inherent locatios/children and arranges them next to it
 */
function walkThroughTheLocationTree(rootLoc, reOrderedLocations) {
	addLocationToReorderedLocations(recreateRightModelObject(rootLoc.get("name"), rootLoc.get("display"), rootLoc.get("uuid"), rootLoc.get("link")[0].uri, 0), reOrderedLocations);//add the root location first before it's inherent children
	
	//TODO this where the recursion/ while looping should occur for each location
	
}

/**
 * Adds a non existing location model into the re-ordered models collection
 */
function addLocationToReorderedLocations(location, reOrderedLocations) {
	if(location !== (null || undefined) && reOrderedLocations !== (null || undefined) && !reOrderedLocations.contains(location)) {
		reOrderedLocations.add(location);
	}
}

/**
 * Recreates a valid location model and adds a new depth property onto it
 */
function recreateRightModelObject(name, display, uuid, link, depth) {
	var location = new openhmis.Location();
	
	location.id = uuid;
	location.set("name", name);
	location.set("uuid", uuid);
	location.set("display", display);
	location.set("links", [{"uri":link}]);
	location.set("depth", depth);
	
	return model;
}
