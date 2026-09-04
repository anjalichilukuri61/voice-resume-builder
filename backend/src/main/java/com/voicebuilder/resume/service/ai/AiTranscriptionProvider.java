package com.voicebuilder.resume.service.ai;

public interface AiTranscriptionProvider {
    /**
     * Returns the name of the AI Provider (e.g. "Groq", "OpenAI", "Gemini")
     */
    String getProviderName();

    /**
     * Transcribes an audio file into text.
     */
    String transcribeAudio(String filePath) throws Exception;
}
