package org.openmrs.module.webservices.rest.resource;

import org.apache.commons.lang.NotImplementedException;
import org.hibernate.proxy.HibernateProxy;
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
	private static final String NEED_SUBCLASS_HANDLER = "This operation should be handled by a subclass handler.";
	
	@Override
	public boolean hasTypesDefined() {
		return true;
	}
	
	/*TODO: This is a workaround for a possible bug in the REST module */
	@SuppressWarnings("unchecked")
	@Override
	protected String getTypeName(T delegate) {
		Class<? extends T> unproxiedClass = (Class<? extends T>) delegate.getClass();
		if (HibernateProxy.class.isAssignableFrom(unproxiedClass))
			unproxiedClass = (Class<? extends T>) unproxiedClass.getSuperclass();
		return getTypeName((Class<? extends T>) unproxiedClass);
	}
	
	@Override
	public T newDelegate() {
		throw new NotImplementedException(NEED_SUBCLASS_HANDLER);
	}

	@Override
	public T save(T delegate) {
		throw new NotImplementedException(NEED_SUBCLASS_HANDLER);
	}

	@Override
	public DelegatingResourceDescription getRepresentationDescription(Representation rep) {
		throw new NotImplementedException(NEED_SUBCLASS_HANDLER);
	}

	@Override
	public T getByUniqueId(String uniqueId) {
		throw new NotImplementedException(NEED_SUBCLASS_HANDLER);
	}

	@Override
	public void purge(T delegate, RequestContext context) throws ResponseException {
		throw new NotImplementedException(NEED_SUBCLASS_HANDLER);
	}

}
