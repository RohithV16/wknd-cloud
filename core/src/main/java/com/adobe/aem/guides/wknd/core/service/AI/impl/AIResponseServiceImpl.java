package com.adobe.aem.guides.wknd.core.service.AI.impl;

import com.adobe.aem.guides.wknd.core.service.AI.AIResponseService;
import com.adobe.aem.guides.wknd.core.service.AI.PilotAIService;
import com.google.gson.JsonElement;
import com.google.gson.JsonParser;
import org.apache.http.HttpStatus;
import org.apache.http.client.methods.CloseableHttpResponse;
import org.apache.http.client.methods.HttpPost;
import org.apache.http.entity.StringEntity;
import org.apache.http.impl.client.CloseableHttpClient;
import org.apache.http.osgi.services.HttpClientBuilderFactory;
import org.apache.http.util.EntityUtils;
import org.osgi.service.component.annotations.Component;
import org.osgi.service.component.annotations.Reference;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.IOException;
import java.nio.charset.StandardCharsets;

@Component(service = AIResponseService.class, immediate = true)
public class AIResponseServiceImpl implements AIResponseService {
    @Reference
    private HttpClientBuilderFactory clientBuilderFactory;
    @Reference
    private transient PilotAIService pilotAIService;
    private final transient Logger logger = LoggerFactory.getLogger(getClass());

    @Override
    public String getResponse(String body) {
        try (CloseableHttpClient client = clientBuilderFactory.newBuilder().build()) {
            HttpPost httPost = new HttpPost(pilotAIService.getApiUrl());
            httPost.setEntity(new StringEntity(body, StandardCharsets.UTF_8));
            httPost.setHeader("Content-Type", "application/json");
            httPost.setHeader("Authorization", getBasicAuth());
            try (CloseableHttpResponse httpClientResponse = client.execute(httPost)) {
                if (httpClientResponse.getStatusLine().getStatusCode() == HttpStatus.SC_OK) {
                    byte[] byteArray = EntityUtils.toByteArray(httpClientResponse.getEntity());
                    JsonElement root = JsonParser.parseString(new String(byteArray, StandardCharsets.UTF_8));
                    return root.getAsJsonObject().get("choices").getAsJsonArray().get(0).getAsJsonObject().get("message").getAsJsonObject().get("content").getAsString();
                }
            }
        } catch (IOException e) {
            logger.error("Error while getting the Response in  AIResponseImpl ", e);
        }
        return null;
    }

    private String getBasicAuth() {
        return pilotAIService.getAuthorizationType() + " " + pilotAIService.getAuthorizationToken();
    }
}
