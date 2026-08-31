import React, { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Mic, Square, Loader2, CheckCircle2, Sparkles } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';
import { SkeletonCard } from '../components/ui/SkeletonLoader';

const VoiceStudio = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcript, setTranscript] = useState(null);
  const [resumeId, setResumeId] = useState(id);
  const [useOrchestrator, setUseOrchestrator] = useState(true);

  // MediaRecorder variables
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  // If no ID was provided, create a blank draft resume immediately
  const hasCreatedDraft = useRef(false);
  useEffect(() => {
    if (!resumeId && !hasCreatedDraft.current) {
      hasCreatedDraft.current = true;
      const createBlankDraft = async () => {
        try {
          const res = await api.post('/resumes', { title: 'Voice Draft' });
          setResumeId(res.data.id);
          // Optional: replace url without reloading
          window.history.replaceState(null, '', `/studio/${res.data.id}`);
        } catch (error) {
          toast.error("Failed to initialize voice session");
          hasCreatedDraft.current = false;
        }
      };
      createBlankDraft();
    }
  }, [resumeId]);

  const startRecording = async () => {
    try {
      // 1. Request microphone permission
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // 2. Initialize MediaRecorder
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      // 3. When data is available, push it to our array
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      // 4. When recording stops, handle the upload
      mediaRecorder.onstop = handleUpload;

      // 5. Start recording
      mediaRecorder.start();
      setIsRecording(true);

    } catch (error) {
      toast.error('Microphone access denied or not available.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      // Stop all microphone tracks to turn off the red dot on browser tab
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
    }
  };

  const [aiFeedback, setAiFeedback] = useState(null);

  const handleUpload = async () => {
    setIsProcessing(true);
    setAiFeedback(null);
    try {
      // Create an audio blob from our chunks
      const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
      
      // We must use FormData to send files to Spring Boot
      const formData = new FormData();
      formData.append('audio', audioBlob, 'recording.webm');

      // Phase 6: Switch endpoint based on the orchestrator toggle
      const endpoint = useOrchestrator ? `/voice/orchestrate/${resumeId}` : `/voice/upload/${resumeId}`;
      
      const response = await api.post(endpoint, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      // text response may contain transcribedText (or if not, check the orchestrator response structure)
      // Wait, VoiceSession returns transcribedText. Text Orchestrator returns {resume, aiFeedback}.
      // Since this is handleUpload (audio), the backend returns VoiceSession which has transcribedText and aiFeedback.
      setTranscript(response.data.transcribedText);
      toast.success("AI successfully extracted your details!");
      
      if (response.data.aiFeedback) {
        setAiFeedback(response.data.aiFeedback);
        
        // Use Browser Native Text-to-Speech
        const utterance = new SpeechSynthesisUtterance(response.data.aiFeedback);
        // User requested default voice
        window.speechSynthesis.speak(utterance);
      }
      
    } catch (error) {
      toast.error('Failed to process voice data.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Voice Studio 🎙️</h1>
          <p className="text-gray-500 mt-1">Talk naturally about your experience, and AI will format it.</p>
        </div>
        
        {/* Phase 6: Orchestrator Toggle */}
        <div className="flex items-center space-x-2 bg-indigo-50 px-4 py-2 rounded-lg border border-indigo-100">
          <Sparkles className="h-5 w-5 text-indigo-600" />
          <span className="text-sm font-medium text-indigo-900">AI Orchestrator</span>
          <button 
            onClick={() => setUseOrchestrator(!useOrchestrator)}
            className={`w-11 h-6 rounded-full transition-colors flex items-center ${useOrchestrator ? 'bg-indigo-600' : 'bg-gray-300'}`}
          >
            <div className={`bg-white w-4 h-4 rounded-full shadow-sm transform transition-transform mx-1 ${useOrchestrator ? 'translate-x-5' : 'translate-x-0'}`}></div>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-3xl p-12 shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center">
        
        {/* Pulsing Recording Animation */}
        <div className="relative">
          {isRecording && (
            <>
              <div className="absolute inset-0 bg-red-400 rounded-full animate-ping opacity-75"></div>
              <div className="absolute inset-[-10px] border-4 border-red-200 rounded-full animate-pulse"></div>
            </>
          )}
          
          <button
            onClick={isRecording ? stopRecording : startRecording}
            disabled={isProcessing}
            className={`relative z-10 p-8 rounded-full shadow-lg transition-all transform hover:scale-105 disabled:opacity-50 disabled:hover:scale-100 ${
              isRecording 
                ? 'bg-red-500 hover:bg-red-600 text-white' 
                : 'bg-indigo-600 hover:bg-indigo-700 text-white'
            }`}
          >
            {isRecording ? <Square className="h-12 w-12" /> : <Mic className="h-12 w-12" />}
          </button>
        </div>

        <div className="mt-8">
          <h2 className="text-xl font-bold text-gray-800">
            {isRecording ? 'Listening...' : isProcessing ? 'AI is processing...' : 'Tap to Record'}
          </h2>
          <p className="text-gray-500 mt-2 max-w-md mx-auto">
            {isRecording 
              ? 'Tell me about a recent project you built, or a job you had. When you are done, tap the stop button.' 
              : 'Our AI agents will transcribe, extract, and optimize your resume in one step.'}
          </p>
          
          {!isRecording && !isProcessing && transcript === null && (
            <button 
              onClick={() => setTranscript("")}
              className="mt-6 text-indigo-600 hover:text-indigo-800 text-sm font-medium underline"
            >
              Or manually paste a transcript
            </button>
          )}
        </div>
      </div>

      {/* Phase 6: Skeleton Loading Animation */}
      {isProcessing && (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <h3 className="text-lg font-semibold text-gray-700 flex items-center">
            <Loader2 className="h-5 w-5 animate-spin mr-2 text-indigo-600" />
            AI Orchestrator is running multiple agents...
          </h3>
          <SkeletonCard />
        </div>
      )}

      {/* Transcript Results - Editable AI Response */}
      {transcript !== null && !isProcessing && (
        <div className="space-y-6">
          
          {/* AI Voice Feedback Bubble */}
          {aiFeedback && (
            <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-6 relative animate-in fade-in slide-in-from-left-4">
              <div className="absolute -top-3 -left-3 bg-indigo-600 rounded-full p-2 shadow-sm shadow-indigo-200">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <h3 className="font-bold text-indigo-900 mb-2 pl-4">AI Assistant says:</h3>
              <p className="text-indigo-800 text-lg pl-4 font-medium italic">"{aiFeedback}"</p>
            </div>
          )}

          <div className="bg-emerald-50 rounded-2xl p-6 border border-emerald-100 animate-in fade-in slide-in-from-bottom-4">
            <div className="flex items-center space-x-2 text-emerald-800 font-bold mb-4">
              <CheckCircle2 className="h-6 w-6" />
              <h3>Success! Here is what AI generated:</h3>
            </div>
            
            {/* Phase 6: Editable AI response */}
            <textarea 
              className="w-full text-emerald-900 bg-white p-4 rounded-xl border border-emerald-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 min-h-[120px]"
              value={transcript}
              onChange={(e) => setTranscript(e.target.value)}
            />
            <p className="text-xs text-emerald-600 mt-2">You can edit the raw transcript above before saving.</p>

            <div className="mt-6 flex justify-end space-x-4">
              <button 
                onClick={async () => {
                  const saveToast = toast.loading("Updating AI extraction with your edits...");
                  try {
                    const response = await api.post(`/voice/orchestrate/text/${resumeId}`, {
                      transcript: transcript
                    });
                    
                    if (response.data.aiFeedback) {
                      setAiFeedback(response.data.aiFeedback);
                      const utterance = new SpeechSynthesisUtterance(response.data.aiFeedback);
                      window.speechSynthesis.speak(utterance);
                    } else {
                      setAiFeedback(null);
                    }
                    
                    toast.success("Resume updated with new transcript!", { id: saveToast });
                  } catch (error) {
                    toast.error("Failed to process updated transcript.", { id: saveToast });
                  }
                }}
                className="bg-white text-emerald-700 border border-emerald-200 px-6 py-2 rounded-lg font-medium hover:bg-emerald-50"
              >
                Save Transcript
              </button>
              <button 
                onClick={() => navigate(`/builder/${resumeId}`)}
                className="bg-emerald-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-emerald-700 shadow-sm shadow-emerald-200"
              >
                Review My Resume
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VoiceStudio;
