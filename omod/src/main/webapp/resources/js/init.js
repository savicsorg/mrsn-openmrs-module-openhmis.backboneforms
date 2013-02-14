(function() {
	window.openhmis = {};
	openhmis.url = {};
	var openmrsUrlRoot = "/openmrs/";
	openhmis.url.openmrs = openmrsUrlRoot;
	openhmis.url.rest = openmrsUrlRoot + "ws/rest/";
	openhmis.url.resources = openmrsUrlRoot + "moduleResources/openhmis/";
	openhmis.url.page = openmrsUrlRoot + "module/openhmis/";
	openhmis.url.backboneBase = "backboneforms/";
	openhmis.url.backbone = openhmis.url.resources + openhmis.url.backboneBase;
})();