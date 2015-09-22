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
package org.openmrs.module.webservices.rest.web.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.openmrs.Concept;
import org.openmrs.api.ConceptService;
import org.openmrs.api.context.Context;
import org.openmrs.module.openhmis.commons.api.entity.model.IAttributeType;
import org.openmrs.module.openhmis.commons.api.entity.model.IInstanceAttributeType;
import org.springframework.stereotype.Controller;
import org.springframework.ui.ModelMap;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;

import javax.servlet.http.HttpServletRequest;

@Controller
public abstract class AttributeFragmentControllerBase {
	public static final String REQUEST_MAPPING_PATH_BASE = "/module/openhmis/backboneforms/attributeFragment";

	protected abstract List<? extends IAttributeType> getAttributeTypes(HttpServletRequest request);

	@RequestMapping(method = RequestMethod.GET)
	public String render(HttpServletRequest request, ModelMap model) {
		List<? extends IAttributeType> attributeTypes = getAttributeTypes(request);

		ConceptService conceptService = Context.getConceptService();
		Map<Integer, Concept> conceptMap = new HashMap<Integer, Concept>();
		for (IAttributeType type : attributeTypes) {
			if (type.getFormat().equals("org.openmrs.Concept") && type.getForeignKey() != null) {
				conceptMap.put(type.getForeignKey(), conceptService.getConcept(type.getForeignKey()));
			}
		}

		model.addAttribute("attributeTypes", attributeTypes);
		model.addAttribute("conceptMap", conceptMap);

		return REQUEST_MAPPING_PATH_BASE;
	}
}
