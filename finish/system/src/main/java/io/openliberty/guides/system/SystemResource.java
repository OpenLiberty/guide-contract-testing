// tag::copyright[]
/*******************************************************************************
 * Copyright (c) 2020 IBM Corporation and others.
 * All rights reserved. This program and the accompanying materials
 * are made available under the terms of the Eclipse Public License v1.0
 * which accompanies this distribution, and is available at
 * http://www.eclipse.org/legal/epl-v10.html
 *
 * Contributors:
 *     IBM Corporation - initial API and implementation
 *******************************************************************************/
// end::copyright[]
package io.openliberty.guides.system;

import javax.json.Json;
import javax.json.JsonArray;
import javax.ws.rs.PathParam;
import javax.ws.rs.core.Response;

import javax.enterprise.context.RequestScoped;
import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.core.MediaType;

import org.eclipse.microprofile.metrics.annotation.Counted;
import org.eclipse.microprofile.metrics.annotation.Timed;

@RequestScoped
@Path("/properties")
public class SystemResource {

	@GET
	@Produces(MediaType.APPLICATION_JSON)
	@Timed(name = "getPropertiesTime", description = "Time needed to get the JVM system properties")
	@Counted(absolute = true, description = "Number of times the JVM system properties are requested")
	public Response getProperties() {
		return Response.ok(System.getProperties()).build();
	}

	@GET
	@Path("/key/{key}")
	@Produces(MediaType.APPLICATION_JSON)
	public Response getPropertiesByKey(@PathParam("key") String key) {

		try {

			JsonArray response = Json.createArrayBuilder()
					.add(Json.createObjectBuilder()
					.add(key, System.getProperties().get(key).toString()))
					.build();
			return Response.ok(response, MediaType.APPLICATION_JSON).build();
		} catch (java.lang.NullPointerException exception) {

			return Response.status(Response.Status.NOT_FOUND)
					.build();
		}
	}

	@GET
	@Path("/version")
	@Produces(MediaType.APPLICATION_JSON)
	public JsonArray getVersion() {

		JsonArray response = Json.createArrayBuilder()
				.add(Json.createObjectBuilder()
				// tag::decimal[]
				.add("system.properties.version", 1.1))
				// end::decimal[]
				.build();
		return response;
	}

}