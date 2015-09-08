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
