'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import Swal from 'sweetalert2';

const SummernoteEditor = dynamic(() => import('../../../components/organisms/SummernoteEditor'), { 
  ssr: false,
  loading: () => <p>Loading editor...</p>
});

const tabs = [
  'GENERAL',
  'MORE DETAIL',
  'IMAGES',
  'ABOUT UNIVERSITY',
  'GUIDE',
  'ACCOMMODATION',
  'EXPANSE',
];

// Helper function to safely parse JSON
const safeParse = (str) => {
  try {
    return typeof str === 'object' ? str : JSON.parse(str || '[]');
  } catch {
    return [];
  }
};

export default function AddUniversity() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('GENERAL');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [countries, setCountries] = useState([]);
  const [countriesLoading, setCountriesLoading] = useState(true);
  const [uploadedImages, setUploadedImages] = useState({
    logo: null,
    feature_image: null,
  });
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Reviews
  const [reviews, setReviews] = useState([
    {
      rating: 0,
      reviewDate: '',
      authorName: '',
      publisherName: '',
      reviewerName: '',
      reviewDescription: '',
    }
  ]);

  // Initialize form data
  const [formData, setFormData] = useState({
    name: '',
    founded_in: '',
    country: '',
    city: '',
    address: '',
    postcode: '',
    phone_no: '',
    agency_number: '',
    total_students: '',
    international_student: '',
    scholarship: '',
    about: '',
    guide: '',
    expanse: '',
    languages: '',
    accommodation: '',
    accommodation_detail: '',
    intake: '',
    ranking: '',
    designation: '',
    alternate_email: '',
    website: '',
    popular: false,
    review_detail: JSON.stringify([]),
    logo_url: '',
    feature_image_url: '',
  });

    useEffect(() => {
    async function fetchCountries() {
      try {
        setCountriesLoading(true);
        const res = await fetch('/api/internal/countries');
        if (!res.ok) throw new Error('Failed to fetch countries');
        const data = await res.json();
        console.log('Countries API response:', data); // Debug log
        
        // Ensure data is an array and handle different response structures
        if (Array.isArray(data)) {
          setCountries(data);
        } else if (data && Array.isArray(data.countries)) {
          setCountries(data.countries);
        } else if (data && Array.isArray(data.data)) {
          setCountries(data.data);
        } else {
          console.warn('Unexpected countries data structure:', data);
          setCountries([]);
        }
      } catch (err) {
        console.error('Failed to fetch countries:', err);
        setCountries([]); // Set empty array as fallback
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Failed to load countries. Please refresh the page.',
          confirmButtonColor: '#0B6D76'
        });
      } finally {
        setCountriesLoading(false);
      }
    }
    fetchCountries();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleEditorChange = (name, content) => {
    setFormData(prev => ({
      ...prev,
      [name]: content || '',
    }));
  };

  // Review Handlers
  const handleReviewChange = (index, field, value) => {
    const updatedReviews = [...reviews];
    updatedReviews[index][field] = value;
    setReviews(updatedReviews);
    setFormData(prev => ({
      ...prev,
      review_detail: JSON.stringify(updatedReviews),
    }));
  };

  const addReview = () => {
    setReviews([
      ...reviews,
      {
        rating: 0,
        reviewDate: '',
        authorName: '',
        publisherName: '',
        reviewerName: '',
        reviewDescription: '',
      }
    ]);
  };

  const removeReview = (index) => {
    if (reviews.length > 1) {
      const updatedReviews = [...reviews];
      updatedReviews.splice(index, 1);
      setReviews(updatedReviews);
      setFormData(prev => ({
        ...prev,
        review_detail: JSON.stringify(updatedReviews),
      }));
    }
  };

  const uploadImage = async (file, uploadType = 'university-logo') => {
    try {
      const formData = new FormData();
      formData.append('image', file);
      formData.append('uploadType', uploadType); // Add upload type for proper S3 path

      const response = await fetch('/api/internal/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to upload image');
      }

      const data = await response.json();
      return data.url;
    } catch (error) {
      console.error('Error uploading image:', error);
      throw error;
    }
  };

  const handleFileUpload = async (e, field) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setIsUploading(true);

      // Determine upload type based on field
      let uploadType = 'university-logo'; // default
      if (field === 'logo') uploadType = 'university-logo';
      else if (field === 'feature_image') uploadType = 'university-feature';
      
      const imageUrl = await uploadImage(file, uploadType);

      setUploadedImages(prev => ({
        ...prev,
        [field]: { file, url: imageUrl }
      }));
      setFormData(prev => ({
        ...prev,
        [`${field}_url`]: imageUrl,
        [field]: imageUrl // <-- ensure legacy field is also set
      }));
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Upload Error',
        text: error.message || 'Failed to upload image',
        confirmButtonColor: '#0B6D76'
      });
    } finally {
      setIsUploading(false);
    }
  };

  const removeImage = (index, field) => {
    
    setUploadedImages(prev => ({
      ...prev,
      [field]: null
    }));
    setFormData(prev => ({
      ...prev,
      [`${field}_url`]: ''
    }));

  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (!formData.name) {
        throw new Error('University name is required');
      }

      const submissionData = new FormData();
      
      // Append all form fields
      Object.entries(formData).forEach(([key, value]) => {
        if (typeof value === 'boolean') {
          submissionData.append(key, value ? 'true' : 'false');
        } else {
          submissionData.append(key, value || '');
        }
      });

      // Append numeric fields properly
      submissionData.set('total_students', parseInt(formData.total_students) || 0);
      submissionData.set('international_student', parseInt(formData.international_student) || 0);

      const response = await fetch('/api/internal/university', {
        method: 'POST',
        body: submissionData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.log('API Error Response:', errorData);
        
        if (errorData.details && Array.isArray(errorData.details)) {
          throw new Error(`Validation failed: ${errorData.details.join(', ')}`);
        } else {
          throw new Error(errorData.error || errorData.message || 'Failed to create university');
        }
      }

      Swal.fire({
        icon: 'success',
        title: 'Success!',
        text: 'University created successfully!',
        confirmButtonColor: '#0B6D76',
        showConfirmButton: true
      }).then(() => {
        // Redirect to university list instead of individual university page
        router.push('/admin/university');
      });
    } catch (err) {
      console.error('Error submitting form:', err);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: err.message || 'Something went wrong. Please try again.',
        confirmButtonColor: '#0B6D76'
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">University Name*</label>
                <input
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full border px-4 py-2 rounded-lg"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Country*</label>
                <select
                  name="country"
                  value={formData.country}
                  onChange={handleChange}
                  className="w-full border px-4 py-2 rounded-lg"
                  required
                  disabled={countriesLoading}
                >
                  <option value="">
                    {countriesLoading ? 'Loading countries...' : 'Select a country'}
                  </option>
                  {Array.isArray(countries) && countries.length > 0 ? (
                    countries.map((c, index) => (
                      <option key={index} value={c.country || c.country_name || c.name}>
                        {c.country || c.country_name || c.name}
                      </option>
                    ))
                  ) : !countriesLoading ? (
                    <option value="" disabled>No countries available</option>
                  ) : null}
                </select>
                {countriesLoading && (
                  <p className="text-xs text-gray-500 mt-1">Loading countries...</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                <input
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  className="w-full border px-4 py-2 rounded-lg"
                />
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  name="popular"
                  checked={formData.popular}
                  onChange={handleChange}
                  className="h-4 w-4"
                />
                <label className="text-sm">Mark as Popular University</label>
              </div>
            </div>
            
            {/* Reviews Section */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">University Reviews</h3>
                <button
                  type="button"
                  onClick={addReview}
                  className="bg-blue-500 text-white px-3 py-1 rounded text-sm"
                >
                  Add Review
                </button>
              </div>

              {reviews.map((review, index) => (
                <div key={index} className="p-4 border rounded-lg space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Rating</label>
                      <select
                        value={review.rating}
                        onChange={(e) => handleReviewChange(index, 'rating', e.target.value)}
                        className="w-full border px-3 py-2 rounded"
                      >
                        <option value="0">Select rating</option>
                        <option value="1">1 Star</option>
                        <option value="2">2 Stars</option>
                        <option value="3">3 Stars</option>
                        <option value="4">4 Stars</option>
                        <option value="5">5 Stars</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                      <input
                        type="date"
                        value={review.reviewDate}
                        onChange={(e) => handleReviewChange(index, 'reviewDate', e.target.value)}
                        className="w-full border px-3 py-2 rounded"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Author's Name</label>
                      <input
                        type="text"
                        value={review.authorName}
                        onChange={(e) => handleReviewChange(index, 'authorName', e.target.value)}
                        className="w-full border px-3 py-2 rounded"
                        placeholder="Author's name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Publisher's Name</label>
                      <input
                        type="text"
                        value={review.publisherName}
                        onChange={(e) => handleReviewChange(index, 'publisherName', e.target.value)}
                        className="w-full border px-3 py-2 rounded"
                        placeholder="Publisher's name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Reviewer's Name</label>
                      <input
                        type="text"
                        value={review.reviewerName}
                        onChange={(e) => handleReviewChange(index, 'reviewerName', e.target.value)}
                        className="w-full border px-3 py-2 rounded"
                        placeholder="Reviewer's name"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Review Description</label>
                    <textarea
                      value={review.reviewDescription}
                      onChange={(e) => handleReviewChange(index, 'reviewDescription', e.target.value)}
                      className="w-full border px-3 py-2 rounded"
                      rows={3}
                      placeholder="Review description"
                    />
                  </div>
                  {reviews.length > 1 && (
                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={() => removeReview(index)}
                        className="bg-red-500 text-white px-3 py-1 rounded text-sm"
                      >
                        Remove Review
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        );

      case 'MORE DETAIL':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
              <input
                name="address"
                value={formData.address}
                onChange={handleChange}
                className="w-full border px-4 py-2 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Postcode</label>
              <input
                name="postcode"
                value={formData.postcode}
                onChange={handleChange}
                className="w-full border px-4 py-2 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
              <input
                name="phone_no"
                value={formData.phone_no}
                onChange={handleChange}
                className="w-full border px-4 py-2 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Agency Number</label>
              <input
                name="agency_number"
                value={formData.agency_number}
                onChange={handleChange}
                className="w-full border px-4 py-2 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Founded In</label>
              <input
                name="founded_in"
                value={formData.founded_in}
                onChange={handleChange}
                className="w-full border px-4 py-2 rounded-lg"
                placeholder="e.g., 1990"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Total Students</label>
              <input
                type="number"
                name="total_students"
                value={formData.total_students}
                onChange={handleChange}
                className="w-full border px-4 py-2 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">International Students</label>
              <input
                type="number"
                name="international_student"
                value={formData.international_student}
                onChange={handleChange}
                className="w-full border px-4 py-2 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Scholarship</label>
              <input
                name="scholarship"
                value={formData.scholarship}
                onChange={handleChange}
                className="w-full border px-4 py-2 rounded-lg"
                placeholder="e.g., Available for international students"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Teaching Languages</label>
              <input
                name="languages"
                value={formData.languages}
                onChange={handleChange}
                className="w-full border px-4 py-2 rounded-lg"
                placeholder="e.g., English, Spanish"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Intake Periods</label>
              <input
                name="intake"
                value={formData.intake}
                onChange={handleChange}
                className="w-full border px-4 py-2 rounded-lg"
                placeholder="e.g., January, September"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Ranking</label>
              <input
                name="ranking"
                value={formData.ranking}
                onChange={handleChange}
                className="w-full border px-4 py-2 rounded-lg"
                placeholder="e.g., Top 100 worldwide"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Designation</label>
              <input
                name="designation"
                value={formData.designation}
                onChange={handleChange}
                className="w-full border px-4 py-2 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Alternate Email</label>
              <input
                type="email"
                name="alternate_email"
                value={formData.alternate_email}
                onChange={handleChange}
                className="w-full border px-4 py-2 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
              <input
                type="url"
                name="website"
                value={formData.website}
                onChange={handleChange}
                className="w-full border px-4 py-2 rounded-lg"
                placeholder="https://example.com"
              />
            </div>
          </div>
        );

      case 'IMAGES':
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">University Logo</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleFileUpload(e, 'logo')}
                className="block w-full text-sm text-gray-500
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-md file:border-0
                  file:text-sm file:font-semibold
                  file:bg-blue-50 file:text-blue-700
                  hover:file:bg-blue-100"
                disabled={isUploading}
              />
              {uploadedImages.logo && (
                <div className="mt-2">
                  <img
                    src={uploadedImages.logo.url}
                    alt="Logo preview"
                    className="h-20 object-contain"
                  />
                  <p className="text-xs text-gray-500 mt-1">{uploadedImages.logo.file.name}</p>
                  <button
                    type="button"
                    onClick={() => removeImage(0, 'logo')}
                    className="mt-1 text-red-600 text-sm"
                    disabled={isUploading}
                  >
                    Remove
                  </button>
                </div>
              )}
              {isUploading && !uploadedImages.logo && (
                <div className="mt-2 text-sm text-gray-500">Uploading logo...</div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Feature Image</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleFileUpload(e, 'feature_image')}
                className="block w-full text-sm text-gray-500
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-md file:border-0
                  file:text-sm file:font-semibold
                  file:bg-blue-50 file:text-blue-700
                  hover:file:bg-blue-100"
                disabled={isUploading}
              />
              {uploadedImages.feature_image && (
                <div className="mt-2">
                  <img
                    src={uploadedImages.feature_image.url}
                    alt="Feature image preview"
                    className="h-40 object-contain"
                  />
                  <p className="text-xs text-gray-500 mt-1">{uploadedImages.feature_image.file.name}</p>
                  <button
                    type="button"
                    onClick={() => removeImage(0, 'feature_image')}
                    className="mt-1 text-red-600 text-sm"
                    disabled={isUploading}
                  >
                    Remove
                  </button>
                </div>
              )}
              {isUploading && !uploadedImages.feature_image && (
                <div className="mt-2 text-sm text-gray-500">Uploading feature image...</div>
              )}
            </div>
          </div>
        );

      case 'ABOUT UNIVERSITY':
        return (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">About University</label>
            <SummernoteEditor
              value={formData.about}
              onChange={(content) => handleEditorChange('about', content)}
              key="about-editor"
            />
            <input
              type="hidden"
              name="about"
              value={formData.about}
            />
          </div>
        );

      case 'GUIDE':
        return (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">University Guide</label>
            <SummernoteEditor
              value={formData.guide}
              onChange={(content) => handleEditorChange('guide', content)}
              key="guide-editor"
            />
            <input
              type="hidden"
              name="guide"
              value={formData.guide}
            />
          </div>
        );

      case 'ACCOMMODATION':
        return (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Accommodation Information</label>
            <SummernoteEditor
              value={formData.accommodation}
              onChange={(content) => handleEditorChange('accommodation', content)}
              key="accommodation-editor"
            />
            <input
              type="hidden"
              name="accommodation"
              value={formData.accommodation}
            />
          </div>
        );

      case 'EXPANSE':
        return (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Costs and Expenses</label>
            <SummernoteEditor
              value={formData.expanse}
              onChange={(content) => handleEditorChange('expanse', content)}
              key="expanse-editor"
            />
            <input
              type="hidden"
              name="expanse"
              value={formData.expanse}
            />
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <form onSubmit={handleSubmit} className="min-h-screen flex flex-col md:flex-row bg-gray-100">
      {/* Mobile Menu Button */}
      <div className="md:hidden bg-white p-4 flex justify-between items-center border-b">
        <h2 className="text-xl font-bold text-gray-800">Add University</h2>
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

      {/* Sidebar - Mobile */}
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
                  disabled={isSubmitting || isUploading}
                >
                  {tab}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Sidebar - Desktop */}
      <div className="hidden md:block w-64 bg-white border-r shadow-lg p-6">
        <h2 className="text-xl font-bold mb-6 text-gray-800">Add University</h2>
        <ul className="space-y-2">
          {tabs.map((tab) => (
            <li key={tab}>
              <button
                type="button"
                onClick={() => setActiveTab(tab)}
                className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                  activeTab === tab ? 'bg-[#0B6D76] text-white' : 'hover:bg-gray-200'
                }`}
                disabled={isSubmitting || isUploading}
              >
                {tab}
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Content Area */}
      <div className="flex-1 p-4 md:p-10 bg-white">
        <div className="max-w-4xl mx-auto">

          {/* Mobile Tab Indicator */}
          <div className="md:hidden mb-6">
            <div className="bg-[#0B6D76] text-white px-4 py-2 rounded-lg">
              {activeTab}
            </div>
          </div>

          {renderContent()}

          <div className="flex flex-col-reverse md:flex-row justify-end mt-8 space-y-4 md:space-y-0 space-x-0 md:space-x-4">
            <button
              type="button"
              onClick={() => router.push('/university')}
              className="bg-gray-300 text-gray-800 px-6 py-2 rounded-lg hover:bg-gray-400 transition-colors"
              disabled={isSubmitting || isUploading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-[#0B6D76] text-white px-6 py-2 rounded-lg hover:bg-[#0a5c65] transition-colors disabled:opacity-50 disabled:cursor-not-allowed mb-4 md:mb-0"
              disabled={isSubmitting || isUploading}
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Saving...
                </span>
              ) : 'Save University'}
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}