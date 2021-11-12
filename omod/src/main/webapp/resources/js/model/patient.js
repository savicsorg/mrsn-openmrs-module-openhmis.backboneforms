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
