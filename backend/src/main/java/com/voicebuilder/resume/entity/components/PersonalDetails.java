package com.voicebuilder.resume.entity.components;

import lombok.Data;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class PersonalDetails {
    private String fullName;
    private String email;
    private String phone;
    private String linkedIn;
    private String githubUrl;
    private String portfolioUrl;
    private String address;
}
