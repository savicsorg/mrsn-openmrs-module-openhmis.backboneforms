package org.openmrs.module.openhmis.backboneforms.web.controller;

import org.openmrs.module.openhmis.backboneforms.web.BackboneWebConstants;
import org.springframework.context.MessageSource;
import org.springframework.stereotype.Controller;
import org.springframework.ui.ModelMap;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;

/**
 * Created by dubdabasoduba on 16/04/15.
 */
@Controller
@RequestMapping(BackboneWebConstants.MESSAGEPROPERTIES_JS_URI)
public class MessageRenderController {
	/*private MessageSource messageSource;

	public void setMessageSource(MessageSource messageSource) {
		this.messageSource = messageSource;
	}*/
	@RequestMapping(method = RequestMethod.GET)
	public void MessageRenderController( ModelMap model) {

	}
}
