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
package org.openmrs.module.openhmis.backboneforms.web;

import org.openmrs.module.openhmis.commons.web.WebConstants;

public class BackboneWebConstants extends WebConstants {
	public static final String MODULE_ROOT = MODULE_BASE + "backboneforms/";
	public static final String MODULE_RESOURCE_ROOT = WebConstants.MODULE_RESOURCE_BASE + "backboneforms/";

	public static final String BACKBONE_INIT_JS = "/ws/module/openhmis/backboneforms/init.js";
	public static final String BACKBONE_CURL_JS = MODULE_RESOURCE_ROOT + "js/curl.js";

	public static final String INIT_JS_URI = MODULE_ROOT + "init.js";
	public static final String MESSAGEPROPERTIES_JS_URI = MODULE_ROOT + "messageProperties.js";
}
