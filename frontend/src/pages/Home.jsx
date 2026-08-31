import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Mic, FileText, CheckCircle2 } from 'lucide-react';
import api from '../services/api';

const Home = () => {
  const [backendStatus, setBackendStatus] = useState('Checking...');

  useEffect(() => {
    const checkHealth = async () => {
      try {
        const response = await api.get('/health');
        setBackendStatus(response.data.message || 'Connected');
      } catch (error) {
        setBackendStatus('Offline');
      }
    };
    checkHealth();
  }, []);

  return (
    <div className="flex-grow bg-slate-50">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16 text-center">
        <h1 className="text-5xl font-extrabold text-gray-900 tracking-tight mb-6">
          Build your resume with <span className="text-indigo-600">just your voice</span>
        </h1>
        <p className="text-xl text-gray-500 mb-10 max-w-2xl mx-auto">
          Talk about your experience, skills, and projects naturally. Our AI extracts the details, optimizes them for ATS, and generates a stunning PDF in seconds.
        </p>
        <div className="flex justify-center space-x-4">
          <Link to="/register" className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-full font-semibold text-lg transition-all shadow-lg shadow-indigo-200">
            Start Building Free
          </Link>
        </div>
      </div>

      {/* Backend Status Indicator */}
      <div className="max-w-7xl mx-auto px-4 mb-16 text-center">
        <div className="inline-flex items-center space-x-2 bg-white px-4 py-2 rounded-full shadow-sm border border-gray-100">
          <div className={`h-2.5 w-2.5 rounded-full ${backendStatus === 'Voice Resume Builder Backend is running smoothly!' ? 'bg-emerald-500' : 'bg-red-500'}`}></div>
          <span className="text-sm font-medium text-gray-600">
            Backend Status: {backendStatus}
          </span>
        </div>
      </div>
    </div>
  );
};

export default Home;
