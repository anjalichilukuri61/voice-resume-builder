package com.voicebuilder.resume.service;

import com.voicebuilder.resume.entity.Resume;
import com.voicebuilder.resume.repository.ResumeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class ResumeService {

    private final ResumeRepository resumeRepository;

    public Resume createResume(Resume resume, String userId) {
        resume.setUserId(userId);
        resume.setCreatedAt(LocalDateTime.now());
        resume.setUpdatedAt(LocalDateTime.now());
        return resumeRepository.save(resume);
    }

    public List<Resume> getAllResumesForUser(String userId) {
        return resumeRepository.findByUserId(userId);
    }

    public Optional<Resume> getResumeById(String id, String userId) {
        // Find the resume, but ALSO make sure it belongs to the logged-in user
        Optional<Resume> resume = resumeRepository.findById(id);
        if (resume.isPresent() && resume.get().getUserId().equals(userId)) {
            return resume;
        }
        return Optional.empty(); // Return empty if not found OR belongs to someone else
    }

    public Resume updateResume(String id, Resume updatedResume, String userId) {
        return getResumeById(id, userId).map(existingResume -> {
            // Update fields only if they are not null
            if (updatedResume.getTitle() != null) existingResume.setTitle(updatedResume.getTitle());
            if (updatedResume.getCategory() != null) existingResume.setCategory(updatedResume.getCategory());
            if (updatedResume.getPersonalDetails() != null) {
                if (existingResume.getPersonalDetails() == null) {
                    existingResume.setPersonalDetails(updatedResume.getPersonalDetails());
                } else {
                    com.voicebuilder.resume.entity.components.PersonalDetails u = updatedResume.getPersonalDetails();
                    com.voicebuilder.resume.entity.components.PersonalDetails e = existingResume.getPersonalDetails();
                    if (u.getFullName() != null && !u.getFullName().isEmpty()) e.setFullName(u.getFullName());
                    if (u.getEmail() != null && !u.getEmail().isEmpty()) e.setEmail(u.getEmail());
                    if (u.getPhone() != null && !u.getPhone().isEmpty()) e.setPhone(u.getPhone());
                    if (u.getLinkedIn() != null && !u.getLinkedIn().isEmpty()) e.setLinkedIn(u.getLinkedIn());
                    if (u.getGithubUrl() != null && !u.getGithubUrl().isEmpty()) e.setGithubUrl(u.getGithubUrl());
                    if (u.getPortfolioUrl() != null && !u.getPortfolioUrl().isEmpty()) e.setPortfolioUrl(u.getPortfolioUrl());
                    if (u.getAddress() != null && !u.getAddress().isEmpty()) e.setAddress(u.getAddress());
                }
            }
            if (updatedResume.getSummary() != null) existingResume.setSummary(updatedResume.getSummary());
            if (updatedResume.getEducationList() != null) {
                if (existingResume.getEducationList() == null || existingResume.getEducationList().isEmpty()) {
                    existingResume.setEducationList(updatedResume.getEducationList());
                } else {
                    for (int i = 0; i < updatedResume.getEducationList().size(); i++) {
                        if (i < existingResume.getEducationList().size()) {
                            com.voicebuilder.resume.entity.components.Education u = updatedResume.getEducationList().get(i);
                            com.voicebuilder.resume.entity.components.Education e = existingResume.getEducationList().get(i);
                            if (u.getDegree() != null && !u.getDegree().isEmpty()) e.setDegree(u.getDegree());
                            if (u.getInstitution() != null && !u.getInstitution().isEmpty()) e.setInstitution(u.getInstitution());
                            if (u.getLocation() != null && !u.getLocation().isEmpty()) e.setLocation(u.getLocation());
                            if (u.getStartDate() != null && !u.getStartDate().isEmpty()) e.setStartDate(u.getStartDate());
                            if (u.getEndDate() != null && !u.getEndDate().isEmpty()) e.setEndDate(u.getEndDate());
                            if (u.getGradeOrCgpa() != null && !u.getGradeOrCgpa().isEmpty()) e.setGradeOrCgpa(u.getGradeOrCgpa());
                            if (u.getDescription() != null && !u.getDescription().isEmpty()) e.setDescription(u.getDescription());
                        } else {
                            existingResume.getEducationList().add(updatedResume.getEducationList().get(i));
                        }
                    }
                }
            }
            if (updatedResume.getExperienceList() != null) {
                if (existingResume.getExperienceList() == null || existingResume.getExperienceList().isEmpty()) {
                    existingResume.setExperienceList(updatedResume.getExperienceList());
                } else {
                    for (int i = 0; i < updatedResume.getExperienceList().size(); i++) {
                        if (i < existingResume.getExperienceList().size()) {
                            com.voicebuilder.resume.entity.components.Experience u = updatedResume.getExperienceList().get(i);
                            com.voicebuilder.resume.entity.components.Experience e = existingResume.getExperienceList().get(i);
                            if (u.getJobTitle() != null && !u.getJobTitle().isEmpty()) e.setJobTitle(u.getJobTitle());
                            if (u.getCompanyName() != null && !u.getCompanyName().isEmpty()) e.setCompanyName(u.getCompanyName());
                            if (u.getLocation() != null && !u.getLocation().isEmpty()) e.setLocation(u.getLocation());
                            if (u.getStartDate() != null && !u.getStartDate().isEmpty()) e.setStartDate(u.getStartDate());
                            if (u.getEndDate() != null && !u.getEndDate().isEmpty()) e.setEndDate(u.getEndDate());
                            if (u.getIsCurrentJob() != null) e.setIsCurrentJob(u.getIsCurrentJob());
                            if (u.getResponsibilities() != null && !u.getResponsibilities().isEmpty()) e.setResponsibilities(u.getResponsibilities());
                        } else {
                            existingResume.getExperienceList().add(updatedResume.getExperienceList().get(i));
                        }
                    }
                }
            }
            if (updatedResume.getProjectList() != null) {
                if (existingResume.getProjectList() == null || existingResume.getProjectList().isEmpty()) {
                    existingResume.setProjectList(updatedResume.getProjectList());
                } else {
                    for (int i = 0; i < updatedResume.getProjectList().size(); i++) {
                        if (i < existingResume.getProjectList().size()) {
                            com.voicebuilder.resume.entity.components.ProjectDetails u = updatedResume.getProjectList().get(i);
                            com.voicebuilder.resume.entity.components.ProjectDetails e = existingResume.getProjectList().get(i);
                            if (u.getProjectName() != null && !u.getProjectName().isEmpty()) e.setProjectName(u.getProjectName());
                            if (u.getRole() != null && !u.getRole().isEmpty()) e.setRole(u.getRole());
                            if (u.getStartDate() != null && !u.getStartDate().isEmpty()) e.setStartDate(u.getStartDate());
                            if (u.getEndDate() != null && !u.getEndDate().isEmpty()) e.setEndDate(u.getEndDate());
                            if (u.getProjectUrl() != null && !u.getProjectUrl().isEmpty()) e.setProjectUrl(u.getProjectUrl());
                            if (u.getTechnologiesUsed() != null && !u.getTechnologiesUsed().isEmpty()) e.setTechnologiesUsed(u.getTechnologiesUsed());
                            if (u.getDescription() != null && !u.getDescription().isEmpty()) e.setDescription(u.getDescription());
                        } else {
                            existingResume.getProjectList().add(updatedResume.getProjectList().get(i));
                        }
                    }
                }
            }
            if (updatedResume.getSkills() != null) existingResume.setSkills(updatedResume.getSkills());
            if (updatedResume.getCertifications() != null) existingResume.setCertifications(updatedResume.getCertifications());
            if (updatedResume.getLanguages() != null) existingResume.setLanguages(updatedResume.getLanguages());
            
            existingResume.setUpdatedAt(LocalDateTime.now());
            return resumeRepository.save(existingResume);
        }).orElseThrow(() -> new RuntimeException("Resume not found or unauthorized"));
    }

    public void deleteResume(String id, String userId) {
        Optional<Resume> resume = getResumeById(id, userId);
        resume.ifPresent(resumeRepository::delete);
    }
}
