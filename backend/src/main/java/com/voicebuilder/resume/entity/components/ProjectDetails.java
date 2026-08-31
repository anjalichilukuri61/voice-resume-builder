package com.voicebuilder.resume.entity.components;

import lombok.Data;
import java.util.List;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class ProjectDetails {
    private String projectName;
    private String role;
    private String startDate;
    private String endDate;
    private String projectUrl;
    private List<String> description;
    private List<String> technologiesUsed;
}
