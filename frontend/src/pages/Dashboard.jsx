import React, { useEffect, useState, useContext } from 'react';
import { FileText, Mic, Clock, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await api.get('/dashboard');
        setStats(response.data);
      } catch (error) {
        toast.error('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  if (loading) {
    return <div className="flex justify-center items-center h-64 text-gray-500">Loading your stats...</div>;
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Welcome Back, {user?.name || 'User'}! 👋</h1>
        <p className="text-gray-500 mt-1">Here is an overview of your resume building activity.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Card 1 */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center space-x-4">
          <div className="bg-indigo-50 p-4 rounded-xl text-indigo-600">
            <FileText className="h-8 w-8" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Total Resumes</p>
            <p className="text-3xl font-bold text-gray-900">{stats?.totalResumes || 0}</p>
          </div>
        </div>

        {/* Card 2 */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center space-x-4">
          <div className="bg-emerald-50 p-4 rounded-xl text-emerald-600">
            <Mic className="h-8 w-8" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Voice Sessions</p>
            <p className="text-3xl font-bold text-gray-900">{stats?.totalVoiceSessions || 0}</p>
          </div>
        </div>
      </div>

      {/* Recent Resumes */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <Clock className="h-5 w-5 mr-2 text-indigo-500" />
            Recent Resumes
          </h3>
          <Link to="/resumes" className="text-sm text-indigo-600 font-medium hover:text-indigo-800 flex items-center">
            View All <ArrowRight className="h-4 w-4 ml-1" />
          </Link>
        </div>
        <div className="p-6">
          {stats?.recentResumes?.length > 0 ? (
            <ul className="space-y-4">
              {stats.recentResumes.map((resume, index) => (
                <li key={index} className="flex justify-between items-center p-4 bg-gray-50 rounded-xl hover:bg-indigo-50 transition-colors">
                  <div>
                    <div className="flex items-center space-x-2">
                      <p className="font-semibold text-gray-900">{resume.personalDetails?.fullName || 'Untitled Resume'}</p>
                      {resume.category && resume.category !== "General" && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-indigo-100 text-indigo-800">
                          {resume.category}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Updated {new Date(resume.updatedAt).toLocaleDateString()}</p>
                  </div>
                  <Link to={`/builder/${resume.id}`} className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium hover:text-indigo-600 transition-colors">
                    Edit
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p>You haven't built any resumes yet.</p>
              <div className="mt-4 space-x-4">
                <Link to="/builder" className="inline-block bg-white border border-gray-200 text-gray-700 px-6 py-2 rounded-lg font-medium hover:bg-gray-50">
                  Build Manually
                </Link>
                <Link to="/studio" className="inline-block bg-indigo-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-indigo-700">
                  Create with Voice
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
