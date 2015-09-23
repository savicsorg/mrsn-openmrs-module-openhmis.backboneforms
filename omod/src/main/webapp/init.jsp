<%@ page contentType="text/javascript" %>
<%--
	  ~ The contents of this file are subject to the OpenMRS Public License
	  ~ Version 2.0 (the "License"); you may not use this file except in
	  ~ compliance with the License. You may obtain a copy of the License at
	  ~ http://license.openmrs.org
	  ~
	  ~ Software distributed under the License is distributed on an "AS IS"
	  ~ basis, WITHOUT WARRANTY OF ANY KIND, either express or implied. See
	  ~ the License for the specific language governing rights and
	  ~ limitations under the License.
	  ~
	  ~ Copyright (C) OpenHMIS.  All Rights Reserved.
--%>
(function() {
	window.openhmis = {};
	openhmis.url = {};
	openhmis.rest = {};
	var openmrsUrlRoot = "${contextPath}/";
	openhmis.url.openmrs = openmrsUrlRoot;
	openhmis.url.rest = "${restUrl}";
	openhmis.url.resources = openmrsUrlRoot + "moduleResources/openhmis/";
	openhmis.url.page = openmrsUrlRoot + "module/openhmis/";
	openhmis.url.backboneBase = "backboneforms/";
	openhmis.url.backbone = openhmis.url.resources + openhmis.url.backboneBase;
	openhmis.rest.maxResults = ${maxResults};
})();
