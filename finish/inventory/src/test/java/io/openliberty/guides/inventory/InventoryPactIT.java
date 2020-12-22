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

package io.openliberty.guides.inventory;

import au.com.dius.pact.consumer.dsl.PactDslJsonArray;
import au.com.dius.pact.consumer.dsl.PactDslWithProvider;
import au.com.dius.pact.consumer.junit.PactProviderRule;
import au.com.dius.pact.consumer.junit.PactVerification;
import au.com.dius.pact.core.model.RequestResponsePact;
import au.com.dius.pact.core.model.annotations.Pact;

import org.junit.Rule;
import org.junit.Test;

import static org.junit.Assert.assertEquals;

import java.util.HashMap;
import java.util.Map;

public class InventoryPactIT {
    // tag::mockprovider[]
    @Rule
    public PactProviderRule mockProvider = new PactProviderRule("System", this);
    // end::mockprovider[]
    // tag::pact[]
    @Pact(consumer = "Inventory")
    // end::pact[]
    // tag::builder[]
    public RequestResponsePact createPactEncoding(PactDslWithProvider builder) {
        Map<String, String> headers = new HashMap<String, String>();
        headers.put("Content-Type", "application/json");

        return builder
                // tag::given[]
                .given("os.encoding is UTF-8")
                // end::given[]
                .uponReceiving("a request for os encoding entity")
                .path("/system/properties/key/os.encoding")
                .method("GET")
                .willRespondWith()
                .headers(headers)
                .status(200)
                .body(new PactDslJsonArray().object()
                        .stringValue("os.encoding", "UTF-8"))
                .toPact();
    }
    // end::builder[]
    @Pact(consumer = "Inventory")
    public RequestResponsePact createPactEdition(PactDslWithProvider builder) {
        Map<String, String> headers = new HashMap<String, String>();
        headers.put("Content-Type", "application/json");

        return builder
                .given("Default directory is true")
                .uponReceiving("a request to check for the default directory")
                .path("/system/properties/key/wlp.user.dir.isDefault")
                .method("GET")
                .willRespondWith()
                .headers(headers)
                .status(200)
                .body(new PactDslJsonArray().object()
                        .stringValue("wlp.user.dir.isDefault", "true"))
                .toPact();
    }

    @Pact(consumer = "Inventory")
    public RequestResponsePact createPactVersion(PactDslWithProvider builder) {
        Map<String, String> headers = new HashMap<String, String>();
        headers.put("Content-Type", "application/json");

        return builder
                .given("version is 1.1")
                .uponReceiving("a request for the version")
                .path("/system/properties/version")
                .method("GET")
                .willRespondWith()
                .headers(headers)
                .status(200)
                .body(new PactDslJsonArray().object()
                        .decimalType("system.properties.version", 1.1))
                .toPact();
    }

    @Test
    // tag::verification[]
    @PactVerification(value = "System", fragment = "createPactEncoding")
    // end::verification[]
    public void runEncodingTest() {
        // tag::mockTest[]
        String encoding = new Inventory(mockProvider.getUrl()).getEncoding();
        // end::mockTest[]
        // tag::unitTest[]
        assertEquals("Expected encoding does not match",
                     "[{\"os.encoding\":\"UTF-8\"}]", encoding);
        // end::unitTest[]
    }

    @Test
    @PactVerification(value = "System", fragment = "createPactEdition")
    public void runEditionTest() {
        String edition = new Inventory(mockProvider.getUrl()).getEdition();
        assertEquals("Expected edition does not match",
                     "[{\"wlp.user.dir.isDefault\":\"true\"}]", edition);
    }

    @Test
    @PactVerification(value = "System", fragment = "createPactVersion")
    public void runVersionTest() {
        String version = new Inventory(mockProvider.getUrl()).getVersion();
        assertEquals("Expected version does not match",
                     "[{\"system.properties.version\":1.1}]", version);
    }
}