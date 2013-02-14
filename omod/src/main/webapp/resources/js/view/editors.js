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
		  
				var numeric = /^[0-9]*\.?[0-9]*?$/.test(newVal);
		  
				if (numeric) {
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
		
			  var numeric = /^[0-9]*\.?[0-9]*?$/.test(newVal);
		
			  if (numeric) {
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
			}
			//valueChanged: function(event) {
			//		this.$el.val(this.el.defaultValue);
			//		return;
			//	}
			//	event.target.defaultValue = event.target.value;
			//}
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
		
		return editors;
	}
)
