package com.voicebuilder.resume.service.ai;

import com.voicebuilder.resume.entity.Resume;

public interface AiExtractionProvider {
    /**
     * Returns the name of the AI Provider (e.g. "Groq", "OpenAI", "Gemini")
     */
    String getProviderName();

    /**
     * Extracts structured resume JSON from an unstructured text transcript.
     * Merges it with the existing resume data if provided.
     */
    String extractResumeData(String transcript, Resume existingResume) throws Exception;

    /**
     * Analyzes a resume and returns a friendly string identifying missing or weak fields.
     */
    String identifyMissingFields(Resume resume) throws Exception;
}
