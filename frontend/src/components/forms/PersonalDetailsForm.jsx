import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import api from '../../services/api';
import toast from 'react-hot-toast';

const PersonalDetailsForm = ({ resumeData, setResumeData, onNext }) => {
  const { register, handleSubmit, reset } = useForm({
    defaultValues: resumeData?.personalDetails || {}
  });

  useEffect(() => {
    reset(resumeData?.personalDetails || {});
  }, [resumeData, reset]);

  const [saving, setSaving] = useState(false);

  const onSubmit = async (data) => {
    setSaving(true);
    try {
      // 1. Build the updated resume object
      const updatedResume = {
        ...resumeData,
        personalDetails: data,
        title: resumeData?.title || 'My New Resume'
      };

      let savedResume;

      // 2. If it has an ID, UPDATE it. If not, CREATE it.
      if (resumeData?.id) {
        const response = await api.put(`/resumes/${resumeData.id}`, updatedResume);
        savedResume = response.data;
      } else {
        const response = await api.post('/resumes', updatedResume);
        savedResume = response.data;
      }

      // 3. Update parent state with the database version (which has the ID)
      setResumeData(savedResume);
      toast.success('Personal details saved!');
      
      // 4. Move to next step
      onNext();
    } catch (error) {
      toast.error('Failed to save details.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
      <h2 className="text-xl font-bold text-gray-900">Personal Details</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Full Name</label>
          <input {...register('fullName')} className="mt-1 block w-full rounded-lg border-gray-300 border px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Email</label>
          <input type="email" {...register('email')} className="mt-1 block w-full rounded-lg border-gray-300 border px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Phone</label>
          <input {...register('phone')} className="mt-1 block w-full rounded-lg border-gray-300 border px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">LinkedIn URL</label>
          <input {...register('linkedIn')} className="mt-1 block w-full rounded-lg border-gray-300 border px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">GitHub URL</label>
          <input {...register('githubUrl')} className="mt-1 block w-full rounded-lg border-gray-300 border px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Portfolio URL</label>
          <input {...register('portfolioUrl')} className="mt-1 block w-full rounded-lg border-gray-300 border px-3 py-2" />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700">Address / Location</label>
          <input {...register('address')} placeholder="City, Country" className="mt-1 block w-full rounded-lg border-gray-300 border px-3 py-2" />
        </div>
      </div>

      <div className="flex justify-end">
        <button type="submit" disabled={saving} className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50">
          {saving ? 'Saving...' : 'Save & Continue'}
        </button>
      </div>
    </form>
  );
};

export default PersonalDetailsForm;
