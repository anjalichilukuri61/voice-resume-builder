package com.voicebuilder.resume.controller;

import com.voicebuilder.resume.dto.DashboardDto;
import com.voicebuilder.resume.entity.Resume;
import com.voicebuilder.resume.entity.User;
import com.voicebuilder.resume.repository.ResumeRepository;
import com.voicebuilder.resume.repository.UserRepository;
import com.voicebuilder.resume.repository.VoiceSessionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final ResumeRepository resumeRepository;
    private final VoiceSessionRepository voiceSessionRepository;
    private final UserRepository userRepository;

    private String getLoggedInUserId(Authentication authentication) {
        String email = authentication.getName();
        Optional<User> user = userRepository.findByEmail(email);
        return user.map(User::getId).orElseThrow(() -> new RuntimeException("User not found"));
    }

    @GetMapping
    public ResponseEntity<DashboardDto> getDashboardStats(Authentication authentication) {
        String userId = getLoggedInUserId(authentication);

        long totalResumes = resumeRepository.countByUserId(userId);
        long totalVoiceSessions = voiceSessionRepository.countByUserId(userId);
        List<Resume> recentResumes = resumeRepository.findTop3ByUserIdOrderByUpdatedAtDesc(userId);

        DashboardDto dashboardDto = new DashboardDto(totalResumes, totalVoiceSessions, recentResumes);

        return ResponseEntity.ok(dashboardDto);
    }
}
