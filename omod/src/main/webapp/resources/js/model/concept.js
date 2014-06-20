define(
    [
        openhmis.url.backboneBase + 'js/lib/backbone',
        openhmis.url.backboneBase + 'js/model/generic'
    ],
    function(Backbone, openhmis) {
    	openhmis.Concept = openhmis.GenericModel.extend({
    		meta: {
    			name: "Concept",
                namePlural: "Concepts",
                restUrl: 'v1/concept'
    		},
    		schema: {
    			display: { type: 'Text' },
    		},

    		toString: function() {
    			return this.get('display');
			}
    	});

    	return openhmis;
    }
);