package com.voicebuilder.resume.repository;

import com.voicebuilder.resume.entity.VoiceSession;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface VoiceSessionRepository extends MongoRepository<VoiceSession, String> {
    List<VoiceSession> findByUserId(String userId);
    Optional<VoiceSession> findByIdAndUserId(String id, String userId);
    
    // Phase 10: Dashboard queries
    long countByUserId(String userId);
}
