define(
	[
		openhmis.url.backboneBase + 'js/lib/jquery',
		openhmis.url.backboneBase + 'js/lib/backbone',
		openhmis.url.backboneBase + 'js/lib/underscore',
		openhmis.url.backboneBase + 'js/model/generic',
		openhmis.url.backboneBase + 'js/lib/backbone-forms',
		openhmis.url.backboneBase + 'js/lib/labelOver',
		openhmis.url.backboneBase + 'js/view/list',
		openhmis.url.backboneBase + 'js/model/location'
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
		
		/**
		 * "Abstract" editor class.  Extend and specify modelType and
		 * displayAttr properties.  See cashier module editors.js for examples.
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
					if (item0 != null && item0.id != this.blankItem.id) {
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
				if (model == this.blankItem) {
					model.set(this.displayAttr, null);
				} else {
			        model.set(this.displayAttr, $selected.text());
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
					this.setOptions(this.schema.options);
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
				var self = this;
				this.text.on("focus", function(event) { self.trigger("focus", self); });
				this.text.on("blur", function(event) { self.trigger("blur", self); });
				this.minLength = options.schema.minLength ? options.schema.minLength : 2;
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
					this.$text.blur();
				}
			},
			
			renderOptions: function(options) {
				var source;
				var isBbCollection = false
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

		return editors;
	}
);
