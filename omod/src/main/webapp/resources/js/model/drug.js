define(
    [
        openhmis.url.backboneBase + 'js/lib/backbone',
        openhmis.url.backboneBase + 'js/model/generic'
    ],
    function(Backbone, openhmis) {
    	openhmis.Drug = openhmis.GenericModel.extend({
    		meta: {
    			name: openhmis.getMessage('${project.parent.artifactId}.drug.name'),
                namePlural: openhmis.getMessage('${project.parent.artifactId}.drug.namePlural'),
                restUrl: 'v1/drug'
    		},
    		schema: {
    			name: "Text",
    			description: "Text",
    			display: { type: 'Text' },
    		},
    		parse: function(resp) {
    			if (resp && (!resp.name && resp.display))
    				resp.name = resp.display;
    			return resp;
    		},

    		toString: function() {
    			return this.get('display');
			}
    	});

    	return openhmis;
    }
);