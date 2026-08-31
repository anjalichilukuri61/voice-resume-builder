import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import PersonalDetailsForm from '../components/forms/PersonalDetailsForm';
import EducationForm from '../components/forms/EducationForm';
import ExperienceForm from '../components/forms/ExperienceForm';
import SkillsProjectsForm from '../components/forms/SkillsProjectsForm';
import toast from 'react-hot-toast';
import { CheckCircle2, Mic, Square, Loader2 } from 'lucide-react';

const steps = [
  'Personal Details',
  'Education',
  'Experience',
  'Skills & Projects'
];

const ResumeBuilder = () => {
  const { id } = useParams(); // If we are editing an existing resume
  const navigate = useNavigate();
  
  const [currentStep, setCurrentStep] = useState(0);
  const [resumeData, setResumeData] = useState(null);
  const [loading, setLoading] = useState(id ? true : false);

  // Floating Voice Updater State
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const mediaRecorderRef = React.useRef(null);
  const audioChunksRef = React.useRef([]);

  // If there's an ID in the URL, fetch that resume!
  useEffect(() => {
    if (id) {
      const fetchResume = async () => {
        try {
          const response = await api.get(`/resumes/${id}`);
          setResumeData(response.data);
        } catch (error) {
          toast.error("Could not load resume");
          navigate('/dashboard');
        } finally {
          setLoading(false);
        }
      };
      fetchResume();
    }
  }, [id, navigate]);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(curr => curr + 1);
    } else {
      toast.success("Resume finished!");
      navigate(`/templates/${id}`);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(curr => curr - 1);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        await handleVoiceSubmit(audioBlob);
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (error) {
      console.error("Error accessing microphone:", error);
      toast.error("Microphone access denied or unavailable.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      // Stop all audio tracks to turn off the microphone light
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
    }
  };

  const handleVoiceSubmit = async (audioBlob) => {
    if (!id) {
      toast.error("Please save the resume first before using voice updates.");
      return;
    }
    
    setIsProcessing(true);
    const formData = new FormData();
    formData.append('audio', audioBlob, 'update.webm');

    try {
      const response = await api.post(`/voice/orchestrate/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      // Update local state with the newly extracted data
      if (response.data && response.data.resume) {
        setResumeData(response.data.resume);
        toast.success("Details updated successfully!");
      } else {
        toast.error("No updates found in voice.");
      }
    } catch (error) {
      console.error("Voice processing error:", error);
      const errorMsg = error.response?.data || "Failed to process voice update.";
      toast.error(typeof errorMsg === 'string' ? errorMsg : "Failed to process voice update.");
    } finally {
      setIsProcessing(false);
    }
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Loading Resume Data...</div>;

  return (
    <div className="max-w-4xl mx-auto">
      
      {/* Header & Optimize Button */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{resumeData?.title || 'Resume Builder'}</h1>
          <p className="text-gray-500 mt-1">Manually edit your details or let AI optimize them.</p>
        </div>
        
        {id && (
          <button 
            onClick={() => navigate(`/optimize/${id}`)}
            className="flex items-center space-x-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white px-5 py-2.5 rounded-xl font-medium shadow-md shadow-orange-200 transition-all transform hover:scale-105"
          >
            <span className="text-lg">✨</span>
            <span>Optimize with AI</span>
          </button>
        )}
      </div>

      {/* Progress Bar */}
      <div className="mb-8 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex justify-between items-center">
          {steps.map((step, index) => (
            <div key={index} className="flex flex-col items-center">
              <div className={`h-8 w-8 rounded-full flex items-center justify-center font-bold text-sm ${
                index <= currentStep ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-500'
              }`}>
                {index < currentStep ? <CheckCircle2 className="h-5 w-5" /> : index + 1}
              </div>
              <span className={`text-xs mt-2 ${index <= currentStep ? 'text-indigo-600 font-medium' : 'text-gray-400'}`}>
                {step}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Form Wizard */}
      <div className="mt-8">
        {currentStep === 0 && (
          <PersonalDetailsForm 
            resumeData={resumeData} 
            setResumeData={setResumeData} 
            onNext={handleNext} 
          />
        )}
        
        {currentStep === 1 && (
          <EducationForm 
            resumeData={resumeData} 
            setResumeData={setResumeData} 
            onNext={handleNext} 
            onBack={handleBack}
          />
        )}

        {currentStep === 2 && (
          <ExperienceForm 
            resumeData={resumeData} 
            setResumeData={setResumeData} 
            onNext={handleNext} 
            onBack={handleBack}
          />
        )}

        {currentStep === 3 && (
          <SkillsProjectsForm 
            resumeData={resumeData} 
            setResumeData={setResumeData} 
            onNext={handleNext} 
            onBack={handleBack}
          />
        )}
      </div>

      {/* Floating Voice Updater Widget */}
      {id && (
        <div className="fixed bottom-8 right-8 flex flex-col items-end z-50">
          {(isRecording || isProcessing) && (
            <div className="mb-4 bg-white px-4 py-2 rounded-lg shadow-lg border border-gray-100 text-sm font-medium animate-pulse">
              {isRecording ? (
                <span className="text-red-500 flex items-center gap-2">
                  <span className="h-2 w-2 bg-red-500 rounded-full animate-ping"></span>
                  Listening... Click square to stop
                </span>
              ) : (
                <span className="text-indigo-600 flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Processing update...
                </span>
              )}
            </div>
          )}
          
          <button
            onClick={isRecording ? stopRecording : startRecording}
            disabled={isProcessing}
            className={`h-16 w-16 rounded-full flex items-center justify-center shadow-2xl transition-all transform hover:scale-110 focus:outline-none focus:ring-4 focus:ring-opacity-50 ${
              isRecording 
                ? 'bg-red-500 hover:bg-red-600 focus:ring-red-500 shadow-red-200' 
                : isProcessing
                  ? 'bg-gray-400 cursor-not-allowed shadow-gray-200'
                  : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 focus:ring-indigo-500 shadow-indigo-200'
            }`}
          >
            {isRecording ? (
              <Square className="w-6 h-6 text-white" fill="currentColor" />
            ) : isProcessing ? (
              <Loader2 className="w-8 h-8 text-white animate-spin" />
            ) : (
              <Mic className="w-8 h-8 text-white" />
            )}
          </button>
        </div>
      )}
    </div>
  );
};

export default ResumeBuilder;
