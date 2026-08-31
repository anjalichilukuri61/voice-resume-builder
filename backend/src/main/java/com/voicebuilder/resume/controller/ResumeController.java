package com.voicebuilder.resume.controller;

import com.voicebuilder.resume.entity.Resume;
import com.voicebuilder.resume.entity.User;
import com.voicebuilder.resume.repository.UserRepository;
import com.voicebuilder.resume.service.ResumeService;
import com.voicebuilder.resume.service.OptimizerAgentService;
import com.voicebuilder.resume.service.PdfService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/resumes")
@RequiredArgsConstructor
public class ResumeController {

    private final ResumeService resumeService;
    private final OptimizerAgentService optimizerAgentService;
    private final PdfService pdfService;
    private final UserRepository userRepository;

    // Helper method to get the logged-in user's ID from the JWT Authentication token
    private String getLoggedInUserId(Authentication authentication) {
        String email = authentication.getName(); // The subject of our JWT is the email
        Optional<User> user = userRepository.findByEmail(email);
        return user.map(User::getId).orElseThrow(() -> new RuntimeException("User not found"));
    }

    @PostMapping
    public ResponseEntity<Resume> createResume(@RequestBody Resume resume, Authentication authentication) {
        String userId = getLoggedInUserId(authentication);
        Resume savedResume = resumeService.createResume(resume, userId);
        return ResponseEntity.status(HttpStatus.CREATED).body(savedResume);
    }

    @GetMapping
    public ResponseEntity<List<Resume>> getAllMyResumes(Authentication authentication) {
        String userId = getLoggedInUserId(authentication);
        return ResponseEntity.ok(resumeService.getAllResumesForUser(userId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Resume> getResumeById(@PathVariable String id, Authentication authentication) {
        String userId = getLoggedInUserId(authentication);
        return resumeService.getResumeById(id, userId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<Resume> updateResume(@PathVariable String id, @RequestBody Resume resume, Authentication authentication) {
        String userId = getLoggedInUserId(authentication);
        try {
            Resume updatedResume = resumeService.updateResume(id, resume, userId);
            return ResponseEntity.ok(updatedResume);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteResume(@PathVariable String id, Authentication authentication) {
        String userId = getLoggedInUserId(authentication);
        resumeService.deleteResume(id, userId);
        return ResponseEntity.noContent().build(); // 204 No Content
    }

    // Phase 7: AI Resume Optimizer
    @PostMapping("/{id}/optimize")
    public ResponseEntity<?> optimizeResume(@PathVariable String id, Authentication authentication) {
        String userId = getLoggedInUserId(authentication);
        Optional<Resume> existingResume = resumeService.getResumeById(id, userId);

        if (existingResume.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Resume not found or unauthorized");
        }

        try {
            // Send to AI for optimization
            Resume optimizedResume = optimizerAgentService.optimizeResume(existingResume.get());
            // Save the optimized resume back to the database
            Resume savedResume = resumeService.updateResume(id, optimizedResume, userId);
            return ResponseEntity.ok(savedResume);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to optimize resume: " + e.getMessage());
        }
    }

    // Phase 9: Export to PDF
    @GetMapping(value = "/{id}/pdf", produces = org.springframework.http.MediaType.APPLICATION_PDF_VALUE)
    public ResponseEntity<byte[]> downloadPdf(@PathVariable String id, @RequestParam(defaultValue = "classic") String template, Authentication authentication) {
        String userId = getLoggedInUserId(authentication);
        Optional<Resume> existingResume = resumeService.getResumeById(id, userId);

        if (existingResume.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
        }

        try {
            byte[] pdfBytes = pdfService.generatePdf(existingResume.get(), template);
            
            HttpHeaders headers = new HttpHeaders();
            headers.add(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=resume.pdf");

            return new ResponseEntity<>(pdfBytes, headers, HttpStatus.OK);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }
}
