import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Download, LayoutTemplate, ArrowLeft } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';

const templates = [
  { id: 'classic', name: 'Classic', description: 'Clean and professional layout.', font: 'font-serif' }
];

const TemplateSelector = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [resumeData, setResumeData] = useState(null);
  const [selectedTemplate, setSelectedTemplate] = useState('classic');
  const [loading, setLoading] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    const fetchResume = async () => {
      try {
        const response = await api.get(`/resumes/${id}`);
        setResumeData(response.data);
      } catch (error) {
        toast.error("Failed to load resume");
        navigate('/dashboard');
      } finally {
        setLoading(false);
      }
    };
    fetchResume();
  }, [id, navigate]);

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      const response = await api.get(`/resumes/${id}/pdf?template=${selectedTemplate}`, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${resumeData.personalDetails?.fullName?.replace(/\s+/g, '_') || 'resume'}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      toast.success("PDF Downloaded successfully!");
    } catch (error) {
      toast.error("Failed to generate PDF");
    } finally {
      setIsDownloading(false);
    }
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Loading Templates...</div>;

  return (
    <div className="max-w-6xl mx-auto animate-in fade-in duration-500">
      
      {/* Header */}
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-8">
        <div className="flex items-center space-x-4">
          <button 
            onClick={() => navigate(`/builder/${id}`)}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ArrowLeft className="h-6 w-6 text-gray-500" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center">
              <LayoutTemplate className="h-6 w-6 mr-2 text-indigo-600" />
              Template Gallery
            </h1>
            <p className="text-gray-500 text-sm">Choose a design and instantly preview your resume.</p>
          </div>
        </div>
        
        <button 
          onClick={handleDownload}
          disabled={isDownloading}
          className="flex items-center space-x-2 bg-indigo-600 text-white px-6 py-2.5 rounded-xl font-medium shadow-md shadow-indigo-200 transition-all hover:bg-indigo-700 hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
        >
          <Download className="h-5 w-5" />
          <span>{isDownloading ? 'Generating PDF...' : 'Download PDF'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Template Selection */}
        <div className="lg:col-span-1 space-y-4">
          <h2 className="font-bold text-gray-700 mb-4">Available Designs</h2>
          
          {templates.map(template => (
            <div 
              key={template.id}
              onClick={() => setSelectedTemplate(template.id)}
              className={`p-6 rounded-2xl border-2 cursor-pointer transition-all ${
                selectedTemplate === template.id 
                  ? 'border-indigo-600 bg-indigo-50 shadow-md' 
                  : 'border-gray-200 bg-white hover:border-indigo-300'
              }`}
            >
              <div className="flex justify-between items-center mb-2">
                <h3 className={`font-bold ${selectedTemplate === template.id ? 'text-indigo-900' : 'text-gray-800'}`}>
                  {template.name}
                </h3>
                {selectedTemplate === template.id && (
                  <div className="h-3 w-3 rounded-full bg-indigo-600"></div>
                )}
              </div>
              <p className={`text-sm ${selectedTemplate === template.id ? 'text-indigo-700' : 'text-gray-500'}`}>
                {template.description}
              </p>
            </div>
          ))}
        </div>

        {/* Right Column: Live Preview Area */}
        <div className="lg:col-span-2">
          <h2 className="font-bold text-gray-700 mb-4 flex justify-between items-center">
            Live Preview
            <span className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded">A4 Size Simulated</span>
          </h2>
          
          <div className="bg-gray-200 p-8 rounded-3xl overflow-hidden flex justify-center items-start shadow-inner">
            
            {/* The actual A4 Paper simulation */}
            <div className={`bg-white shadow-xl w-full max-w-[21cm] min-h-[29.7cm] p-[2cm] ${templates.find(t => t.id === selectedTemplate)?.font}`}>
              
              {/* Header */}
              <div className="pb-4 mb-4 text-center">
                <h1 className="text-[22pt] font-bold uppercase tracking-tight text-black mb-1">
                  {resumeData?.personalDetails?.fullName || 'CHILUKURI ANJALI'}
                </h1>
                <p className="text-[10pt] text-black">
                  {resumeData?.personalDetails?.phone || '+91 72868 04657'}
                  <span className="mx-2">—</span>
                  {resumeData?.personalDetails?.email || 'chilukurianjali2022@gmail.com'}
                  <span className="mx-2">—</span>
                  {resumeData?.personalDetails?.linkedIn ? resumeData.personalDetails.linkedIn.replace('https://', '').replace('www.', '') : 'linkedin.com/in/anjali-chilukuri'}
                  {resumeData?.personalDetails?.githubUrl && (
                    <>
                      <span className="mx-2">—</span>
                      {resumeData.personalDetails.githubUrl.replace('https://', '').replace('www.', '')}
                    </>
                  )}
                </p>
              </div>

              {/* Education */}
              {resumeData?.educationList?.length > 0 && (
                <div className="mb-4 text-black">
                  <h2 className="text-[12pt] font-bold uppercase mb-1">Education</h2>
                  <div className="border-t border-black mb-1"></div>
                  {resumeData.educationList.map((edu, idx) => (
                    <div key={idx} className="mb-2">
                      <div className="flex justify-between text-[10pt]">
                        <span className="font-bold">{edu.institution}</span>
                        <span className="font-bold">CGPA: {edu.gradeOrCgpa}</span>
                      </div>
                      <div className="text-[10pt]">
                        {edu.degree}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Technical Skills */}
              {resumeData?.skills?.length > 0 && (
                <div className="mb-4 text-black">
                  <h2 className="text-[12pt] font-bold uppercase mb-1">Technical Skills</h2>
                  <div className="border-t border-black mb-1"></div>
                  <ul className="pl-2 mt-1 space-y-2">
                    {resumeData.skills.map((skill, idx) => {
                      const colonIndex = skill.indexOf(':');
                      if (colonIndex !== -1) {
                        return (
                          <li key={idx} className="text-[10pt] leading-tight">
                            <span className="font-bold text-[10pt] mr-1">• {skill.substring(0, colonIndex + 1)}</span> 
                            {skill.substring(colonIndex + 1)}
                          </li>
                        );
                      }
                      return (
                        <li key={idx} className="text-[10pt] leading-tight">
                          <span className="font-bold text-[10pt] mr-1">•</span> 
                          {skill}
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}

              {/* Professional Experience */}
              {resumeData?.experienceList?.length > 0 && (
                <div className="mb-4 text-black">
                  <h2 className="text-[12pt] font-bold uppercase mb-1">Professional Experience</h2>
                  <div className="border-t border-black mb-1"></div>
                  {resumeData.experienceList.map((exp, idx) => (
                    <div key={idx} className="mb-2 pl-2">
                      <div className="font-bold text-[10pt]">{exp.jobTitle}</div>
                      <div className="flex justify-between text-[10pt]">
                        <span>{exp.companyName}</span>
                        <span>{exp.startDate} – {exp.isCurrentJob ? 'Present' : exp.endDate}</span>
                      </div>
                      <ul className="list-disc pl-4 mt-1 space-y-1">
                        {exp.responsibilities?.map((resp, i) => (
                          <li key={i} className="text-[10pt] leading-tight">{resp}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              )}

              {/* Projects */}
              {resumeData?.projectList?.length > 0 && (
                <div className="mb-4 text-black">
                  <h2 className="text-[12pt] font-bold uppercase mb-1">Projects</h2>
                  <div className="border-t border-black mb-1"></div>
                  {resumeData.projectList.map((proj, idx) => (
                    <div key={idx} className="mb-2 pl-2">
                      <div className="text-[10pt]">
                        <span className="font-bold">{proj.projectName}</span>
                        {proj.technologiesUsed?.length > 0 && (
                          <span className="font-bold"> — {proj.technologiesUsed.join(', ')}</span>
                        )}
                      </div>
                      <ul className="list-disc pl-4 mt-1 space-y-1">
                        {proj.description?.map((desc, i) => (
                          <li key={i} className="text-[10pt] leading-tight">{desc}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              )}

              {/* Certifications */}
              {resumeData?.certifications?.length > 0 && (
                <div className="mb-4 text-black">
                  <h2 className="text-[12pt] font-bold uppercase mb-1">Certifications</h2>
                  <div className="border-t border-black mb-1"></div>
                  <ul className="list-disc pl-4 mt-1 space-y-1">
                    {resumeData.certifications.map((cert, idx) => (
                      <li key={idx} className="text-[10pt] leading-tight">{cert}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TemplateSelector;
