import React, { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { Plus, Trash2 } from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';

const EducationForm = ({ resumeData, setResumeData, onNext, onBack }) => {
  const { register, control, handleSubmit, reset } = useForm({
    defaultValues: {
      educationList: resumeData?.educationList?.length > 0 
        ? resumeData.educationList 
        : [{ degree: '', institution: '', location: '', startDate: '', endDate: '', gradeOrCgpa: '', description: '' }]
    }
  });

  useEffect(() => {
    reset({
      educationList: resumeData?.educationList?.length > 0 
        ? resumeData.educationList 
        : [{ degree: '', institution: '', location: '', startDate: '', endDate: '', gradeOrCgpa: '', description: '' }]
    });
  }, [resumeData, reset]);

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'educationList'
  });

  const [saving, setSaving] = useState(false);

  const onSubmit = async (data) => {
    setSaving(true);
    try {
      const updatedResume = { ...resumeData, educationList: data.educationList };
      let savedResume;
      if (resumeData?.id) {
        const response = await api.put(`/resumes/${resumeData.id}`, updatedResume);
        savedResume = response.data;
      } else {
        const response = await api.post('/resumes', updatedResume);
        savedResume = response.data;
      }
      setResumeData(savedResume);
      toast.success('Education details saved!');
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
        <h2 className="text-xl font-bold text-gray-900">Education</h2>
        <button 
          type="button" 
          onClick={() => append({ degree: '', institution: '', location: '', startDate: '', endDate: '', gradeOrCgpa: '', description: '' })}
          className="flex items-center text-sm text-indigo-600 font-medium hover:text-indigo-800"
        >
          <Plus className="h-4 w-4 mr-1" /> Add Education
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
              <label className="block text-sm font-medium text-gray-700">Degree</label>
              <input {...register(`educationList.${index}.degree`)} placeholder="B.Sc in Computer Science" className="mt-1 block w-full rounded-lg border-gray-300 border px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Institution</label>
              <input {...register(`educationList.${index}.institution`)} placeholder="University Name" className="mt-1 block w-full rounded-lg border-gray-300 border px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Start Date</label>
              <input {...register(`educationList.${index}.startDate`)} placeholder="Aug 2018" className="mt-1 block w-full rounded-lg border-gray-300 border px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">End Date</label>
              <input {...register(`educationList.${index}.endDate`)} placeholder="May 2022" className="mt-1 block w-full rounded-lg border-gray-300 border px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Location</label>
              <input {...register(`educationList.${index}.location`)} placeholder="City, Country" className="mt-1 block w-full rounded-lg border-gray-300 border px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Grade / CGPA</label>
              <input {...register(`educationList.${index}.gradeOrCgpa`)} placeholder="3.8/4.0" className="mt-1 block w-full rounded-lg border-gray-300 border px-3 py-2" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700">Description (Optional)</label>
              <textarea {...register(`educationList.${index}.description`)} rows={2} className="mt-1 block w-full rounded-lg border-gray-300 border px-3 py-2" />
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

export default EducationForm;
