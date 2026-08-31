package com.voicebuilder.resume.entity;

import com.voicebuilder.resume.entity.components.Education;
import com.voicebuilder.resume.entity.components.Experience;
import com.voicebuilder.resume.entity.components.PersonalDetails;
import com.voicebuilder.resume.entity.components.ProjectDetails;
import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Document(collection = "resumes")
@JsonIgnoreProperties(ignoreUnknown = true)
public class Resume {

    @Id
    private String id;
    
    private String userId; // Link to User
    
    private String title = "Untitled Resume";
    private String category = "General"; // Used for auto-categorization by AI
    
    private PersonalDetails personalDetails;
    private String summary;
    
    private List<Education> educationList;
    private List<Experience> experienceList;
    private List<ProjectDetails> projectList;
    
    private List<String> skills;
    private List<String> certifications;
    private List<String> languages;
    
    private LocalDateTime createdAt = LocalDateTime.now();
    private LocalDateTime updatedAt = LocalDateTime.now();
}
