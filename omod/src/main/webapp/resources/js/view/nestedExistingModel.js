define(
  [
    openhmis.url.backboneBase + 'js/lib/backbone',
    openhmis.url.backboneBase + 'js/lib/backbone-forms',
    openhmis.url.backboneBase + 'js/lib/backbone.bootstrap-modal',
    openhmis.url.backboneBase + 'js/view/list',
    openhmis.url.backboneBase + 'js/model/generic'
  ],
  function(Backbone) {

    var Form = Backbone.Form,
        editors = Form.editors;

	editors.List.NestedExistingModel = editors.List.NestedModel.extend({
    	initialize: function(options) {
    		editors.List.NestedModel.prototype.initialize.call(this, options);
    	    // Get nested schema if NestedExistingModel
            if (this.schema.itemType == 'NestedExistingModel') {
              if (!this.schema.model) throw 'Missing required option "schema.model"';
      
              this.nestedSchema = this.schema.model.prototype.schema;
              if (_.isFunction(this.nestedSchema)) this.nestedSchema = this.nestedSchema();
            }
    	},
    	
    	openEditor: function() {
			var self = this;
			
			var selectSchema, modalWidth;
			
			if (this.schema.editor && typeof editors[this.schema.editor] == 'function') {
				selectSchema = $.extend({}, this.schema, { type: this.schema.editor });
				modalWidth = editors[this.schema.editor].prototype.modalWidth;
			}
			else {
				selectSchema = {
					type: 'GenericModelSelect',
					modelType: this.schema.model,
					options: new openhmis.GenericCollection(null, { model: this.schema.model }),
					objRef: true
				}
			}
			
			selectSchema.title = selectSchema.title || this.schema.title || "Model";
    		
			var form = new Form({
				schema: {
					model: selectSchema
				},
				data: {
					model: this.value instanceof Backbone.Model ? this.value.attributes : this.value
				}
			});
	  
	        var modal = this.modal = new Backbone.BootstrapModal({
				content: form,
				animate: true,
				width: modalWidth,
				disableEnter: true
	        }).open();
	  
	        this.trigger('open', this);
	        this.trigger('focus', this);
	  
	        modal.on('cancel', function() {
	        	this.modal = null;
	  
	        	this.trigger('close', this);
	        	this.trigger('blur', this);
			}, this);
			
			modal.on('ok', _.bind(this.onModalSubmitted, this, form, modal));
    	},
    	
    	onModalSubmitted: function(form, modal) {
			var isNew = !this.value;
			  
			this.modal = null;
	
			var idAttribute = Backbone.Model.prototype.idAttribute;
			if (this.value) {
				var id = this.value.id || this.value[idAttribute];
			}

			//If OK, render the list item
			this.value = form.getValue().model;
			
			if (this.value !== null) {

				if (id !== undefined) {
					this.value[idAttribute] = id;
				}
	
				this.renderSummary();
		  
				if (isNew) {
					this.trigger('readyToAdd');
				}
			
				this.trigger('change', this);
			}
			
			this.trigger('close', this);
			this.trigger('blur', this);
    	},
    	
    	getStringValue: function() {
			if (this.schema.itemType == 'NestedExistingModel')
				return new (this.schema.model)(this.getValue()).toString();
			else
				return editors.List.NestedModel.prototype.getStringValue.call(this);
		}
    });
});