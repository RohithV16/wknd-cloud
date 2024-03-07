package com.adobe.aem.guides.wknd.core.service.AI.impl;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import org.apache.commons.lang3.StringUtils;
import org.apache.sling.api.SlingHttpServletRequest;
import org.osgi.service.component.annotations.Component;

import com.adobe.aem.guides.wknd.core.service.AI.JsonPromptService;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;

@Component(service = JsonPromptService.class, immediate = true)
public class JsonPromptServiceImpl implements JsonPromptService {
    @Override
    public String getContentSummarization(SlingHttpServletRequest request, Map<String, String> parameters) throws JsonProcessingException {
        if (!parameters.isEmpty() && StringUtils.isNotBlank(parameters.get("prompt"))) {
            return getContentSummarizationBody(parameters);
        }
        return null;
    }

    @Override
    public String getContentElaboration(SlingHttpServletRequest request, Map<String, String> parameters) throws JsonProcessingException {
        if (!parameters.isEmpty() && StringUtils.isNotBlank(parameters.get("prompt"))) {
            return getContentElaborationBody(parameters);
        }
        return null;
    }

    @Override
    public String getContentCreation(SlingHttpServletRequest request, Map<String, String> parameters) throws JsonProcessingException {
        if (!parameters.isEmpty() && StringUtils.isNotBlank(parameters.get("prompt"))) {
            return getContentCreationBody(parameters);
        }
        return null;
    }

    @Override
    public String getReview(SlingHttpServletRequest request, Map<String, String> parameters) throws JsonProcessingException {
        if (!parameters.isEmpty() && StringUtils.isNotBlank(parameters.get("prompt"))) {
            return getReviewBody(parameters);
        }
        return null;
    }

    @Override
    public String getTargetAudience(SlingHttpServletRequest request, Map<String, String> parameters) throws JsonProcessingException {
        if (!parameters.isEmpty() && StringUtils.isNotBlank(parameters.get("prompt"))) {
            return getTargetAudienceBody(parameters);
        }
        return null;
    }

    @Override
    public String getContentSuggestion(SlingHttpServletRequest request, Map<String, String> parameters) throws JsonProcessingException {
        if (!parameters.isEmpty() && StringUtils.isNotBlank(parameters.get("prompt"))) {
            return getContentSuggestionBody(parameters);
        }
        return null;
    }

    @Override
    public String getContentTranslation(SlingHttpServletRequest request, Map<String, String> parameters) throws JsonProcessingException {
        if (!parameters.isEmpty() && StringUtils.isNotBlank(parameters.get("prompt"))) {
            return getContentTranslationBody(parameters);
        }
        return null;
    }

    @Override
    public String getContentTone(SlingHttpServletRequest request, Map<String, String> parameters) throws JsonProcessingException {
        if (!parameters.isEmpty() && StringUtils.isNotBlank(parameters.get("prompt"))) {
            return getContentToneBody(parameters);
        }
        return null;
    }

    @Override
    public String getAdjustContentTone(SlingHttpServletRequest request, Map<String, String> parameters) throws JsonProcessingException {
        if (!parameters.isEmpty() && StringUtils.isNotBlank(parameters.get("prompt"))) {
            return adjustContentToneBody(parameters);
        }
        return null;
    }

    private String getContentSuggestionBody(Map<String, String> parameters) throws JsonProcessingException {
        Map<String, Object> message1 = new LinkedHashMap<>();
        message1.put("role", "system");
        message1.put("content", "Create a new combined marketing article from the below text for the following target audiences " +
                "- " + parameters.get("targetaudience") + ". The output will be plain text and the newly generated content should " +
                "talks about only the following audiences - " + parameters.get("targetaudience") + ", remove existing content for the following audiences " +
                "if there is any - " + parameters.get("notintargetaudience") + ". \\n\\nText: " + parameters.get("prompt"));

        Map<String, Object> message2 = new LinkedHashMap<>();
        message2.put("role", "user");
        message2.put("content", parameters.get("prompt"));

        List<Map<String, Object>> obj = new ArrayList<>();
        obj.add(message1);
        obj.add(message2);
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("model", "gpt-3.5-turbo");
        data.put("messages", obj);
        data.put("temperature", 0.7);
        data.put("top_p", 1);
        return new ObjectMapper().writeValueAsString(data);
    }

    private String getTargetAudienceBody(Map<String, String> parameters) throws JsonProcessingException {
        Map<String, Object> message1 = new LinkedHashMap<>();
        message1.put("role", "system");
        message1.put("content", "Analyse the following marketing article and provide me only those target personas or audiences which are prominent and emphasized, not all the personas. The output should be only the target personas as a comma separated value");

        Map<String, Object> message2 = new LinkedHashMap<>();
        message2.put("role", "user");
        message2.put("content", parameters.get("prompt"));

        List<Map<String, Object>> obj = new ArrayList<>();
        obj.add(message1);
        obj.add(message2);
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("model", "gpt-3.5-turbo");
        data.put("messages", obj);
        data.put("temperature", 0.7);
        data.put("top_p", 1);
        return new ObjectMapper().writeValueAsString(data);
    }

    private String getReviewBody(Map<String, String> parameters) throws JsonProcessingException {
        Map<String, Object> message1 = new LinkedHashMap<>();
        message1.put("role", "system");
        message1.put("content", "Proofread the following marketing copy for grammar and spelling errors. As an output, only provide a grade out of 10 and an overall review feedback. Proofread the following marketing copy for lack of coherence. Review the marketing copy and ensure that the call to action is clear, compelling, and easy to understand also Review the marketing copy to ensure it does not contain any potentially offensive content. Also highlight the grammar, spelling errors, lack of coherence as different sections.");

        Map<String, Object> message2 = new LinkedHashMap<>();
        message2.put("role", "user");
        message2.put("content", parameters.get("prompt"));

        List<Map<String, Object>> obj = new ArrayList<>();
        obj.add(message1);
        obj.add(message2);
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("model", "gpt-3.5-turbo");
        data.put("messages", obj);
        data.put("temperature", 0.7);
        data.put("top_p", 1);
        return new ObjectMapper().writeValueAsString(data);
    }

    private String getContentElaborationBody(Map<String, String> parameters) throws JsonProcessingException {
        Map<String, Object> message1 = new LinkedHashMap<>();
        message1.put("role", "system");
        message1.put("content", "Elaborate the following content");

        Map<String, Object> message2 = new LinkedHashMap<>();
        message2.put("role", "user");
        message2.put("content", parameters.get("prompt"));

        List<Map<String, Object>> obj = new ArrayList<>();
        obj.add(message1);
        obj.add(message2);
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("model", "gpt-3.5-turbo");
        data.put("messages", obj);
        data.put("temperature", 0.7);
        data.put("top_p", 1);
        return new ObjectMapper().writeValueAsString(data);
    }

    private String getContentSummarizationBody(Map<String, String> parameters) throws JsonProcessingException {
        Map<String, Object> message1 = new LinkedHashMap<>();
        message1.put("role", "system");
        message1.put("content", "Summarize the following content");

        Map<String, Object> message2 = new LinkedHashMap<>();
        message2.put("role", "user");
        message2.put("content", parameters.get("prompt"));

        List<Map<String, Object>> obj = new ArrayList<>();
        obj.add(message1);
        obj.add(message2);
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("model", "gpt-3.5-turbo");
        data.put("messages", obj);
        data.put("temperature", 0.7);
        data.put("top_p", 1);
        return new ObjectMapper().writeValueAsString(data);
    }

    private String getContentCreationBody(Map<String, String> parameters) throws JsonProcessingException {
        Map<String, Object> message1 = new LinkedHashMap<>();
        message1.put("role", "system");
        message1.put("content", "Create a marketing article in " + parameters.get("language") + " language in formal and neutral tone with the following topic " + parameters.get("prompt") + " within " + parameters.get("word_limit") + " words.");

        List<Map<String, Object>> obj = new ArrayList<>();
        obj.add(message1);
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("model", "gpt-3.5-turbo");
        data.put("messages", obj);
        data.put("temperature", 0.7);
        data.put("top_p", 1);
        return new ObjectMapper().writeValueAsString(data);
    }

    private String getContentTranslationBody(Map<String, String> parameters) throws JsonProcessingException {

        Map<String, Object> message1 = new LinkedHashMap<>();
        message1.put("role", "system");
        message1.put("content", "Translate this into " + parameters.get("language") + " language - ");

        Map<String, Object> message2 = new LinkedHashMap<>();
        message2.put("role", "user");
        message2.put("content", parameters.get("prompt"));

        List<Map<String, Object>> obj = new ArrayList<>();
        obj.add(message1);
        obj.add(message2);
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("model", "gpt-3.5-turbo");
        data.put("messages", obj);
        data.put("temperature", 0.7);
        data.put("top_p", 1);
        return new ObjectMapper().writeValueAsString(data);
    }

    private String getContentToneBody(Map<String, String> parameters) throws JsonProcessingException {

        Map<String, Object> message1 = new LinkedHashMap<>();
        message1.put("role", "system");
        message1.put("content", "Analyze the following text and find me the current tone of the voice. The output value will be one of the below tones, not any sentence -\r\n" +
                "            Professional: If the tone is formal and professional and neutral.\r\n" +
                "            Friendly: If the tone is friendly and helpful.\r\n" +
                "            Elegant: If the tone is elegant and luxurious.\r\n" +
                "            Empathetic: If the tone is empathetic and caring.\r\n" +
                "            Confident: If the tone is confident and assertive.\r\n" +
                "            Please be accurate and return the correct tone.");

        Map<String, Object> message2 = new LinkedHashMap<>();
        message2.put("role", "user");
        message2.put("content", parameters.get("prompt"));

        List<Map<String, Object>> obj = new ArrayList<>();
        obj.add(message1);
        obj.add(message2);
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("model", "gpt-3.5-turbo");
        data.put("messages", obj);
        data.put("temperature", 0.7);
        data.put("top_p", 1);
        return new ObjectMapper().writeValueAsString(data);
    }

    private String adjustContentToneBody(Map<String, String> parameters) throws JsonProcessingException {

        Map<String, Object> message1 = new LinkedHashMap<>();
        message1.put("role", "system");
        message1.put("content", "Please rewrite the following marketing article in " + parameters.get("tone") + " tone. \r\n" +
                "            Make sure the " + parameters.get("tone") + " tone is consistent throughout the article. \r\n" +
                "            The output will be plain text.");

        Map<String, Object> message2 = new LinkedHashMap<>();
        message2.put("role", "user");
        message2.put("content", parameters.get("prompt"));

        List<Map<String, Object>> obj = new ArrayList<>();
        obj.add(message1);
        obj.add(message2);
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("model", "gpt-3.5-turbo");
        data.put("messages", obj);
        data.put("temperature", 0.7);
        data.put("top_p", 1);
        return new ObjectMapper().writeValueAsString(data);
    }
}