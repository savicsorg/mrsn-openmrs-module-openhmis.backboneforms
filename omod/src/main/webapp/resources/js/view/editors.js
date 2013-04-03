define(
	[
		openhmis.url.backboneBase + 'js/lib/jquery',
		openhmis.url.backboneBase + 'js/lib/backbone',
		openhmis.url.backboneBase + 'js/lib/underscore',
		openhmis.url.backboneBase + 'js/lib/backbone-forms',
		openhmis.url.backboneBase + 'js/lib/labelOver',
	],
	function($, Backbone, _, openhmis) {
		var editors = Backbone.Form.editors;
		
		editors.isNumeric = function(strVal) {
			return /^-?[0-9]*\.?[0-9]*?$/.test(strVal);
		}
		
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
				}
				else {
				  event.preventDefault();
				}
		   },
		   
		   setValue: function(value) {
				if (value !== undefined && value !== null && this.schema.format)
					this.$el.val(this.schema.format(value));
				else
					this.$el.val(value);
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
			  }
			  else {
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
		
		editors.GenericModelSelect = editors.Select.extend({
		    getValue: function() {
				$selected = this.$('option:selected');
				var model = new this.modelType({ uuid: $selected.val() })
				model.set(this.displayAttr, $selected.text());
				return model;
			},
			
			setValue: function(value) {
				var flt = parseFloat(value);
				if (value === null)
					return;
				else if (_.isString(value))
					this.$el.val(value);
				else if (value.attributes)
					this.$el.val(value.id); // Backbone model
				// This should be after Backbone model because it can evaluate
				// to a number :S
				else if (!isNaN(parseFloat(value)))
					this.$el.val(value);
				else
					this.$el.val(value.uuid); // bare object
			},
			
			render: function() {
				if (this.options.options !== undefined)
					this.setOptions(this.options.options);
				else
					this.setOptions(this.schema.options);
				return this;
			}
		});
		
		editors.Autocomplete = editors.Select.extend({
			tagName: "input",

			initialize: function(options) {
				editors.Select.prototype.initialize.call(this, options);
				_.bindAll(this, "onSelect");
				this.minLength = options.schema.minLength ? options.schema.minLength : 2;
				this.$el.attr('type', 'text');
				this.selectedItem = null;
			},
			
			onSelect: function(event, ui) {
				if (ui && ui.item) {
					this.selectedItem = ui.item;
					this.trigger("select", ui.item);
				}
			},
			
			getValue: function() {
				if (this.selectedItem && this.selectedItem.label === this.$el.val())
					return this.selectedItem.value;
				else
					return this.$el.val();
			},
			
			renderOptions: function(options) {
				var source;
				var isBbCollection = false
				if (options instanceof Backbone.Collection) {
					isBbCollection = true;
					source = options.map(function(item) {
						return { label: item.toString(), value: item }
					});
				}
				else
					source = this.schema.options;
				
				var $autoComplete = this.$el.autocomplete({
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
			}
		});
		
		return editors;
	}
)
