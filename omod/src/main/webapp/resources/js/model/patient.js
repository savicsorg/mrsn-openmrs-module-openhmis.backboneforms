define(
    [
        openhmis.url.backboneBase + 'js/lib/backbone',
        openhmis.url.backboneBase + 'js/model/generic'
    ],
    function(Backbone, openhmis) {
        openhmis.Patient = openhmis.GenericModel.extend({
            meta: {
                restUrl: 'v1/patient'
            },
            schema: {
                name: 'Text'
            },
            
            initialize: function() {
    			this.simplifyIds(this.attributes);
				var display = this.get("display") || "";
				var parts = display.match(/(.*) - (.*)/);
				if (parts && parts.length === 3) {
					this.get("identifiers").push({ display: parts[1] });
					if (!this.get("person"))
						this.set("person", {});
					this.get("person").display = parts[2];
				}
            },
            
    		// Bit of a hack to get patient identifier from the REF representation
            simplifyIds: function(attrs) {
                var ids = attrs.identifiers;
                if (ids) { for (var i in ids) { if (ids[i].display) {
					var pos = ids[i].display.lastIndexOf('=');
					if (pos !== -1)
						ids[i].display = ids[i].display.substring(pos + 2);
				}}}
				else
					attrs.identifiers = [];
            },
            
            parse: function(resp) {
                this.simplifyIds(resp);
                return resp;
            },
			
			toString: function() {
				return this.get("display") || this.get("name");
			}
        });
        
        return openhmis;
    }
)
