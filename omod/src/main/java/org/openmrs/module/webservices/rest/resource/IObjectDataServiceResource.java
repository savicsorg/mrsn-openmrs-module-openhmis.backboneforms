package org.openmrs.module.webservices.rest.resource;

import org.openmrs.OpenmrsObject;
import org.openmrs.module.openhmis.commons.api.entity.IObjectDataService;

public interface IObjectDataServiceResource<TEntity extends OpenmrsObject, TService extends IObjectDataService<TEntity>> {
	public Class<? extends TService> getServiceClass();
}
