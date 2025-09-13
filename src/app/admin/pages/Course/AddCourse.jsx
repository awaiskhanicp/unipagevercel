'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { Plus, Trash2 } from 'lucide-react';
import Swal from 'sweetalert2';

const SummernoteEditor = dynamic(() => import('../../../components/organisms/SummernoteEditor'), { 
  ssr: false,
  loading: () => <p className="p-4 bg-gray-100 rounded-lg">Loading editor...</p>
});

const tabs = [
  'GENERAL',
  'ABOUT',
  'ENTRY REQUIREMENT',
  'CURRICULUM'
];

export default function AddCourse({ initialData = null, onSubmit, loading = false, onCancel }) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('GENERAL');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    courseName: '',
    duration: '',
    duration_qty: '',
    duration_type: '',
    universityName: '',
    subject: '',
    qualification: '',
    yearlyFee: '',
    application_fee: '',
    language: '',
    reviews: [{ rating: '', reviewDate: '', authorName: '', publisherName: '', reviewerName: '', reviewDescription: '' }],
    about: '',
    entry_requirments: '',
    curriculum: '',
    deadline: '',
    starting_date: '',
    avg_review_value: '',
    review_count: '',
    rating_count: '',
    scholarship: '',
  });

  // Prefill when editing
  useEffect(() => {
    if (!initialData) return;
    const parsedReviews = (() => {
      try {
        const r = typeof initialData.review_detail === 'string' ? JSON.parse(initialData.review_detail) : (initialData.review_detail || []);
        return Array.isArray(r) && r.length > 0 ? r : [{ rating: '', reviewDate: '', authorName: '', publisherName: '', reviewerName: '', reviewDescription: '' }];
      } catch {
        return [{ rating: '', reviewDate: '', authorName: '', publisherName: '', reviewerName: '', reviewDescription: '' }];
      }
    })();

    console.log("Initial Data", initialData)
    
    setFormData({
      courseName: initialData.name || '',
      duration: initialData.duration ?? '',
      duration_qty: initialData.duration_qty ?? '',
      duration_type: initialData.duration_type || '',
      universityName: initialData.university_id,
      subject: initialData.subject_id ? String(initialData.subject_id) : '',
      qualification: initialData.qualification_id,
      yearlyFee: initialData.yearly_fee ?? '',
      application_fee: initialData.application_fee ?? '',
      language: initialData.languages || '',
      reviews: parsedReviews,
      about: initialData.about || '',
      entry_requirments: initialData.entry_requirments || '',
      curriculum: initialData.curriculum || '',
      deadline: initialData.deadline ? new Date(initialData.deadline).toISOString().slice(0, 10) : '',
      starting_date: initialData.starting_date ? new Date(initialData.starting_date).toISOString().slice(0, 10) : '',
      avg_review_value: initialData.avg_review_value ?? '',
      review_count: initialData.review_count ?? '',
      rating_count: initialData.rating_count ?? '',
      scholarship: initialData.scholarship || '',
    });
  }, [initialData]);

  const [universities, setUniversities] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [levels, setLevels] = useState([]);

  // Getting Universities, Subjects and levels
  useEffect(() => {

    const fetchdata = async () => {
      const [levelResponse, subjectResponse, universityResponse] = await Promise.all([
        fetch('/api/internal/new/getpostlevel', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          }
        }),
        fetch('/api/internal/new/getsubject', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          }
        }),
        fetch('/api/internal/new/getuniversity', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          }
        })
      ]);

      if(!levelResponse.ok || !subjectResponse.ok || !universityResponse.ok) throw new Error('Failed to fetch data')

      const levelData = await levelResponse.json();
      const subjectsData = await subjectResponse.json();
      const universityData = await universityResponse.json();

      setLevels(levelData.data);
      setSubjects(subjectsData.data);
      setUniversities(universityData.data)
    }

    fetchdata()

  }, [])

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditorChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };


  const handleReviewChange = (index, field, value) => {
    const newReviews = [...formData.reviews];
    newReviews[index][field] = value;
    setFormData({ ...formData, reviews: newReviews });
  };

  const addReviewField = () => {
    setFormData({
      ...formData,
      reviews: [...formData.reviews, { rating: '', reviewDate: '', authorName: '', publisherName: '', reviewerName: '', reviewDescription: '' }]
    });
  };

  const removeReviewField = (index) => {
    const newReviews = [...formData.reviews];
    newReviews.splice(index, 1);
    setFormData({ ...formData, reviews: newReviews });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.courseName.trim()) {
      Swal.fire({
        icon: 'warning',
        title: 'Validation Error',
        text: 'Course name is required',
        confirmButtonColor: '#0B6D76',
        confirmButtonText: 'OK'
      });
      return;
    }
    
    if (!formData.universityName) {
      Swal.fire({
        icon: 'warning',
        title: 'Validation Error',
        text: 'University is required',
        confirmButtonColor: '#0B6D76',
        confirmButtonText: 'OK'
      });
      return;
    }
    
    if (!formData.subject) {
      Swal.fire({
        icon: 'warning',
        title: 'Validation Error',
        text: 'Subject is required',
        confirmButtonColor: '#0B6D76',
        confirmButtonText: 'OK'
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const payload = {
        name: formData.courseName,
        university_id: parseInt(formData.universityName) || 1,
        subject_id: parseInt(formData.subject) || 1,
        qualification: formData.qualification,
        duration: formData.duration ? parseInt(formData.duration) : null,
        duration_qty: formData.duration_qty ? parseInt(formData.duration_qty) : null,
        duration_type: formData.duration_type || null,
        yearly_fee: formData.yearlyFee ? parseFloat(formData.yearlyFee) : null,
        application_fee: formData.application_fee ? parseFloat(formData.application_fee) : null,
        languages: formData.language,
        about: formData.about,
        entry_requirments: formData.entry_requirments,
        curriculum: formData.curriculum,
        deadline: formData.deadline ? new Date(formData.deadline) : null,
        starting_date: formData.starting_date ? new Date(formData.starting_date) : null,
        review_detail: JSON.stringify(formData.reviews),
        rating_count: formData.rating_count ? parseInt(formData.rating_count) : 0,
        review_count: formData.review_count ? parseInt(formData.review_count) : 0,
        avg_review_value: formData.avg_review_value ? parseFloat(formData.avg_review_value) : 0.0,
        active: true,
        display: true,
        popular: false,
        sort_order: 0,
        scholarship: formData.scholarship || null,
      };

      if (typeof onSubmit === 'function' && initialData) {
        await onSubmit(payload);
      } else {
        const res = await fetch('/api/internal/course/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        
        if (res.ok) {
          // Show success SweetAlert
          await Swal.fire({
            icon: 'success',
            title: 'Success!',
            text: 'Course added successfully!',
            confirmButtonColor: '#0B6D76',
            confirmButtonText: 'OK'
          });
          router.push('/admin/course');
        } else {
          const errorData = await res.json();
          throw new Error(errorData.message || 'Failed to add course');
        }
      }
    } catch (error) {
      // Show error SweetAlert
      Swal.fire({
        icon: 'error',
        title: 'Error!',
        text: error.message || 'Failed to add course',
        confirmButtonColor: '#0B6D76',
        confirmButtonText: 'OK'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'GENERAL':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              {['courseName', 'duration', 'duration_qty', 'duration_type', 'yearlyFee', 'application_fee', 'language', 'deadline', 'starting_date', 'avg_review_value', 'review_count', 'rating_count', 'scholarship'].map((field) => (
                <div key={field} className="space-y-1">
                  <label className="block text-sm font-medium capitalize text-gray-700">
                    {field.replace(/([A-Z_])/g, ' $1').replace(/_/g, ' ')}
                  </label>
                  <input
                    name={field}
                    value={formData[field]}
                    onChange={handleChange}
                    className="w-full border px-3 py-2 rounded-lg text-sm md:text-base"
                    type={['yearlyFee', 'application_fee', 'duration', 'duration_qty', 'avg_review_value', 'review_count', 'rating_count'].includes(field) ? 'number' : 
                         (['deadline', 'starting_date'].includes(field) ? 'date' : 'text')}
                  />
                </div>
              ))}

              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">University</label>
                <select
                  name="universityName"
                  value={formData.universityName}
                  onChange={handleChange}
                  className="w-full border px-3 py-2 rounded-lg text-sm md:text-base"
                >
                  <option value="">Select University</option>
                  {universities.map((university) => (
                    <option key={university.id} value={university.id}>{university.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">Subject</label>
                <select
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  className="w-full border px-3 py-2 rounded-lg text-sm md:text-base"
                >
                  <option value="">Select Subject</option>
                  {subjects.map((subject) => (
                    <option key={subject.id} value={subject.id}>{subject.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">Qualification</label>
                <select
                  name="qualification"
                  value={formData.qualification}
                  onChange={handleChange}
                  className="w-full border px-3 py-2 rounded-lg text-sm md:text-base"
                >
                  <option value="">Select Qualification</option>
                  {levels.map((level) => (
                    <option key={level.id} value={level.id}>{level.title}</option>
                  ))}
                </select>
              </div>
            </div>

            
            {/* Reviews Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-800">Reviews</h3>
              {formData.reviews.map((item, index) => (
                <div className="space-y-3 p-3 border rounded-lg" key={index}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <input 
                      placeholder="Rating (1-5)" 
                      value={item.rating} 
                      onChange={(e) => handleReviewChange(index, 'rating', e.target.value)} 
                      className="w-full border px-3 py-2 rounded-lg text-sm" 
                      type="number" 
                      min="1" 
                      max="5" 
                    />
                    <input 
                      placeholder="Date" 
                      value={item.reviewDate} 
                      onChange={(e) => handleReviewChange(index, 'reviewDate', e.target.value)} 
                      className="w-full border px-3 py-2 rounded-lg text-sm" 
                      type="date" 
                    />
                    <input 
                      placeholder="Author's Name" 
                      value={item.authorName} 
                      onChange={(e) => handleReviewChange(index, 'authorName', e.target.value)} 
                      className="w-full border px-3 py-2 rounded-lg text-sm" 
                    />
                    <input 
                      placeholder="Publisher's Name" 
                      value={item.publisherName} 
                      onChange={(e) => handleReviewChange(index, 'publisherName', e.target.value)} 
                      className="w-full border px-3 py-2 rounded-lg text-sm" 
                    />
                    <input 
                      placeholder="Reviewer's Name" 
                      value={item.reviewerName} 
                      onChange={(e) => handleReviewChange(index, 'reviewerName', e.target.value)} 
                      className="w-full border px-3 py-2 rounded-lg text-sm" 
                    />
                    <textarea 
                      placeholder="Review Description" 
                      value={item.reviewDescription} 
                      onChange={(e) => handleReviewChange(index, 'reviewDescription', e.target.value)} 
                      className="w-full border px-3 py-2 rounded-lg text-sm md:col-span-2" 
                      rows={3}
                    />
                  </div>
                  <button 
                    type="button" 
                    onClick={() => removeReviewField(index)}
                    className="flex items-center text-red-600 text-sm"
                  >
                    <Trash2 className="w-4 h-4 mr-1" /> Remove Review
                  </button>
                </div>
              ))}
              <button 
                type="button" 
                onClick={addReviewField}
                className="flex items-center text-blue-600 text-sm"
              >
                <Plus className="w-4 h-4 mr-1" /> Add Review
              </button>
            </div>
          </div>
        );

      case 'ABOUT':
        return (
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700">About the Course</label>
            <SummernoteEditor
              value={formData.about}
              onChange={(content) => handleEditorChange('about', content)}
              key="about-editor"
            />
          </div>
        );

      case 'ENTRY REQUIREMENT':
        return (
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700">Entry Requirements</label>
            <SummernoteEditor
              value={formData.entry_requirments}
              onChange={(content) => handleEditorChange('entry_requirments', content)}
              key="entry-requirements-editor"
            />
          </div>
        );

      case 'CURRICULUM':
        return (
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700">Curriculum</label>
            <SummernoteEditor
              value={formData.curriculum}
              onChange={(content) => handleEditorChange('curriculum', content)}
              key="curriculum-editor"
            />
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <>
    <title>Add New Course - University Page</title>
    <meta name="description" content="Add a new course to the university page" />
      <form onSubmit={handleSubmit} className="min-h-screen flex flex-col md:flex-row bg-gray-100">
        {/* Mobile Menu Button */}
        <div className="md:hidden bg-white p-4 flex justify-between items-center border-b">
          <h2 className="text-xl font-bold text-gray-800">Add Course</h2>
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
                      setActiveTab(tab);
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
          <h2 className="text-xl font-bold mb-6 text-gray-800">{initialData ? 'Edit Course' : 'Add Course'}</h2>
          <ul className="space-y-2">
            {tabs.map((tab) => (
              <li key={tab}>
                <button
                  type="button"
                  onClick={() => setActiveTab(tab)}
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

            <div className="flex flex-col-reverse md:flex-row justify-end mt-8 gap-3">
              {onCancel ? (
                <button
                  type="button"
                  onClick={onCancel}
                  className="bg-gray-300 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-400 transition-colors"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => router.push('/admin/courses')}
                  className="bg-gray-300 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-400 transition-colors"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
              )}
              <button
                type="submit"
                className="bg-[#0B6D76] text-white px-4 py-2 rounded-lg hover:bg-teal-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    {initialData ? 'Updating...' : 'Saving...'}
                  </span>
                ) : (initialData ? 'Update Course' : 'Save Course')}
              </button>
            </div>
          </div>
        </div>
      </form>
    </>
  );
}