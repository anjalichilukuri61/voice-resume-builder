package com.voicebuilder.resume.entity.components;

import lombok.Data;
import java.util.List;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class Experience {
    private String jobTitle;
    private String companyName;
    private String location;
    private String startDate;
    private String endDate;
    private Boolean isCurrentJob;
    private List<String> responsibilities;
}
