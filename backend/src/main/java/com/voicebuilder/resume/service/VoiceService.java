package com.voicebuilder.resume.service;

import com.voicebuilder.resume.entity.VoiceSession;
import com.voicebuilder.resume.repository.VoiceSessionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class VoiceService {

    private final VoiceSessionRepository voiceSessionRepository;
    
    // Directory where we will save the audio files locally
    private final String UPLOAD_DIR = "uploads/audio/";

    public VoiceSession saveAudioFile(MultipartFile file, String userId, String resumeId) throws IOException {
        
        // 1. Ensure the upload directory exists
        Path uploadPath = Paths.get(UPLOAD_DIR);
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }

        // 2. Generate a unique file name so we don't overwrite files with the same name
        String originalFilename = file.getOriginalFilename();
        String fileExtension = originalFilename != null ? originalFilename.substring(originalFilename.lastIndexOf(".")) : ".wav";
        String uniqueFileName = UUID.randomUUID().toString() + fileExtension;
        
        // 3. Save the file locally using absolute path to prevent Tomcat from using its temp directory
        Path filePath = uploadPath.resolve(uniqueFileName).toAbsolutePath();
        file.transferTo(filePath.toFile());

        // 4. Save metadata to MongoDB
        VoiceSession session = new VoiceSession();
        session.setUserId(userId);
        session.setResumeId(resumeId);
        session.setOriginalFileName(originalFilename);
        session.setSavedFilePath(filePath.toAbsolutePath().toString());
        session.setFileSize(file.getSize());
        session.setStatus("UPLOADED_PENDING_TRANSCRIPTION");
        
        return voiceSessionRepository.save(session);
    }
    
    public VoiceSession updateTranscript(String sessionId, String transcript) {
        VoiceSession session = voiceSessionRepository.findById(sessionId)
                .orElseThrow(() -> new RuntimeException("Session not found"));
        session.setTranscribedText(transcript);
        session.setStatus("TRANSCRIPTION_COMPLETED");
        session.setUpdatedAt(java.time.LocalDateTime.now());
        return voiceSessionRepository.save(session);
    }
    
    public void updateStatus(String sessionId, String status) {
        voiceSessionRepository.findById(sessionId).ifPresent(session -> {
            session.setStatus(status);
            session.setUpdatedAt(java.time.LocalDateTime.now());
            voiceSessionRepository.save(session);
        });
    }

    public String getLatestSessionStatus(String resumeId) {
        return voiceSessionRepository.findTopByResumeIdOrderByUpdatedAtDesc(resumeId)
                .map(VoiceSession::getStatus)
                .orElse("NOT_FOUND");
    }
}
