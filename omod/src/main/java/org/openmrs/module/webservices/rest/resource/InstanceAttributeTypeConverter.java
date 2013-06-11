package org.openmrs.module.webservices.rest.resource;

import org.openmrs.module.openhmis.commons.api.entity.model.InstanceAttributeType;
import org.openmrs.module.webservices.rest.web.RequestContext;
import org.openmrs.module.webservices.rest.web.RestConstants;
import org.openmrs.module.webservices.rest.web.annotation.Resource;
import org.openmrs.module.webservices.rest.web.representation.Representation;
import org.openmrs.module.webservices.rest.web.resource.impl.DelegatingResourceDescription;
import org.openmrs.module.webservices.rest.web.resource.impl.MetadataDelegatingCrudResource;
import org.openmrs.module.webservices.rest.web.response.ResponseException;

@Resource(name = RestConstants.VERSION_2 + "/openhmis/attributetype", supportedClass = InstanceAttributeType.class, supportedOpenmrsVersions = {"1.8.*", "1.9.*"})
public class InstanceAttributeTypeConverter<T extends InstanceAttributeType<?>> extends MetadataDelegatingCrudResource<T> {

	@Override
	public boolean hasTypesDefined() {
		return true;
	}
	
//	@Override
//	public String getUri(Object instance) {
//		// TODO Auto-generated method stub
//		return null;
//	}

	@Override
	public T newDelegate() {
		// TODO Auto-generated method stub
		return null;
	}

	@Override
	public T save(T delegate) {
		// TODO Auto-generated method stub
		return null;
	}

	@Override
	public DelegatingResourceDescription getRepresentationDescription(
			Representation rep) {
		// TODO Auto-generated method stub
		return null;
	}

	@Override
	public T getByUniqueId(String uniqueId) {
		// TODO Auto-generated method stub
		return null;
	}

	@Override
	public void purge(T delegate, RequestContext context)
			throws ResponseException {
		// TODO Auto-generated method stub
		
	}

}
