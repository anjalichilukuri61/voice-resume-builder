import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Sparkles, ArrowLeft, Loader2, CheckCircle2 } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';
import { SkeletonCard } from '../components/ui/SkeletonLoader';

const ResumeOptimizer = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [originalResume, setOriginalResume] = useState(null);
  const [optimizedResume, setOptimizedResume] = useState(null);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResume = async () => {
      try {
        const response = await api.get(`/resumes/${id}`);
        setOriginalResume(response.data);
      } catch (error) {
        toast.error("Failed to load resume");
        navigate('/resumes');
      } finally {
        setLoading(false);
      }
    };
    fetchResume();
  }, [id, navigate]);

  const handleOptimize = async () => {
    setIsOptimizing(true);
    setOptimizedResume(null); // Clear previous if any
    
    try {
      const response = await api.post(`/resumes/${id}/optimize`);
      setOptimizedResume(response.data);
      toast.success("Resume successfully optimized!");
    } catch (error) {
      toast.error("Failed to optimize resume");
    } finally {
      setIsOptimizing(false);
    }
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Loading Optimizer...</div>;

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
      
      {/* Header */}
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex items-center space-x-4">
          <button 
            onClick={() => navigate(`/builder/${id}`)}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ArrowLeft className="h-6 w-6 text-gray-500" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">ATS Optimizer</h1>
            <p className="text-gray-500 text-sm">Transform your experience into impactful, action-driven bullet points.</p>
          </div>
        </div>
        
        {!optimizedResume && (
          <button 
            onClick={handleOptimize}
            disabled={isOptimizing}
            className="flex items-center space-x-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white px-6 py-2.5 rounded-xl font-medium shadow-md shadow-orange-200 transition-all disabled:opacity-50"
          >
            {isOptimizing ? <Loader2 className="h-5 w-5 animate-spin" /> : <Sparkles className="h-5 w-5" />}
            <span>{isOptimizing ? 'Optimizing...' : 'Run Optimizer'}</span>
          </button>
        )}
      </div>

      {/* Split Screen Comparison */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Left Side: Original */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-gray-700 flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-gray-400"></span>
            <span>Original Version</span>
          </h2>
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 min-h-[400px]">
            {originalResume?.experienceList?.length > 0 ? (
              <div className="space-y-6">
                {originalResume.experienceList.map((exp, idx) => (
                  <div key={idx} className="border-b border-gray-50 pb-4 last:border-0">
                    <h3 className="font-bold text-gray-800">{exp.jobTitle} @ {exp.companyName}</h3>
                    <ul className="list-disc pl-5 mt-2 space-y-1">
                      {exp.responsibilities?.map((resp, i) => (
                        <li key={i} className="text-sm text-gray-600">{resp}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-sm italic text-center mt-12">No experience data found.</p>
            )}
          </div>
        </div>

        {/* Right Side: Optimized */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-orange-500 flex items-center space-x-2">
            <Sparkles className="h-5 w-5 text-amber-500" />
            <span>AI Optimized Version</span>
          </h2>
          
          {isOptimizing ? (
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-orange-100 min-h-[400px]">
              <div className="flex flex-col items-center justify-center h-full space-y-4 text-center mt-12">
                <Loader2 className="h-10 w-10 text-orange-500 animate-spin" />
                <p className="text-orange-600 font-medium">Rewriting your experience for maximum impact...</p>
                <div className="w-full max-w-sm mt-8">
                  <SkeletonCard />
                </div>
              </div>
            </div>
          ) : optimizedResume ? (
            <div className="bg-orange-50 rounded-3xl p-8 shadow-sm border border-orange-200 min-h-[400px] relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4">
                <div className="bg-white text-orange-600 text-xs font-bold px-3 py-1 rounded-full shadow-sm flex items-center space-x-1">
                  <CheckCircle2 className="h-3 w-3" /> <span>ATS Friendly</span>
                </div>
              </div>
              
              <div className="space-y-6 relative z-10">
                {optimizedResume.experienceList?.map((exp, idx) => (
                  <div key={idx} className="border-b border-orange-200/50 pb-4 last:border-0">
                    <h3 className="font-bold text-gray-900">{exp.jobTitle} @ {exp.companyName}</h3>
                    <ul className="list-disc pl-5 mt-2 space-y-2">
                      {exp.responsibilities?.map((resp, i) => (
                        <li key={i} className="text-sm text-gray-800 leading-relaxed"><span className="text-orange-600 font-medium">{resp.split(' ')[0]}</span> {resp.substring(resp.indexOf(' ') + 1)}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          ) : (
             <div className="bg-gray-50 rounded-3xl p-8 shadow-sm border border-dashed border-gray-200 min-h-[400px] flex items-center justify-center text-center">
              <div>
                <Sparkles className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">Click <strong>Run Optimizer</strong> to see the AI magic.</p>
              </div>
            </div>
          )}
        </div>
      </div>
      
    </div>
  );
};

export default ResumeOptimizer;
