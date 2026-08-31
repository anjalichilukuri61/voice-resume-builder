package com.voicebuilder.resume.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.voicebuilder.resume.entity.Resume;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class OptimizerAgentService {

    private final WebClient webClient;
    private final ObjectMapper objectMapper;

    @Value("${groq.api.key}")
    private String groqApiKey;

    @Value("${groq.api.llama-url}")
    private String groqApiUrl;

    public OptimizerAgentService(WebClient.Builder webClientBuilder, ObjectMapper objectMapper) {
        this.webClient = webClientBuilder.build();
        this.objectMapper = objectMapper;
    }

    public Resume optimizeResume(Resume resume) {
        String systemPrompt = "You are an expert Resume Writer and ATS Optimizer. " +
                "I will provide a JSON representation of a resume. " +
                "Your job is to rewrite the 'responsibilities' in Experience and 'description' in ProjectDetails " +
                "to be highly professional, impactful, and ATS-friendly bullet points starting with strong action verbs. " +
                "Do NOT hallucinate or invent new facts, just improve the grammar and impact of the existing facts. " +
                "Return the ENTIRE updated Resume strictly as a JSON object.";

        try {
            String resumeJson = objectMapper.writeValueAsString(resume);

            Map<String, Object> requestBody = new HashMap<>();
            // Using the new model for rewriting!
            requestBody.put("model", "openai/gpt-oss-120b");
            requestBody.put("messages", List.of(
                    Map.of("role", "system", "content", systemPrompt),
                    Map.of("role", "user", "content", resumeJson)
            ));
            requestBody.put("response_format", Map.of("type", "json_object"));

            JsonNode response = webClient.post()
                    .uri(groqApiUrl)
                    .header(HttpHeaders.AUTHORIZATION, "Bearer " + groqApiKey)
                    .contentType(MediaType.APPLICATION_JSON)
                    .bodyValue(requestBody)
                    .retrieve()
                    .bodyToMono(JsonNode.class)
                    .block();

            if (response != null && response.has("choices")) {
                String optimizedJson = response.get("choices").get(0).get("message").get("content").asText();
                // Remove markdown code blocks if the AI accidentally adds them
                if (optimizedJson.startsWith("```json")) {
                    optimizedJson = optimizedJson.substring(7);
                }
                if (optimizedJson.startsWith("```")) {
                    optimizedJson = optimizedJson.substring(3);
                }
                if (optimizedJson.endsWith("```")) {
                    optimizedJson = optimizedJson.substring(0, optimizedJson.length() - 3);
                }
                optimizedJson = optimizedJson.trim();
                return objectMapper.readValue(optimizedJson, Resume.class);
            }
            throw new RuntimeException("Failed to optimize resume with AI.");

        } catch (Exception e) {
            e.printStackTrace();
            throw new RuntimeException("Optimization Failed: " + e.getMessage());
        }
    }
}
