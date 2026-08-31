import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FileText, Edit2, LayoutTemplate, Trash2, Plus, AlertTriangle } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';

const MyResumes = () => {
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [resumeToDelete, setResumeToDelete] = useState(null);

  useEffect(() => {
    fetchResumes();
  }, []);

  const fetchResumes = async () => {
    try {
      const response = await api.get('/resumes');
      setResumes(response.data);
    } catch (error) {
      toast.error('Failed to load resumes');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!resumeToDelete) return;
    
    setIsDeleting(true);
    try {
      await api.delete(`/resumes/${resumeToDelete}`);
      setResumes(resumes.filter(r => r.id !== resumeToDelete));
      toast.success('Resume deleted successfully');
    } catch (error) {
      toast.error('Failed to delete resume');
    } finally {
      setIsDeleting(false);
      setResumeToDelete(null);
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64 text-gray-500">Loading your resumes...</div>;
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-6xl mx-auto">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white p-6 rounded-2xl shadow-sm border border-gray-100 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <FileText className="h-8 w-8 mr-3 text-indigo-600" />
            My Resumes
          </h1>
          <p className="text-gray-500 mt-1">View, edit, and manage all your generated resumes here.</p>
        </div>
        <Link 
          to="/studio"
          className="flex items-center space-x-2 bg-indigo-600 text-white px-6 py-2.5 rounded-xl font-medium shadow-md shadow-indigo-200 transition-all hover:bg-indigo-700 hover:scale-105"
        >
          <Plus className="h-5 w-5" />
          <span>Create New</span>
        </Link>
      </div>

      {/* Resumes Grid */}
      {resumes.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {resumes.map((resume) => (
            <div key={resume.id} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col hover:shadow-md transition-shadow">
              
              {/* Card Header */}
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-bold text-lg text-gray-900 truncate" title={resume.personalDetails?.fullName || 'Untitled'}>
                    {resume.personalDetails?.fullName || 'Untitled'}
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    {resume.title || 'Resume'}
                  </p>
                </div>
                <div className="bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider">
                  Draft
                </div>
              </div>

              {/* Card Body (Stats) */}
              <div className="bg-gray-50 rounded-xl p-4 mb-6 space-y-2 text-sm text-gray-600 flex-grow">
                <div className="flex justify-between">
                  <span>Experience:</span>
                  <span className="font-medium text-gray-900">{resume.experienceList?.length || 0} roles</span>
                </div>
                <div className="flex justify-between">
                  <span>Projects:</span>
                  <span className="font-medium text-gray-900">{resume.projectList?.length || 0} projects</span>
                </div>
                <div className="flex justify-between">
                  <span>Skills:</span>
                  <span className="font-medium text-gray-900">{resume.skills?.length || 0} skills</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-gray-200 mt-2">
                  <span>Updated:</span>
                  <span className="font-medium text-gray-900">{new Date(resume.updatedAt).toLocaleDateString()}</span>
                </div>
              </div>

              {/* Card Footer (Actions) */}
              <div className="flex items-center space-x-2">
                <Link 
                  to={`/builder/${resume.id}`}
                  className="flex-1 flex justify-center items-center space-x-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  <Edit2 className="h-4 w-4" />
                  <span>Edit</span>
                </Link>
                <Link 
                  to={`/templates/${resume.id}`}
                  className="flex-1 flex justify-center items-center space-x-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  <LayoutTemplate className="h-4 w-4" />
                  <span>Preview</span>
                </Link>
                <button 
                  onClick={() => setResumeToDelete(resume.id)}
                  className="p-2 bg-white border border-red-100 hover:bg-red-50 text-red-500 rounded-lg transition-colors"
                  title="Delete Resume"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl p-12 shadow-sm border border-gray-100 text-center">
          <FileText className="h-16 w-16 mx-auto text-gray-300 mb-4" />
          <h2 className="text-xl font-bold text-gray-700">No Resumes Found</h2>
          <p className="text-gray-500 mt-2 max-w-md mx-auto">
            You haven't built any resumes yet. Click the button below to start creating your first AI-powered resume.
          </p>
          <Link 
            to="/studio"
            className="inline-flex items-center space-x-2 bg-indigo-600 text-white px-6 py-3 rounded-xl font-medium mt-6 shadow-md shadow-indigo-200 transition-all hover:bg-indigo-700 hover:scale-105"
          >
            <Mic className="h-5 w-5" />
            <span>Create with Voice</span>
          </Link>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {resumeToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-in fade-in">
          <div className="bg-white rounded-2xl p-8 max-w-sm w-full mx-4 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mx-auto mb-4">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
            <h3 className="text-xl font-bold text-center text-gray-900 mb-2">Delete Resume?</h3>
            <p className="text-center text-gray-500 mb-6 text-sm">
              Are you sure you want to permanently delete this resume? This action cannot be undone.
            </p>
            <div className="flex space-x-3">
              <button 
                onClick={() => setResumeToDelete(null)}
                disabled={isDeleting}
                className="flex-1 bg-white border border-gray-300 text-gray-700 py-2.5 rounded-xl font-medium hover:bg-gray-50 disabled:opacity-50 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleDelete}
                disabled={isDeleting}
                className="flex-1 bg-red-600 text-white py-2.5 rounded-xl font-medium hover:bg-red-700 shadow-sm shadow-red-200 disabled:opacity-50 transition-all"
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyResumes;
