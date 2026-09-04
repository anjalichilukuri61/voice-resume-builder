package com.voicebuilder.resume.service;

import com.fasterxml.jackson.databind.JsonNode;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.FileSystemResource;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.client.MultipartBodyBuilder;
import org.springframework.stereotype.Service;
import org.springframework.util.MultiValueMap;
import org.springframework.web.reactive.function.BodyInserters;
import org.springframework.web.reactive.function.client.WebClient;

import com.voicebuilder.resume.service.ai.AiTranscriptionProvider;

import java.io.File;

@Service
public class GroqWhisperService implements AiTranscriptionProvider {

    @Override
    public String getProviderName() {
        return "Groq";
    }

    private final WebClient webClient;
    
    @Value("${groq.api.key}")
    private String groqApiKey;
    
    @Value("${groq.api.whisper-url}")
    private String groqApiUrl;

    public GroqWhisperService(WebClient.Builder webClientBuilder) {
        this.webClient = webClientBuilder.build();
    }

    public String transcribeAudio(String filePath) {
        File audioFile = new File(filePath);
        if (!audioFile.exists()) {
            throw new RuntimeException("Audio file not found at: " + filePath);
        }

        // 1. Build the Multipart Form Data required by Groq API
        MultipartBodyBuilder bodyBuilder = new MultipartBodyBuilder();
        bodyBuilder.part("file", new FileSystemResource(audioFile));
        bodyBuilder.part("model", "whisper-large-v3");

        MultiValueMap<String, HttpEntity<?>> multipartBody = bodyBuilder.build();

        // 2. Make the HTTP POST Request to Groq using WebClient
        JsonNode response = webClient.post()
                .uri(groqApiUrl)
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + groqApiKey)
                .header(HttpHeaders.CONNECTION, "close")
                .contentType(MediaType.MULTIPART_FORM_DATA)
                .body(BodyInserters.fromMultipartData(multipartBody))
                .retrieve()
                .bodyToMono(JsonNode.class)
                .retryWhen(reactor.util.retry.Retry.backoff(3, java.time.Duration.ofSeconds(2)))
                .block(); // .block() makes it synchronous. We will wait for the result.

        // 3. Extract and return the transcribed text
        if (response != null && response.has("text")) {
            return response.get("text").asText();
        } else {
            throw new RuntimeException("Failed to extract transcription from Groq response.");
        }
    }
}
