package com.voicebuilder.resume.controller;

import com.voicebuilder.resume.entity.User;
import com.voicebuilder.resume.entity.VoiceSession;
import com.voicebuilder.resume.repository.UserRepository;
import com.voicebuilder.resume.service.GroqWhisperService;
import com.voicebuilder.resume.service.GroqLlamaService;
import com.voicebuilder.resume.service.VoiceService;
import com.voicebuilder.resume.service.ResumeService;
import com.voicebuilder.resume.service.OrchestratorService;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Optional;

@RestController
@RequestMapping("/api/voice")
@RequiredArgsConstructor
public class VoiceController {

    private final VoiceService voiceService;
    private final UserRepository userRepository;
    private final GroqWhisperService groqWhisperService;
    private final GroqLlamaService groqLlamaService;
    private final ResumeService resumeService;
    private final OrchestratorService orchestratorService;
    private final ObjectMapper objectMapper;

    private String getLoggedInUserId(Authentication authentication) {
        String email = authentication.getName();
        Optional<User> user = userRepository.findByEmail(email);
        return user.map(User::getId).orElseThrow(() -> new RuntimeException("User not found"));
    }

    @PostMapping("/upload/{resumeId}")
    public ResponseEntity<?> uploadAudio(
            @PathVariable String resumeId,
            @RequestParam("audio") MultipartFile file,
            Authentication authentication) {
            
        try {
            String userId = getLoggedInUserId(authentication);
            
            if (file.isEmpty()) {
                return ResponseEntity.badRequest().body("Please upload a valid audio file.");
            }

            // 1. Save the audio file locally and update status to Pending
            VoiceSession session = voiceService.saveAudioFile(file, userId, resumeId);
            
            // 2. Call Groq Whisper API (Synchronously for now, can be async later)
            String transcript = groqWhisperService.transcribeAudio(session.getSavedFilePath());
            
            // 3. Update the session with the transcript
            session = voiceService.updateTranscript(session.getId(), transcript);
            
            // Fetch existing resume
            com.voicebuilder.resume.entity.Resume existingResume = resumeService.getResumeById(resumeId, userId).orElse(new com.voicebuilder.resume.entity.Resume());

            // 4. Send the transcript to LLaMA 3 to extract JSON data
            String extractedJson = groqLlamaService.extractResumeData(transcript, existingResume);
            System.out.println("EXTRACTED JSON FROM LLAMA: " + extractedJson);
            
            // 5. Parse the JSON and update the Resume!
            com.voicebuilder.resume.entity.Resume extractedResume = objectMapper.readValue(extractedJson, com.voicebuilder.resume.entity.Resume.class);
            resumeService.updateResume(resumeId, extractedResume, userId);
            
            return ResponseEntity.status(HttpStatus.CREATED).body(session);
            
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to process audio: " + e.getMessage());
        }
    }

    // Phase 8: Multi-Agent Orchestrator
    @PostMapping("/orchestrate/{resumeId}")
    public ResponseEntity<?> orchestrateResume(
            @PathVariable String resumeId,
            @RequestParam("audio") MultipartFile file,
            Authentication authentication) {
            
        try {
            String userId = getLoggedInUserId(authentication);
            
            if (file.isEmpty()) {
                return ResponseEntity.badRequest().body("Please upload a valid audio file.");
            }

            // The Master Orchestrator takes over!
            java.util.Map<String, Object> result = orchestratorService.processAudioToOptimizedResume(file, userId, resumeId);
            
            return ResponseEntity.status(HttpStatus.CREATED).body(result);
            
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Orchestration Failed: " + e.getMessage());
        }
    }

    @PostMapping("/orchestrate/text/{resumeId}")
    public ResponseEntity<?> orchestrateResumeFromText(
            @PathVariable String resumeId,
            @RequestBody java.util.Map<String, String> body,
            Authentication authentication) {
            
        try {
            String userId = getLoggedInUserId(authentication);
            String transcript = body.get("transcript");
            
            if (transcript == null || transcript.isEmpty()) {
                return ResponseEntity.badRequest().body("Transcript is required.");
            }

            // The Master Orchestrator takes over from text!
            java.util.Map<String, Object> result = orchestratorService.processTextToOptimizedResume(transcript, userId, resumeId);
            
            return ResponseEntity.ok(result);
            
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Text Orchestration Failed: " + e.getMessage());
        }
    }
}
