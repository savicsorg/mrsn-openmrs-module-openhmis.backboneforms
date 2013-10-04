/*
 * The contents of this file are subject to the OpenMRS Public License
 * Version 2.0 (the "License"); you may not use this file except in
 * compliance with the License. You may obtain a copy of the License at
 * http://license.openmrs.org
 *
 * Software distributed under the License is distributed on an "AS IS"
 * basis, WITHOUT WARRANTY OF ANY KIND, either express or implied. See the
 * License for the specific language governing rights and limitations
 * under the License.
 *
 * Copyright (C) OpenMRS, LLC.  All Rights Reserved.
 */
package org.openmrs.module.webservices.rest.resource;

import org.openmrs.OpenmrsObject;
import org.openmrs.api.context.Context;
import org.openmrs.module.openhmis.commons.api.PagingInfo;
import org.openmrs.module.openhmis.commons.api.entity.IObjectDataService;
import org.openmrs.module.webservices.rest.web.RequestContext;
import org.openmrs.module.webservices.rest.web.representation.Representation;
import org.openmrs.module.webservices.rest.web.resource.api.PageableResult;
import org.openmrs.module.webservices.rest.web.resource.impl.DelegatingCrudResource;
import org.openmrs.module.webservices.rest.web.resource.impl.DelegatingResourceDescription;
import org.openmrs.module.webservices.rest.web.response.ResponseException;

public abstract class BaseRestObjectResource<E extends OpenmrsObject>
		extends DelegatingCrudResource<E>
		implements IObjectDataServiceResource<E, IObjectDataService<E>> {
	@Override
	public abstract E newDelegate();

	protected DelegatingResourceDescription getDefaultRepresentationDescription() {
		DelegatingResourceDescription description = new DelegatingResourceDescription();

		description.addProperty("uuid");

		return description;
	}

	@Override
	public DelegatingResourceDescription getRepresentationDescription(Representation rep) {
		return getDefaultRepresentationDescription();
	}

	@Override
	public DelegatingResourceDescription getCreatableProperties() {
		DelegatingResourceDescription description = getDefaultRepresentationDescription();
		description.removeProperty("uuid");

		return description;
	}

	@Override
	public E save(E delegate) {
		Class<? extends IObjectDataService<E>> clazz = getServiceClass();
		if (clazz == null) {
			throw new IllegalStateException("This resource has not be defined to allow saving.  To save, implement the resource getServiceClass method.");
		}

		IObjectDataService<E> service = Context.getService(clazz);
		service.save(delegate);

		return delegate;
	}

	@Override
	public E getByUniqueId(String uniqueId) {
		Class<? extends IObjectDataService<E>> clazz = getServiceClass();
		if (clazz == null) {
			throw new IllegalStateException("This resource has not be defined to allow searching.  To search, implement the resource getServiceClass method.");
		}

		IObjectDataService<E> service = Context.getService(clazz);
		return service.getByUuid(uniqueId);
	}

	@Override
	public void delete(E delegate, String reason, RequestContext context) {
		purge(delegate, context);
	}

	@Override
	public void purge(E delegate, RequestContext context) throws ResponseException {
		Class<? extends IObjectDataService<E>> clazz = getServiceClass();
		if (clazz == null) {
			throw new IllegalStateException("This resource has not be defined to allow purging.  To purge, implement the resource getServiceClass method.");
		}

		IObjectDataService<E> service = Context.getService(clazz);
		service.purge(delegate);
	}

	@Override
	protected PageableResult doGetAll(RequestContext context) throws ResponseException {
		Class<? extends IObjectDataService<E>> clazz = getServiceClass();
		if (clazz == null) {
			throw new IllegalStateException("This resource has not be defined to allow searching.  To search, implement the resource getServiceClass method.");
		}

		IObjectDataService<E> service = Context.getService(clazz);
		PagingInfo pagingInfo = PagingUtil.getPagingInfoFromContext(context);
		return new AlreadyPagedWithLength<E>(context, service.getAll(pagingInfo), pagingInfo.hasMoreResults(), pagingInfo.getTotalRecordCount());
	}
}
