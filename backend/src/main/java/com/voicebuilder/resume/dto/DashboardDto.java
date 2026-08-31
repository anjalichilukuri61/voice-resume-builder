package com.voicebuilder.resume.dto;

import com.voicebuilder.resume.entity.Resume;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class DashboardDto {
    private long totalResumes;
    private long totalVoiceSessions;
    private List<Resume> recentResumes;
}
