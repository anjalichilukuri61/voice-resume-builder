package com.voicebuilder.resume.service;

import com.fasterxml.jackson.databind.JsonNode;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class GroqLlamaService {

    private final WebClient webClient;

    @Value("${groq.api.key}")
    private String groqApiKey;

    @Value("${groq.api.llama-url}")
    private String groqApiUrl;

    public GroqLlamaService(WebClient.Builder webClientBuilder) {
        this.webClient = webClientBuilder.build();
    }

    public String extractResumeData(String transcript, com.voicebuilder.resume.entity.Resume currentResume) {
        
        // Convert current resume to JSON string to pass as context
        String currentResumeJson = "{}";
        try {
            com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
            // Need to configure the mapper to handle Java 8 date/time if needed, but we can just serialize basic fields
            mapper.registerModule(new com.fasterxml.jackson.datatype.jsr310.JavaTimeModule());
            currentResumeJson = mapper.writeValueAsString(currentResume);
        } catch (Exception e) {
            System.err.println("Failed to serialize current resume context.");
        }

        // 1. Create the Prompt
        String systemPrompt = "You are an expert AI Resume Builder. " +
                "Extract resume details from the user's transcript and apply them to the CURRENT RESUME JSON. " +
                "CRITICAL INSTRUCTIONS: " +
                "1. For lists (educationList, experienceList, projectList), you MUST output the COMPLETE array. Preserve ALL existing items and fields exactly as they are, and apply the new updates or append new items as needed. " +
                "2. For objects (personalDetails), ONLY output the keys that contain updated information. " +
                "3. If a section is completely unchanged, DO NOT include it in your output JSON. " +
                "4. If the user mentions skills or experiences that strongly indicate a specific job category (e.g., 'Software Engineer', 'Marketing', 'Data Scientist'), update the 'category' field. " +
                "{ \"category\": \"\", \"personalDetails\": { \"fullName\": \"\", \"email\": \"\", \"phone\": \"\", \"linkedIn\": \"\", \"githubUrl\": \"\", \"portfolioUrl\": \"\", \"address\": \"\" }, " +
                "\"skills\": [\"Category Name: Skill 1, Skill 2\"], " +
                "\"certifications\": [\"Name of Certification - Issuing Organization\"], " +
                "\"educationList\": [ { \"degree\": \"\", \"institution\": \"\", \"location\": \"\", \"startDate\": \"\", \"endDate\": \"\", \"gradeOrCgpa\": \"\", \"description\": \"\" } ], " +
                "\"projectList\": [ { \"projectName\": \"\", \"role\": \"\", \"startDate\": \"\", \"endDate\": \"\", \"projectUrl\": \"\", \"technologiesUsed\": [], \"description\": [] } ], " +
                "\"experienceList\": [ { \"jobTitle\": \"\", \"companyName\": \"\", \"location\": \"\", \"startDate\": \"\", \"endDate\": \"\", \"isCurrentJob\": false, \"responsibilities\": [] } ] } " +
                "Do not include any other text, only the JSON. " +
                "\n\nCURRENT RESUME JSON:\n" + currentResumeJson;

        // 2. Build the Request Payload
        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("model", "openai/gpt-oss-120b");
        
        // Setting up the messages array
        List<Map<String, String>> messages = List.of(
                Map.of("role", "system", "content", systemPrompt),
                Map.of("role", "user", "content", transcript)
        );
        requestBody.put("messages", messages);

        // Force JSON Output
        requestBody.put("response_format", Map.of("type", "json_object"));

        // 3. Make the HTTP POST Request
        return callGroqApi(requestBody);
    }

    public String identifyMissingFields(com.voicebuilder.resume.entity.Resume resume) {
        String currentResumeJson = "{}";
        try {
            com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
            mapper.registerModule(new com.fasterxml.jackson.datatype.jsr310.JavaTimeModule());
            currentResumeJson = mapper.writeValueAsString(resume);
        } catch (Exception e) {
            return null;
        }

        String systemPrompt = "You are a friendly voice assistant helping a user build their resume. " +
                "Analyze the provided Resume JSON. Identify if any of the following core fields are entirely missing or empty: " +
                "1. Education\n2. Work Experience (experienceList)\n3. Skills\n4. Projects\n5. Contact Information (Email or Phone).\n" +
                "If ALL of these fields have some data, reply EXACTLY with the word 'COMPLETE'. " +
                "If any are missing, generate a short, friendly, single-sentence question asking the user to provide the missing fields. " +
                "For example: 'I have saved your details, but you are still missing your education and skills, could you tell me about them?'. " +
                "Do NOT use formatting, just plain text.";

        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("model", "openai/gpt-oss-120b");
        
        List<Map<String, String>> messages = List.of(
                Map.of("role", "system", "content", systemPrompt),
                Map.of("role", "user", "content", currentResumeJson)
        );
        requestBody.put("messages", messages);

        String responseText = callGroqApiText(requestBody);
        if (responseText != null && responseText.trim().equalsIgnoreCase("COMPLETE")) {
            return null;
        }
        return responseText;
    }

    private String callGroqApi(Map<String, Object> requestBody) {
        JsonNode response;
        try {
            response = webClient.post()
                    .uri(groqApiUrl)
                    .header(HttpHeaders.AUTHORIZATION, "Bearer " + groqApiKey)
                    .contentType(MediaType.APPLICATION_JSON)
                    .bodyValue(requestBody)
                    .retrieve()
                    .bodyToMono(JsonNode.class)
                    .block();
        } catch (org.springframework.web.reactive.function.client.WebClientResponseException e) {
            throw new RuntimeException("Groq API Error: " + e.getResponseBodyAsString(), e);
        }

        if (response != null && response.has("choices")) {
            String jsonContent = response.get("choices").get(0).get("message").get("content").asText();
            if (jsonContent.startsWith("```json")) jsonContent = jsonContent.substring(7);
            if (jsonContent.startsWith("```")) jsonContent = jsonContent.substring(3);
            if (jsonContent.endsWith("```")) jsonContent = jsonContent.substring(0, jsonContent.length() - 3);
            return jsonContent.trim();
        } else {
            throw new RuntimeException("Failed to extract data from LLaMA response.");
        }
    }

    private String callGroqApiText(Map<String, Object> requestBody) {
        JsonNode response;
        try {
            response = webClient.post()
                    .uri(groqApiUrl)
                    .header(HttpHeaders.AUTHORIZATION, "Bearer " + groqApiKey)
                    .contentType(MediaType.APPLICATION_JSON)
                    .bodyValue(requestBody)
                    .retrieve()
                    .bodyToMono(JsonNode.class)
                    .block();
        } catch (org.springframework.web.reactive.function.client.WebClientResponseException e) {
            System.err.println("Groq API Error: " + e.getResponseBodyAsString());
            return null;
        }

        if (response != null && response.has("choices")) {
            return response.get("choices").get(0).get("message").get("content").asText().trim();
        }
        return null;
    }
}
