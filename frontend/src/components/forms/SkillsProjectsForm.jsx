import React, { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { Plus, Trash2, Rocket } from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';

const SkillsProjectsForm = ({ resumeData, setResumeData, onNext, onBack }) => {
  const { register, control, handleSubmit, reset } = useForm({
    defaultValues: {
      skillsText: resumeData?.skills ? resumeData.skills.join('\n') : '',
      certificationsText: resumeData?.certifications ? resumeData.certifications.join('\n') : '',
      projects: resumeData?.projectList?.length > 0 
        ? resumeData.projectList.map(proj => ({
            ...proj,
            descriptionText: proj.description ? proj.description.join('\n') : '',
            techText: proj.technologiesUsed ? proj.technologiesUsed.join(', ') : ''
          }))
        : [{ projectName: '', role: '', startDate: '', endDate: '', projectUrl: '', descriptionText: '', techText: '' }]
    }
  });

  useEffect(() => {
    reset({
      skillsText: resumeData?.skills ? resumeData.skills.join('\n') : '',
      certificationsText: resumeData?.certifications ? resumeData.certifications.join('\n') : '',
      projects: resumeData?.projectList?.length > 0 
        ? resumeData.projectList.map(proj => ({
            ...proj,
            descriptionText: proj.description ? proj.description.join('\n') : '',
            techText: proj.technologiesUsed ? proj.technologiesUsed.join(', ') : ''
          }))
        : [{ projectName: '', role: '', startDate: '', endDate: '', projectUrl: '', descriptionText: '', techText: '' }]
    });
  }, [resumeData, reset]);

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'projects'
  });

  const [saving, setSaving] = useState(false);

  const onSubmit = async (data) => {
    setSaving(true);
    try {
      const skillsArray = data.skillsText ? data.skillsText.split('\n').map(s => s.trim()).filter(s => s) : [];
      const certsArray = data.certificationsText ? data.certificationsText.split('\n').map(s => s.trim()).filter(s => s) : [];
      
      const formattedProjects = data.projects.map(proj => ({
        ...proj,
        description: proj.descriptionText ? proj.descriptionText.split('\n').filter(d => d.trim() !== '') : [],
        technologiesUsed: proj.techText ? proj.techText.split(',').map(t => t.trim()).filter(t => t) : []
      }));

      const updatedResume = { 
        ...resumeData, 
        skills: skillsArray,
        certifications: certsArray,
        projectList: formattedProjects 
      };

      let savedResume;
      if (resumeData?.id) {
        const response = await api.put(`/resumes/${resumeData.id}`, updatedResume);
        savedResume = response.data;
      } else {
        const response = await api.post('/resumes', updatedResume);
        savedResume = response.data;
      }
      setResumeData(savedResume);
      toast.success('Skills and Projects saved!');
      onNext();
    } catch (error) {
      toast.error('Failed to save details.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      
      {/* Skills Section */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Skills</h2>
        <div>
          <label className="block text-sm font-medium text-gray-700">Enter skills (One per line). You can use 'Category: Skills' format.</label>
          <textarea 
            {...register('skillsText')} 
            rows={6}
            placeholder="Programming Languages: Java, Python&#10;Tools & Platforms: Git, Docker" 
            className="mt-1 block w-full rounded-lg border-gray-300 border px-3 py-2" 
          />
        </div>
      </div>

      {/* Certifications Section */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Certifications</h2>
        <div>
          <label className="block text-sm font-medium text-gray-700">Enter certifications (One per line). e.g., 'Name - Organization'</label>
          <textarea 
            {...register('certificationsText')} 
            rows={4}
            placeholder="Python Essentials 1 - Cisco Networking Academy&#10;Web Design - GUVI Skill-A-Thon" 
            className="mt-1 block w-full rounded-lg border-gray-300 border px-3 py-2" 
          />
        </div>
      </div>

      {/* Projects Section */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-900">Projects</h2>
          <button 
            type="button" 
            onClick={() => append({ projectName: '', role: '', startDate: '', endDate: '', projectUrl: '', descriptionText: '', techText: '' })}
            className="flex items-center text-sm text-indigo-600 font-medium hover:text-indigo-800"
          >
            <Plus className="h-4 w-4 mr-1" /> Add Project
          </button>
        </div>
        
        <div className="space-y-6">
          {fields.map((item, index) => (
            <div key={item.id} className="p-4 border border-gray-200 rounded-xl relative bg-gray-50">
              {index > 0 && (
                <button type="button" onClick={() => remove(index)} className="absolute top-4 right-4 text-red-500 hover:text-red-700">
                  <Trash2 className="h-5 w-5" />
                </button>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Project Name</label>
                  <input {...register(`projects.${index}.projectName`)} placeholder="Portfolio Website" className="mt-1 block w-full rounded-lg border-gray-300 border px-3 py-2" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Role</label>
                  <input {...register(`projects.${index}.role`)} placeholder="Full Stack Developer" className="mt-1 block w-full rounded-lg border-gray-300 border px-3 py-2" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Start Date</label>
                  <input {...register(`projects.${index}.startDate`)} placeholder="Jan 2023" className="mt-1 block w-full rounded-lg border-gray-300 border px-3 py-2" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">End Date</label>
                  <input {...register(`projects.${index}.endDate`)} placeholder="Mar 2023" className="mt-1 block w-full rounded-lg border-gray-300 border px-3 py-2" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700">Project URL</label>
                  <input {...register(`projects.${index}.projectUrl`)} placeholder="https://github.com/..." className="mt-1 block w-full rounded-lg border-gray-300 border px-3 py-2" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700">Technologies (Comma separated)</label>
                  <input {...register(`projects.${index}.techText`)} placeholder="React, Node.js, MongoDB" className="mt-1 block w-full rounded-lg border-gray-300 border px-3 py-2" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700">Description (One per line)</label>
                  <textarea 
                    {...register(`projects.${index}.descriptionText`)} 
                    rows={3} 
                    placeholder="Built a responsive UI...&#10;Integrated REST API..."
                    className="mt-1 block w-full rounded-lg border-gray-300 border px-3 py-2" 
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-between pt-6">
          <button 
            type="button" 
            onClick={onBack} 
            className="text-gray-600 px-6 py-2 rounded-lg hover:bg-gray-100 font-medium"
          >
            Back
          </button>
          <button type="submit" disabled={saving} className="bg-green-600 flex items-center text-white px-6 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 font-medium">
            <Rocket className="h-5 w-5 mr-2" />
            {saving ? 'Saving...' : 'Finish Resume'}
          </button>
        </div>
      </div>
    </form>
  );
};

export default SkillsProjectsForm;
