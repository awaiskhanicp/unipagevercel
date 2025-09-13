'use client';

import { useState } from 'react';
import { Save, X, Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { useJobs } from './JobContext';
import Swal from 'sweetalert2';

const SummernoteEditor = dynamic(() => import('../../../components/organisms/SummernoteEditor'), { 
  ssr: false,
  loading: () => <div className="p-4 border rounded-lg bg-gray-50 animate-pulse">Loading editor...</div>
});

const tabs = [
  'BASIC INFO',
  'SKILLS',
  'REQUIREMENTS',
  'RESPONSIBILITIES',
  'DESCRIPTION'
];

const initialForm = {
  title: '',
  job_type: '',
  city: '',
  province: '',
  country: '',
  site_based: false,
  skills: [],
  experience: '',
  requirements: '',
  responsibilities: '',
  description: '',
  active: true,
};

const AddJobs = () => {
  const router = useRouter();
  const [form, setForm] = useState(initialForm);
  const [newSkill, setNewSkill] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState('BASIC INFO');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [previousTab, setPreviousTab] = useState('BASIC INFO');

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  // Handle rich text editor changes
  const handleEditorChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Enhanced validation for all required fields
    const requiredFields = {
      title: 'Job Title',
      job_type: 'Job Type',
      requirements: 'Requirements',
      responsibilities: 'Responsibilities', 
      description: 'Description'
    };

    const missingFields = [];
    for (const [field, label] of Object.entries(requiredFields)) {
      if (!form[field] || (typeof form[field] === 'string' && !form[field].trim())) {
        missingFields.push(label);
      }
    }

    if (missingFields.length > 0) {
      alert(`Please fill in all required fields:\n${missingFields.join('\n')}`);
      return;
    }

    // Validate skills array
    if (!form.skills || form.skills.length === 0) {
      alert('Please add at least one skill for this position.');
      return;
    }
    
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/internal/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      
      if (!response.ok) {
        
        const data = response.json();

        Swal.fire({
          title: 'Error',
          text: data.message,
          icon: 'error',
          confirmButtonText: 'OK'
        })

        return;
      }
      
      setForm(initialForm);
      setActiveTab('BASIC INFO');
      setNewSkill('');

      Swal.fire({
        title: 'Success',
        text: 'Job added successfully',
        icon: 'success',
        confirmButtonText: 'OK'
      }).then(() => {
        router.push('/admin/job-posts');
      })

    } catch (error) {
      console.error("Error adding job:", error);
      Swal.fire({
        title: 'Error',
        text: error,
        icon: 'error',
        confirmButtonText: 'OK'
      })
      return false;
    } finally {
      setIsSubmitting(false);
    }

  };

  const addSkill = () => {
    if (newSkill.trim() && !form.skills.includes(newSkill)) {
      setForm((prev) => ({ ...prev, skills: [...prev.skills, newSkill.trim()] }));
      setNewSkill('');
    }
  };

  const removeSkill = (skill) => {
    setForm((prev) => ({ ...prev, skills: prev.skills.filter((s) => s !== skill) }));
  };

  const handleTabChange = (newTab) => {
    // Save current tab content before switching
    setPreviousTab(activeTab);
    setActiveTab(newTab);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'BASIC INFO':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">Job Title*</label>
              <input
                name="title"
                placeholder="e.g. Software Engineer"
                className="input w-full"
                value={form.title}
                onChange={handleChange}
                required
              />
            </div>
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">Job Type*</label>
              <input
                name="job_type"
                placeholder="e.g. Full-time, Contract"
                className="input w-full"
                value={form.job_type}
                onChange={handleChange}
                required
              />
            </div>
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">City</label>
              <input
                name="city"
                placeholder="e.g. Karachi"
                className="input w-full"
                value={form.city}
                onChange={handleChange}
              />
            </div>
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">Province/State</label>
              <input
                name="province"
                placeholder="e.g. Sindh"
                className="input w-full"
                value={form.province}
                onChange={handleChange}
              />
            </div>
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">Country</label>
              <input
                name="country"
                placeholder="e.g. Pakistan"
                className="input w-full"
                value={form.country}
                onChange={handleChange}
              />
            </div>
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">Experience Level</label>
              <input
                name="experience"
                placeholder="e.g. 2-5 years"
                className="input w-full"
                value={form.experience}
                onChange={handleChange}
              />
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                name="site_based"
                id="site_based"
                checked={form.site_based}
                onChange={handleChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="site_based" className="text-sm font-medium text-gray-700">
                Site Based Position
              </label>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                name="active"
                id="active"
                checked={form.active}
                onChange={handleChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="active" className="text-sm font-medium text-gray-700">
                Active Job Post
              </label>
            </div>
          </div>
        );

      case 'SKILLS':
        return (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="flex-1">
                <input
                  placeholder="Add required skill (e.g. React, Python)"
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                  className="input w-full"
                />
              </div>
              <button
                type="button"
                onClick={addSkill}
                className="btn-secondary flex items-center justify-center gap-1 px-4 py-2"
              >
                <Plus size={16} /> Add
              </button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {form.skills.map((skill) => (
                <span
                  key={skill}
                  className="inline-flex items-center bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full"
                >
                  {skill}
                  <button
                    type="button"
                    onClick={() => removeSkill(skill)}
                    className="ml-1 text-blue-600 hover:text-blue-800"
                  >
                    <X size={16} />
                  </button>
                </span>
              ))}
            </div>
          </div>
        );

      case 'REQUIREMENTS':
        return (
          <div key="requirements-editor">
            <SummernoteEditor
              key="requirements-summernote"
              value={form.requirements}
              onChange={(val) => handleEditorChange('requirements', val)}
              placeholder="List the requirements for this position..."

            />
          </div>
        );

      case 'RESPONSIBILITIES':
        return (
          <div key="responsibilities-editor">
            <SummernoteEditor
              key="responsibilities-summernote"
              value={form.responsibilities}
              onChange={(val) => handleEditorChange('responsibilities', val)}
              placeholder="Describe the responsibilities for this role..."

            />
          </div>
        );

      case 'DESCRIPTION':
        return (
          <div key="description-editor">
            <SummernoteEditor
              key="description-summernote"
              value={form.description}
              onChange={(val) => handleEditorChange('description', val)}
              placeholder="Provide a detailed description of the job..."

            />
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <>
    <title>Add New Job Post - University Page</title>
    <form onSubmit={handleSubmit} className="min-h-screen flex flex-col md:flex-row bg-gray-100">
      {/* Mobile Menu Button */}
      <div className="md:hidden bg-white p-4 flex justify-between items-center border-b">
        <h2 className="text-xl font-bold text-gray-800">Add Job</h2>
        <button
          type="button"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="text-gray-500 hover:text-gray-600"
        >
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            {mobileMenuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile Sidebar */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b shadow-lg p-4">
          <ul className="space-y-2">
            {tabs.map((tab) => (
              <li key={tab}>
                <button
                  type="button"
                  onClick={() => {
                    handleTabChange(tab);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                    activeTab === tab ? 'bg-[#0B6D76] text-white' : 'hover:bg-gray-200'
                  }`}
                >
                  {tab}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Desktop Sidebar */}
      <div className="hidden md:block w-64 bg-white border-r shadow-lg p-6">
        <h2 className="text-xl font-bold mb-6 text-gray-800">Add Job</h2>
        <ul className="space-y-2">
          {tabs.map((tab) => (
            <li key={tab}>
                                <button
                    type="button"
                    onClick={() => handleTabChange(tab)}
                    className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                      activeTab === tab ? 'bg-[#0B6D76] text-white' : 'hover:bg-gray-200'
                    }`}
                  >
                    {tab}
                  </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-4 md:p-6 lg:p-8 bg-white">
        <div className="max-w-4xl mx-auto">
          {/* Mobile Tab Indicator */}
          <div className="md:hidden mb-6">
            <div className="bg-[#0B6D76] text-white px-4 py-2 rounded-lg">
              {activeTab}
            </div>
          </div>

          {renderContent()}

          {/* Show submit button only on last tab */}
          {activeTab === 'DESCRIPTION' && (
            <div className="flex flex-col sm:flex-row justify-end gap-3 pt-6 mt-6 border-t">
              <button
                type="button"
                onClick={() => router.push('/job-opportunities')}
                className="btn-gray flex items-center justify-center gap-2 px-6 py-2"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-primary flex items-center justify-center gap-2 px-6 py-2"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save size={18} /> Post Job
                  </>
                )}
              </button>
            </div>
          )}

          {/* Navigation buttons for other tabs */}
          {activeTab !== 'DESCRIPTION' && (
            <div className="flex justify-between pt-6 mt-6 border-t">
              {activeTab !== 'BASIC INFO' && (
                <button
                  type="button"
                  onClick={() => handleTabChange(tabs[tabs.indexOf(activeTab) - 1])}
                  className="btn-gray flex items-center gap-2 px-6 py-2"
                >
                  Previous
                </button>
              )}
              <button
                type="button"
                onClick={() => handleTabChange(tabs[tabs.indexOf(activeTab) + 1])}
                className="ml-auto btn-primary flex items-center gap-2 px-6 py-2"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Add these styles to your global CSS or CSS module */}
      <style jsx>{`
        .input {
          @apply w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all;
        }
        .btn-primary {
          @apply bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors disabled:opacity-70;
        }
        .btn-secondary {
          @apply bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium rounded-lg transition-colors border border-gray-300;
        }
        .btn-gray {
          @apply bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium rounded-lg transition-colors;
        }
      `}</style>
    </form>
    </>
  );
};


export default AddJobs;
