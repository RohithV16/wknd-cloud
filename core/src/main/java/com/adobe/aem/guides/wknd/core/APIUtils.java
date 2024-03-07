package com.adobe.aem.guides.wknd.core;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.google.gson.JsonElement;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;

import java.util.LinkedHashMap;
import java.util.Map;

public class APIUtils {
    public static Map<String, String> parseParameters(Map<String, String[]> parameterMap) {
        Map<String, String> parameters = new LinkedHashMap<>();
        for (Map.Entry<String, String[]> entry : parameterMap.entrySet()) {
            String key = entry.getKey();
            if (isValidJson(key)) {
                JsonObject root = JsonParser.parseString(key).getAsJsonObject();
                for (Map.Entry<String, JsonElement> rootEntry : root.entrySet()) {
                    parameters.put(rootEntry.getKey(), rootEntry.getValue().getAsString());
                }
            }
        }
        return parameters;
    }

    private static boolean isValidJson(String json) {
        ObjectMapper objectMapper = new ObjectMapper();
        try {
            objectMapper.readTree(json);
        } catch (JsonProcessingException e) {
            return false;
        }
        return true;
    }
}
