package com.voicebuilder.resume.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.voicebuilder.resume.entity.Resume;
import com.voicebuilder.resume.entity.User;
import com.voicebuilder.resume.entity.VoiceSession;
import com.voicebuilder.resume.service.ai.AiExtractionProvider;
import com.voicebuilder.resume.service.ai.AiProviderFactory;
import com.voicebuilder.resume.service.ai.AiTranscriptionProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Service
@RequiredArgsConstructor
public class OrchestratorService {

    private final VoiceService voiceService;
    private final AiProviderFactory aiProviderFactory;
    private final UserService userService;
    private final OptimizerAgentService optimizerAgentService;
    private final ResumeService resumeService;
    private final ObjectMapper objectMapper;

    /**
     * The Master Orchestrator method.
     * Manages the workflow across 3 separate AI Agents and 2 Database services.
     */
    public java.util.Map<String, Object> processAudioToOptimizedResume(MultipartFile file, String userId, String resumeId) throws Exception {
        
        // Lookup User AI Preference
        User user = userService.getUserById(userId).orElseThrow(() -> new RuntimeException("User not found"));
        String providerName = user.getAiProvider();
        
        AiTranscriptionProvider transcriptionProvider = aiProviderFactory.getTranscriptionProvider(providerName);
        AiExtractionProvider extractionProvider = aiProviderFactory.getExtractionProvider(providerName);

        // Step 1: Initialize Session
        VoiceSession session = voiceService.saveAudioFile(file, userId, resumeId);
        
        // Step 2: Agent 1 (Listener) - Whisper Transcription
        voiceService.updateStatus(session.getId(), "TRANSCRIBING");
        String transcript = transcriptionProvider.transcribeAudio(session.getSavedFilePath());
        session = voiceService.updateTranscript(session.getId(), transcript);
        
        // Fetch existing resume to pass as context (for merging)
        Resume existingResume = resumeService.getResumeById(resumeId, userId).orElse(new Resume());

        // Step 3: Agent 2 (Extractor) - LLaMA JSON Extraction (Merging with existing)
        voiceService.updateStatus(session.getId(), "ANALYZING");
        String extractedJson = extractionProvider.extractResumeData(transcript, existingResume);
        System.out.println("EXTRACTED JSON FROM AI (Orchestrator): " + extractedJson);
        Resume extractedResume = objectMapper.readValue(extractedJson, Resume.class);
        
        // Step 4: Save Extracted State FIRST (so we don't lose data if optimizer is lazy)
        voiceService.updateStatus(session.getId(), "UPDATING");
        Resume savedResume = resumeService.updateResume(resumeId, extractedResume, userId);
        
        // Step 6: Identify missing fields for Voice Assistant
        String aiFeedback = extractionProvider.identifyMissingFields(savedResume);
        if (aiFeedback != null) {
            session.setAiFeedback(aiFeedback);
        }
        
        java.util.Map<String, Object> result = new java.util.HashMap<>();
        result.put("session", session);
        result.put("resume", savedResume);
        
        voiceService.updateStatus(session.getId(), "COMPLETED");
        return result;
    }

    public java.util.Map<String, Object> processTextToOptimizedResume(String transcript, String userId, String resumeId) throws Exception {
        
        User user = userService.getUserById(userId).orElseThrow(() -> new RuntimeException("User not found"));
        String providerName = user.getAiProvider();
        AiExtractionProvider extractionProvider = aiProviderFactory.getExtractionProvider(providerName);

        // Fetch existing resume
        Resume existingResume = resumeService.getResumeById(resumeId, userId).orElse(new Resume());

        // Step 1: Agent 2 (Extractor) - LLaMA JSON Extraction (Merging with existing)
        String extractedJson = extractionProvider.extractResumeData(transcript, existingResume);
        Resume extractedResume = objectMapper.readValue(extractedJson, Resume.class);
        
        // Step 2: Save Extracted State FIRST
        Resume savedResume = resumeService.updateResume(resumeId, extractedResume, userId);
        
        // Step 4: Identify missing fields
        String aiFeedback = extractionProvider.identifyMissingFields(savedResume);

        java.util.Map<String, Object> result = new java.util.HashMap<>();
        result.put("resume", savedResume);
        result.put("aiFeedback", aiFeedback);
        return result;
    }
}
