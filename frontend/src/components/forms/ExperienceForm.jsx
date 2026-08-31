import React, { useState, useEffect } from 'react';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { Plus, Trash2 } from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';

const ExperienceForm = ({ resumeData, setResumeData, onNext, onBack }) => {
  const { register, control, handleSubmit, reset } = useForm({
    defaultValues: {
      experienceList: resumeData?.experienceList?.length > 0 
        ? resumeData.experienceList.map(exp => ({
            ...exp,
            // Convert array of responsibilities back to string for the textarea
            responsibilitiesText: exp.responsibilities ? exp.responsibilities.join('\n') : ''
          }))
        : [{ jobTitle: '', companyName: '', location: '', startDate: '', endDate: '', isCurrentJob: false, responsibilitiesText: '' }]
    }
  });

  useEffect(() => {
    reset({
      experienceList: resumeData?.experienceList?.length > 0 
        ? resumeData.experienceList.map(exp => ({
            ...exp,
            responsibilitiesText: exp.responsibilities ? exp.responsibilities.join('\n') : ''
          }))
        : [{ jobTitle: '', companyName: '', location: '', startDate: '', endDate: '', isCurrentJob: false, responsibilitiesText: '' }]
    });
  }, [resumeData, reset]);

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'experienceList'
  });

  const [saving, setSaving] = useState(false);

  const onSubmit = async (data) => {
    setSaving(true);
    try {
      // Convert the text area back to array of strings
      const formattedData = data.experienceList.map(exp => ({
        ...exp,
        responsibilities: exp.responsibilitiesText ? exp.responsibilitiesText.split('\n').filter(r => r.trim() !== '') : []
      }));

      const updatedResume = { ...resumeData, experienceList: formattedData };
      let savedResume;
      if (resumeData?.id) {
        const response = await api.put(`/resumes/${resumeData.id}`, updatedResume);
        savedResume = response.data;
      } else {
        const response = await api.post('/resumes', updatedResume);
        savedResume = response.data;
      }
      setResumeData(savedResume);
      toast.success('Experience details saved!');
      onNext();
    } catch (error) {
      toast.error('Failed to save details.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-900">Work Experience</h2>
        <button 
          type="button" 
          onClick={() => append({ jobTitle: '', companyName: '', location: '', startDate: '', endDate: '', isCurrentJob: false, responsibilitiesText: '' })}
          className="flex items-center text-sm text-indigo-600 font-medium hover:text-indigo-800"
        >
          <Plus className="h-4 w-4 mr-1" /> Add Experience
        </button>
      </div>
      
      {fields.map((item, index) => (
        <div key={item.id} className="p-4 border border-gray-200 rounded-xl relative bg-gray-50">
          {index > 0 && (
            <button type="button" onClick={() => remove(index)} className="absolute top-4 right-4 text-red-500 hover:text-red-700">
              <Trash2 className="h-5 w-5" />
            </button>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
            <div>
              <label className="block text-sm font-medium text-gray-700">Job Title</label>
              <input {...register(`experienceList.${index}.jobTitle`)} placeholder="Software Engineer" className="mt-1 block w-full rounded-lg border-gray-300 border px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Company Name</label>
              <input {...register(`experienceList.${index}.companyName`)} placeholder="Google" className="mt-1 block w-full rounded-lg border-gray-300 border px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Start Date</label>
              <input {...register(`experienceList.${index}.startDate`)} placeholder="June 2022" className="mt-1 block w-full rounded-lg border-gray-300 border px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">End Date</label>
              <input {...register(`experienceList.${index}.endDate`)} placeholder="Present" className="mt-1 block w-full rounded-lg border-gray-300 border px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Location</label>
              <input {...register(`experienceList.${index}.location`)} placeholder="San Francisco, CA" className="mt-1 block w-full rounded-lg border-gray-300 border px-3 py-2" />
            </div>
            <div className="flex items-center mt-6">
              <input type="checkbox" {...register(`experienceList.${index}.isCurrentJob`)} className="h-4 w-4 text-indigo-600 border-gray-300 rounded" />
              <label className="ml-2 block text-sm text-gray-900">I currently work here</label>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700">Responsibilities (One per line)</label>
              <textarea 
                {...register(`experienceList.${index}.responsibilitiesText`)} 
                rows={4} 
                placeholder="Developed new features...&#10;Optimized database queries..."
                className="mt-1 block w-full rounded-lg border-gray-300 border px-3 py-2" 
              />
            </div>
          </div>
        </div>
      ))}

      <div className="flex justify-between pt-4">
        <button 
          type="button" 
          onClick={onBack} 
          className="text-gray-600 px-6 py-2 rounded-lg hover:bg-gray-100 font-medium"
        >
          Back
        </button>
        <button type="submit" disabled={saving} className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50 font-medium">
          {saving ? 'Saving...' : 'Save & Continue'}
        </button>
      </div>
    </form>
  );
};

export default ExperienceForm;
