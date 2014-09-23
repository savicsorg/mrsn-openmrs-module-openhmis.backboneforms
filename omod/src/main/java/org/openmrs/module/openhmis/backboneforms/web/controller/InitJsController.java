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
package org.openmrs.module.openhmis.backboneforms.web.controller;

import org.apache.commons.lang.StringUtils;
import org.openmrs.api.context.Context;
import org.openmrs.module.openhmis.backboneforms.web.BackboneWebConstants;
import org.openmrs.module.webservices.rest.web.RestConstants;
import org.springframework.stereotype.Controller;
import org.springframework.ui.ModelMap;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;

import javax.servlet.http.HttpServletRequest;

@Controller
@RequestMapping(BackboneWebConstants.INIT_JS_URI)
public class InitJsController {
	@RequestMapping(method = RequestMethod.GET)
	public void initJs(ModelMap model, HttpServletRequest request) {
		// Load the max REST result global property
		Integer maxResults = RestConstants.MAX_RESULTS_ABSOLUTE;
		String propertyValue = Context.getAdministrationService().getGlobalProperty(
				RestConstants.MAX_RESULTS_ABSOLUTE_GLOBAL_PROPERTY_NAME);
		if (!StringUtils.isEmpty(propertyValue)) {
			try {
				maxResults = Integer.parseInt(propertyValue);
			} catch (Exception ex) {
				maxResults = RestConstants.MAX_RESULTS_ABSOLUTE;
			}
		}

		model.addAttribute("maxResults", maxResults);
		model.addAttribute("contextPath", request.getContextPath());
		model.addAttribute("restUrl", RestConstants.URI_PREFIX);
	}
}
