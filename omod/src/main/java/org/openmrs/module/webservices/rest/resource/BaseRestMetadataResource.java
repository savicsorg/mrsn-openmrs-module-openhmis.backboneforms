/*
 * The contents of this file are subject to the OpenMRS Public License
 * Version 1.1 (the "License"); you may not use this file except in
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

import org.openmrs.OpenmrsMetadata;
import org.openmrs.api.context.Context;
import org.openmrs.module.openhmis.commons.api.PagingInfo;
import org.openmrs.module.openhmis.commons.api.entity.IMetadataDataService;
import org.openmrs.module.webservices.rest.web.RequestContext;
import org.openmrs.module.webservices.rest.web.annotation.PropertyGetter;
import org.openmrs.module.webservices.rest.web.representation.FullRepresentation;
import org.openmrs.module.webservices.rest.web.representation.RefRepresentation;
import org.openmrs.module.webservices.rest.web.representation.Representation;
import org.openmrs.module.webservices.rest.web.resource.api.PageableResult;
import org.openmrs.module.webservices.rest.web.resource.impl.DelegatingResourceDescription;
import org.openmrs.module.webservices.rest.web.resource.impl.MetadataDelegatingCrudResource;
import org.openmrs.module.webservices.rest.web.response.ResponseException;

public abstract class BaseRestMetadataResource<E extends OpenmrsMetadata> extends MetadataDelegatingCrudResource<E> implements IMetadataDataServiceResource<E> {

	@Override
	public abstract E newDelegate();
	
	@Override
	public E save(E delegate) {
		IMetadataDataService<E> service = Context.getService(getServiceClass());
		service.save(delegate);
		return delegate;
	}

	protected DelegatingResourceDescription getDefaultRepresentationDescription() {
		DelegatingResourceDescription description = new DelegatingResourceDescription();
		description.addProperty("uuid");
		description.addProperty("name");
		description.addProperty("description");
		description.addProperty("retired");
		description.addProperty("retireReason");

		return description;
	}
	
	@Override
	public DelegatingResourceDescription getRepresentationDescription(Representation rep) {
		DelegatingResourceDescription description;
		if (rep instanceof RefRepresentation) {
			description = new DelegatingResourceDescription();

			description.addProperty("uuid");
			description.addProperty("name");
			description.addProperty("retired");
		} else {
			description = getDefaultRepresentationDescription();

			if (rep instanceof FullRepresentation) {
				description.addProperty("auditInfo", findMethod("getAuditInfo"));
			}
		}
		return description;
	}
	
	@Override
	public DelegatingResourceDescription getCreatableProperties() {
		DelegatingResourceDescription description = getDefaultRepresentationDescription();
		description.removeProperty("uuid");
		description.removeProperty("retireReason");

		return description;
	}

	@Override
	public E getByUniqueId(String uniqueId) {
		IMetadataDataService<E> service = Context.getService(getServiceClass());

		return service.getByUuid(uniqueId);
	}

	@Override
	public void purge(E delegate, RequestContext context) throws ResponseException {
		IMetadataDataService<E> service = Context.getService(getServiceClass());
		service.purge(delegate);		
	}
	
	@Override
	protected PageableResult doGetAll(RequestContext context) throws ResponseException {
		IMetadataDataService<E> service = Context.getService(getServiceClass());
		PagingInfo pagingInfo = PagingUtil.getPagingInfoFromContext(context);

		return new AlreadyPagedWithLength<E>(context, service.getAll(context.getIncludeAll(), pagingInfo), pagingInfo.hasMoreResults(), pagingInfo.getTotalRecordCount());
	}

	@Override
	protected PageableResult doSearch(RequestContext context) {
		context.setRepresentation(Representation.REF);
		String query = context.getParameter("q");

		return new MetadataSearcher<E>(getServiceClass()).searchByName(query, context);
	}
	
	@PropertyGetter("retired")
	public Boolean getRetired(E delegate) {
		return delegate.isRetired();
	}
}
