package com.adobe.aem.guides.wknd.core.service.AI;

import com.fasterxml.jackson.core.JsonProcessingException;
import org.apache.sling.api.SlingHttpServletRequest;

import java.util.Map;

public interface JsonPromptService {
    String getContentSummarization(SlingHttpServletRequest request, Map<String, String> parameters) throws JsonProcessingException;
    String getContentElaboration(SlingHttpServletRequest request, Map<String, String> parameters) throws JsonProcessingException;
    String getAdjustContentTone(SlingHttpServletRequest request, Map<String, String> parameters) throws JsonProcessingException;
    String getContentTone(SlingHttpServletRequest request, Map<String, String> parameters) throws JsonProcessingException;
    String getContentTranslation(SlingHttpServletRequest request, Map<String, String> parameters) throws JsonProcessingException;
    String getContentCreation(SlingHttpServletRequest request, Map<String, String> parameters) throws JsonProcessingException;
    String getReview(SlingHttpServletRequest request, Map<String, String> parameters) throws JsonProcessingException;
    String getTargetAudience(SlingHttpServletRequest request, Map<String, String> parameters) throws JsonProcessingException;
    String getContentSuggestion(SlingHttpServletRequest request, Map<String, String> parameters) throws JsonProcessingException;

}
