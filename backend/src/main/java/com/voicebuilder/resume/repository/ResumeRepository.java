package com.voicebuilder.resume.repository;

import com.voicebuilder.resume.entity.Resume;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ResumeRepository extends MongoRepository<Resume, String> {
    
    // Custom method generated automatically by Spring Data MongoDB!
    // It will find all resumes where the 'userId' field matches the parameter.
    List<Resume> findByUserId(String userId);

    Optional<Resume> findByIdAndUserId(String id, String userId);
    
    // Phase 10: Dashboard queries
    long countByUserId(String userId);
    List<Resume> findTop3ByUserIdOrderByUpdatedAtDesc(String userId);
}
