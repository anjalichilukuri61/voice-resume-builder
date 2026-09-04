package com.voicebuilder.resume.service.ai;

import com.voicebuilder.resume.entity.Resume;
import org.springframework.stereotype.Service;

@Service
public class OpenAiService implements AiTranscriptionProvider, AiExtractionProvider {

    @Override
    public String getProviderName() {
        return "OpenAI";
    }

    @Override
    public String transcribeAudio(String filePath) throws Exception {
        throw new UnsupportedOperationException("OpenAI transcription is not yet implemented. Please provide API keys in settings.");
    }

    @Override
    public String extractResumeData(String transcript, Resume existingResume) throws Exception {
        throw new UnsupportedOperationException("OpenAI extraction is not yet implemented. Please provide API keys in settings.");
    }

    @Override
    public String identifyMissingFields(Resume resume) throws Exception {
        throw new UnsupportedOperationException("OpenAI identification is not yet implemented. Please provide API keys in settings.");
    }
}
