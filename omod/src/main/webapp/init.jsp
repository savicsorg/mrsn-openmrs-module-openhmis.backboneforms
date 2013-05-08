<%@ page contentType="text/javascript" %>
(function() {
	window.openhmis = {};
	openhmis.url = {};
	var openmrsUrlRoot = "${contextPath}/";
	openhmis.url.openmrs = openmrsUrlRoot;
	openhmis.url.rest = "${restUrl}";
	openhmis.url.resources = openmrsUrlRoot + "moduleResources/openhmis/";
	openhmis.url.page = openmrsUrlRoot + "module/openhmis/";
	openhmis.url.backboneBase = "backboneforms/";
	openhmis.url.backbone = openhmis.url.resources + openhmis.url.backboneBase;
})();