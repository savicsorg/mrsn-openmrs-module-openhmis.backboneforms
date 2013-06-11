package org.openmrs.module.webservices.rest.resource;

import org.openmrs.module.openhmis.commons.api.PagingInfo;
import org.openmrs.module.webservices.rest.web.RequestContext;

public class PagingUtil {
	public static PagingInfo getPagingInfoFromContext(RequestContext context) {
		Integer page = (context.getStartIndex() / context.getLimit()) + 1;
		return new PagingInfo(page, context.getLimit());
	}
}
