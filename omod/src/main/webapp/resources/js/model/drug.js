define(
    [
        openhmis.url.backboneBase + 'js/lib/backbone',
        openhmis.url.backboneBase + 'js/model/generic'
    ],
    function(Backbone, openhmis) {
    	openhmis.Drug = openhmis.GenericModel.extend({
    		meta: {
    			name: "Drug",
                restUrl: 'v1/drug'
    		},
    		schema: {
    			name: "Text",
    			description: "Text"
    		},
    		parse: function(resp) {
    			if (resp && (!resp.name && resp.display))
    				resp.name = resp.display;
    			return resp;
    		}
    	});
    }
);