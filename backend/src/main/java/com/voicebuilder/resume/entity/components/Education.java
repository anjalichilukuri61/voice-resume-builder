package com.voicebuilder.resume.entity.components;

import lombok.Data;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class Education {
    private String degree;
    private String institution;
    private String location;
    private String startDate;
    private String endDate;
    private String gradeOrCgpa;
    private String description;
}
