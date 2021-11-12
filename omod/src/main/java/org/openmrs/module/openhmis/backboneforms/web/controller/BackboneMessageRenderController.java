/*
 * The contents of this file are subject to the OpenMRS Public License
 * Version 2.0 (the "License"); you may not use this file except in
 * compliance with the License. You may obtain a copy of the License at
 * http://license.openmrs.org
 *
 * Software distributed under the License is distributed on an "AS IS"
 * basis, WITHOUT WARRANTY OF ANY KIND, either express or implied. See
 * the License for the specific language governing rights and
 * limitations under the License.
 *
 * Copyright (C) OpenHMIS.  All Rights Reserved.
 */
package org.openmrs.module.openhmis.backboneforms.web.controller;

import org.openmrs.module.openhmis.backboneforms.web.BackboneWebConstants;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.servlet.ModelAndView;
import org.springframework.web.servlet.support.RequestContextUtils;

import javax.servlet.http.HttpServletRequest;
import java.util.Locale;
import java.util.ResourceBundle;

/**
 * Controller for the message properties fragment.
 */
@Controller
@RequestMapping(BackboneWebConstants.MESSAGE_PROPERTIES_JS_URI)
public class BackboneMessageRenderController {

	@RequestMapping(method = RequestMethod.GET)
	public ModelAndView render(HttpServletRequest request) {
		Locale locale = RequestContextUtils.getLocale(request);
		ResourceBundle resourceBundle = ResourceBundle.getBundle("messages", locale);
		return new ModelAndView(BackboneWebConstants.MESSAGE_PAGE, "keys", resourceBundle.getKeys());
	}
}
