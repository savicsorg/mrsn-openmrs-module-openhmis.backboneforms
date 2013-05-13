define(
	[
		openhmis.url.backboneBase + 'js/lib/jquery',
		openhmis.url.backboneBase + 'js/lib/backbone',
		openhmis.url.backboneBase + 'js/lib/underscore',
		openhmis.url.backboneBase + 'js/lib/backbone-forms',
		openhmis.url.backboneBase + 'js/lib/labelOver',
		openhmis.url.backboneBase + 'js/view/list'
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
		
		editors.List.NestedModel = editors.List.NestedModel.extend({
			onModalSubmitted: function(form, modal) {
				var isNew = !this.value;
		  
				//Stop if there are validation errors
				var error = form.validate();
				if (error) return modal.preventClose();
				this.modal = null;
		
				var idAttribute = Backbone.Model.prototype.idAttribute;
				if (this.value) {
					var id = this.value[idAttribute];
					var cid = this.value.cid;
				}
		  
				//If OK, render the list item
				this.value = form.getValue();
		
				if (this.schema.itemType == 'NestedModel') {
					if (id !== undefined) this.value[idAttribute] = id;
					if (cid !== undefined) this.value.cid = cid;
				}
		  
				this.renderSummary();
		  
				if (isNew) this.trigger('readyToAdd');
				
				this.trigger('change', this);
				
				this.trigger('close', this);
				this.trigger('blur', this);
			}
		});
		
		return editors;
	}
)
