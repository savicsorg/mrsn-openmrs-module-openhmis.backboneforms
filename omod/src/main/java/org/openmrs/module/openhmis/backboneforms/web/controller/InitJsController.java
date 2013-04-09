package org.openmrs.module.openhmis.backboneforms.web.controller;

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
		model.addAttribute("contextPath", request.getContextPath());
		model.addAttribute("restUrl", RestConstants.URI_PREFIX);
	}
}