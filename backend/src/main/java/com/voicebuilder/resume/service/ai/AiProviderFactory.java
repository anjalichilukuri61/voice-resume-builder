package com.voicebuilder.resume.service.ai;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class AiProviderFactory {

    private final Map<String, AiTranscriptionProvider> transcriptionProviders;
    private final Map<String, AiExtractionProvider> extractionProviders;

    @Autowired
    public AiProviderFactory(List<AiTranscriptionProvider> tProviders, List<AiExtractionProvider> eProviders) {
        this.transcriptionProviders = tProviders.stream()
                .collect(Collectors.toMap(AiTranscriptionProvider::getProviderName, provider -> provider));
        
        this.extractionProviders = eProviders.stream()
                .collect(Collectors.toMap(AiExtractionProvider::getProviderName, provider -> provider));
    }

    public AiTranscriptionProvider getTranscriptionProvider(String providerName) {
        AiTranscriptionProvider provider = transcriptionProviders.get(providerName);
        if (provider == null) {
            // Fallback to Groq if the provider isn't found
            return transcriptionProviders.get("Groq");
        }
        return provider;
    }

    public AiExtractionProvider getExtractionProvider(String providerName) {
        AiExtractionProvider provider = extractionProviders.get(providerName);
        if (provider == null) {
            // Fallback to Groq if the provider isn't found
            return extractionProviders.get("Groq");
        }
        return provider;
    }
}
