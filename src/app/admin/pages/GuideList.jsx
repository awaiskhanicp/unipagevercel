


"use client";
import React, { useState, useEffect } from "react";
import Swal from 'sweetalert2';
import { Eye, Pencil, Trash2, X } from "lucide-react";
import SummernoteEditor from "../../../app/components/organisms/SummernoteEditor";
import Pagination from "../components/Pagination";

const GuideList = () => {
  const [guides, setGuides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [page, setPage] = useState(1);
  const [limit] = useState(15);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [featuredFilter, setFeaturedFilter] = useState("");
  const [activeFilter, setActiveFilter] = useState("");
  
  // Applied filters state (only updated when search button is clicked)
  const [appliedSearchTerm, setAppliedSearchTerm] = useState("");
  const [appliedStartDate, setAppliedStartDate] = useState("");
  const [appliedEndDate, setAppliedEndDate] = useState("");
  const [appliedFeaturedFilter, setAppliedFeaturedFilter] = useState("");
  const [appliedActiveFilter, setAppliedActiveFilter] = useState("");
  
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [universities, setUniversities] = useState([]); // Add universities state
  const [subjects, setSubjects] = useState([]); // Add subjects state
  const [isUploading, setIsUploading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadedImages, setUploadedImages] = useState("");
  
  const [formData, setFormData] = useState({
    type: "University",
    university_id: "",
    subject_id: "",
    title: "",
    slug: "",
    description: "",
    featuredImage: null,
    metaTags: false,
    metaTitle: "",
    metaDescription: "",
    metaKeywords: "",
    active: true,
    is_featured: false,
  });

  // Function to generate slug from title
  const generateSlug = (title) => {
    return title
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '') // Remove special characters except spaces and hyphens
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
      .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
  };

  const fetchGuides = async (p = 1) => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: p.toString(),
        limit: limit.toString()
      });
      
      if (appliedSearchTerm) {
        params.append('search', appliedSearchTerm);
      }
      if (appliedStartDate) {
        params.append('start_date', appliedStartDate);
      }
      if (appliedEndDate) {
        params.append('end_date', appliedEndDate);
      }
      if (appliedFeaturedFilter !== '') {
        params.append('featured', appliedFeaturedFilter);
      }
      if (appliedActiveFilter !== '') {
        params.append('active', appliedActiveFilter);
      }

      const apiUrl = `/api/internal/guides?${params.toString()}`;
      console.log('🔍 Frontend: Fetching guides with params:', params.toString());
      console.log('🔍 Frontend: Full API URL:', apiUrl);

      const startTime = Date.now();
      const response = await fetch(apiUrl);
      const responseTime = Date.now() - startTime;
      
      console.log('🔍 Frontend: Response status:', response.status);
      console.log('🔍 Frontend: Response time:', `${responseTime}ms`);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Frontend: API response not ok:', response.status, errorText);
        throw new Error(`API Error: ${response.status} - ${errorText}`);
      }
      
      const data = await response.json();
      
      console.log('🔍 Frontend: Guides API response:', data);
      console.log('🔍 Frontend: Response size:', `${JSON.stringify(data).length} bytes`);
      
      if (data.success) {
        const guidesData = data.data || [];
        const totalItems = data.meta?.totalItems || data.total || guidesData.length || 0;
        const totalPages = data.meta?.totalPages || Math.ceil(totalItems / limit) || 1;
        
        setGuides(guidesData);
        setTotalItems(totalItems);
        setTotalPages(totalPages);
        
        console.log('✅ Frontend: Successfully set guides data:', {
          guidesCount: guidesData.length,
          totalItems: totalItems,
          totalPages: totalPages,
          calculatedPages: Math.ceil(totalItems / limit)
        });
      } else {
        console.warn('⚠️ Frontend: API returned success: false:', data);
        // Fallback to array format if available
        const items = Array.isArray(data) ? data : data.data;
        if (items) {
          const totalItems = items.length;
          const totalPages = Math.ceil(totalItems / limit);
          
          setGuides(items);
          setTotalItems(totalItems);
          setTotalPages(totalPages);
          console.log('✅ Frontend: Fallback to array format successful:', {
            totalItems,
            totalPages,
            limit
          });
        } else {
          setGuides([]);
          setTotalItems(0);
          setTotalPages(1);
          console.warn('⚠️ Frontend: No data available, setting empty state');
        }
      }
    } catch (error) {
      console.error("❌ Frontend: Error fetching guides:", error);
      console.error("❌ Frontend: Error details:", {
        name: error.name,
        message: error.message,
        stack: error.stack
      });
      setGuides([]);
      setTotalItems(0);
      setTotalPages(1);
      
      // Show user-friendly error message
      if (error.message.includes('API Error')) {
        console.error('❌ Frontend: API Error detected');
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchdata = async () => {
    const [universitiesResponse, subjectsResponse] = await Promise.all([
      fetch('/api/internal/new/getuniversity', {
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
    ]);

    if(!universitiesResponse.ok || !subjectsResponse.ok) throw new Error('Failed to fetch data')

    const universityData = await universitiesResponse.json();
    const subjectsData = await subjectsResponse.json();

    setUniversities(universityData.data);
    setSubjects(subjectsData.data);

  }

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
      if (field === 'featured_image') uploadType = 'university-feature';
      
      const imageUrl = await uploadImage(file, uploadType);

      setUploadedImages(imageUrl);
      
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

  const removeImage = () => {
    
    setUploadedImages("");


  };

  useEffect(() => { 
    fetchGuides(page);
    fetchdata(); // Fetch universities when component mounts
  }, [page, appliedSearchTerm, appliedStartDate, appliedEndDate, appliedFeaturedFilter, appliedActiveFilter]);

  const handleSearch = () => {
    setAppliedSearchTerm(searchTerm);
    setAppliedStartDate(startDate);
    setAppliedEndDate(endDate);
    setAppliedFeaturedFilter(featuredFilter);
    setAppliedActiveFilter(activeFilter);
    setPage(1);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setStartDate('');
    setEndDate('');
    setFeaturedFilter('');
    setActiveFilter('');
    setAppliedSearchTerm('');
    setAppliedStartDate('');
    setAppliedEndDate('');
    setAppliedFeaturedFilter('');
    setAppliedActiveFilter('');
    setPage(1);
  };

  const hasActiveFilters = appliedSearchTerm || appliedStartDate || appliedEndDate || appliedFeaturedFilter !== '' || appliedActiveFilter !== '';

  // Helper functions to parse database fields
  const parseSchemaFromDatabase = (smQuestion, smAnswer) => {
    try {
      // Try to parse the schema from sm_question and sm_answer
      if (smQuestion && smAnswer) {
        const question = JSON.parse(smQuestion);
        const answer = JSON.parse(smAnswer);
        if (question && answer) {
          return [{ question, answer }];
        }
      }
      // Fallback to default structure
      return [{ question: "", answer: "" }];
    } catch (error) {
      console.warn('Failed to parse schema from database:', error);
      return [{ question: "", answer: "" }];
    }
  };

  const parseReviewsFromDatabase = (reviewDetail) => {
    try {
      if (reviewDetail) {
        // Try to parse the review_detail field
        const reviews = JSON.parse(reviewDetail);
        if (Array.isArray(reviews) && reviews.length > 0) {
          return reviews;
        }
      }
      // Fallback to default structure
      return [{
        rating: "",
        date: "",
        authorName: "",
        publisherName: "",
        reviewName: "",
        reviewDescription: "",
      }];
    } catch (error) {
      console.warn('Failed to parse reviews from database:', error);
      return [{
        rating: "",
        date: "",
        authorName: "",
        publisherName: "",
        reviewName: "",
        reviewDescription: "",
      }];
    }
  };

  const parseMetaTagsFromDatabase = (seo) => {
    try {
      if (seo) {
        const seoData = JSON.parse(seo);
        return seoData && (seoData.title || seoData.description || seoData.keywords);
      }
      return false;
    } catch (error) {
      console.warn('Failed to parse meta tags from database:', error);
      return false;
    }
  };

  const parseMetaTitleFromDatabase = (seo) => {
    try {
      if (seo) {
        const seoData = JSON.parse(seo);
        return seoData?.title || "";
      }
      return "";
    } catch (error) {
      console.warn('Failed to parse meta title from database:', error);
      return "";
    }
  };

  const parseMetaDescriptionFromDatabase = (seo) => {
    try {
      if (seo) {
        const seoData = JSON.parse(seo);
        return seoData?.description || "";
      }
      return "";
    } catch (error) {
      console.warn('Failed to parse meta description from database:', error);
      return "";
    }
  };

  const parseMetaKeywordsFromDatabase = (seo) => {
    try {
      if (seo) {
        const seoData = JSON.parse(seo);
        return seoData?.keywords || "";
      }
      return "";
    } catch (error) {
      console.warn('Failed to parse meta keywords from database:', error);
      return "";
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (e) {
      return 'N/A';
    }
  };

  const toggleFeatured = async (id) => {
    try {
      const currentGuide = guides.find((g) => g.id === id);
      const newFeaturedValue = !currentGuide?.is_featured;
      
      const response = await fetch(`/api/internal/guides?id=${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          is_featured: newFeaturedValue,
        }),
      });

      if (response.ok) {
        setGuides((prev) =>
          prev.map((g) =>
            g.id === id ? { ...g, is_featured: newFeaturedValue } : g
          )
        );
        await Swal.fire({ 
          icon: 'success', 
          title: 'Updated', 
          text: `Guide ${newFeaturedValue ? 'featured' : 'unfeatured'} successfully` 
        });
      }
    } catch (error) {
      console.error("Error updating guide:", error);
      await Swal.fire({ icon: 'error', title: 'Error', text: 'Failed to update guide' });
    }
  };

  const handleEditClick = (guide) => {

    setSelected(guide);
    setUploadedImages(guide.image)
    setFormData({
      type: guide.guide_type || "University",
      university_id: guide.university_id || "",
      subject_id: guide.subject_id || "",
      title: guide.title || "",
      slug: guide.slug || "",
      subTitle: guide.sub_title || "",
      sortOrder: guide.sort_order || "",
      description: guide.description || "",
      schema: parseSchemaFromDatabase(guide.sm_question, guide.sm_answer),
      reviews: parseReviewsFromDatabase(guide.review_detail),
      featuredImage: null,
      metaTags: parseMetaTagsFromDatabase(guide.seo),
      metaTitle: parseMetaTitleFromDatabase(guide.seo),
      metaDescription: parseMetaDescriptionFromDatabase(guide.seo),
      metaKeywords: parseMetaKeywordsFromDatabase(guide.seo),
      active: guide.is_active === 1,
      is_featured: guide.is_featured === 1,
    });
   
    
    setEditMode(true);
    setShowModal(true);
    fetchdata();
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    // Handle guide type change
    if (name === 'type') {
      setFormData(prev => ({
        ...prev,
        [name]: value,
        // Reset the ID when type changes
        university_id: "",
        subject_id: ""
      }));
      return;
    }
    
    // Auto-generate slug when title changes
    if (name === 'title') {
      const newSlug = generateSlug(value);
      setFormData(prev => ({
        ...prev,
        [name]: type === "checkbox" ? checked : value,
        slug: newSlug
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      }));
    }
  };

  
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {

      setIsLoading(true);

      const updateData = {
        title: formData.title,
        sub_title: formData.subTitle,
        guide_type: formData.type,
        description: formData.description,
        is_active: formData.active,
        is_featured: formData.is_featured,
        image: uploadedImages,
        slug: formData.slug,
        metaTags: formData.metaTags,
        metaTitle: formData.metaTitle,
        metaDescription: formData.metaDescription,
        metaKeywords: formData.metaKeywords,
        university_id: formData.university_id || null,
        subject_id: formData.subject_id || null,
      };

      console.log('Updating guide with data:', updateData);

      const response = await fetch(`/api/internal/guides?id=${selected.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updateData),
      });

      const responseData = await response.json();
      console.log('Update response:', responseData);

      if (response.ok && responseData.success) {
        // Refresh the guides list with the updated data
        fetchGuides(page);
        
        // Close modal and show success message
        setEditMode(false);
        setShowModal(false);
        
        await Swal.fire({ 
          icon: 'success', 
          title: 'Success!', 
          text: 'Guide updated successfully!',
          confirmButtonColor: '#10b981'
        });
      } else {
        // Show error message from API
        await Swal.fire({ 
          icon: 'error', 
          title: 'Update Failed', 
          text: responseData.message || 'Failed to update guide. Please try again.',
          confirmButtonColor: '#ef4444'
        });
      }
    } catch (error) {
      console.error("Error updating guide:", error);
      await Swal.fire({ 
        icon: 'error', 
        title: 'Network Error', 
        text: 'Failed to update guide. Please check your connection and try again.',
        confirmButtonColor: '#ef4444'
      });
    } finally{
      setIsLoading(false)
    }
  };

  const handleDelete = async (id) => {
    const confirmed = await Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!'
    });

    if (confirmed.isConfirmed) {
      try {
        const res = await fetch(`/api/internal/guides?id=${id}`, { method: 'DELETE' });
        const data = await res.json();

        if (res.ok && data.success) {
          // Refresh the current page data instead of filtering locally
          fetchGuides(page);
          await Swal.fire('Deleted!', 'Guide has been deleted.', 'success');
        } else {
          await Swal.fire('Error!', data.message || 'Failed to delete guide', 'error');
        }
      } catch (error) {
        console.error('Delete error:', error);
        await Swal.fire('Error!', 'Network error, please try again.', 'error');
      }
    }
  };

  if (loading) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-gray-500 text-lg">Loading guides...</div>
      </div>
    );
  }

  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + guides.length;

  return (
    <div className="p-4 sm:p-6 bg-gray-50 min-h-screen">
      <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-6 sm:mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-1">Guide List</h1>
            <p className="text-gray-600 text-sm sm:text-base">Manage and organize your guides</p>
          </div>
          <button
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
          >
            🔍 Filters {hasActiveFilters && `(${hasActiveFilters})`}
          </button>
        </div>

        {/* Filter Section */}
        {isFilterOpen && (
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Search Guides</label>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  placeholder="Search by title, type, subtitle..."
                  className="w-full p-2 border rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full p-2 border rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full p-2 border rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Featured</label>
                <select
                  value={featuredFilter}
                  onChange={(e) => setFeaturedFilter(e.target.value)}
                  className="w-full p-2 border rounded"
                >
                  <option value="">All</option>
                  <option value="true">Featured</option>
                  <option value="false">Not Featured</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Active</label>
                <select
                  value={activeFilter}
                  onChange={(e) => setActiveFilter(e.target.value)}
                  className="w-full p-2 border rounded"
                >
                  <option value="">All</option>
                  <option value="true">Active</option>
                  <option value="false">Inactive</option>
                </select>
              </div>
              <div className="flex items-end gap-2 sm:col-span-2 lg:col-span-5">
                <button 
                  onClick={handleSearch} 
                  className="px-4 py-2 bg-teal-600 text-white rounded hover:bg-teal-700 flex items-center gap-2"
                >
                  🔍 Search
                </button>
                <button 
                  onClick={clearFilters} 
                  className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                >
                  Clear Filters
                </button>
              </div>
            </div>

            {/* Active Filters Display */}
            {(appliedSearchTerm || appliedStartDate || appliedEndDate || appliedFeaturedFilter !== '' || appliedActiveFilter !== '') && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="text-sm text-gray-600">
                  Active filters: 
                  {appliedSearchTerm && <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 rounded">Search: "{appliedSearchTerm}"</span>}
                  {appliedStartDate && <span className="ml-2 px-2 py-1 bg-orange-100 text-orange-800 rounded">From: {formatDate(appliedStartDate)}</span>}
                  {appliedEndDate && <span className="ml-2 px-2 py-1 bg-yellow-100 text-yellow-800 rounded">To: {formatDate(appliedEndDate)}</span>}
                  {appliedFeaturedFilter !== '' && <span className="ml-2 px-2 py-1 bg-purple-100 text-purple-800 rounded">Featured: {appliedFeaturedFilter === 'true' ? 'Yes' : 'No'}</span>}
                  {appliedActiveFilter !== '' && <span className="ml-2 px-2 py-1 bg-green-100 text-green-800 rounded">Active: {appliedActiveFilter === 'true' ? 'Yes' : 'No'}</span>}
                </div>
              </div>
            )}
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="min-w-[1200px] w-full text-xs sm:text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="py-3 px-4 text-left font-semibold text-gray-600 rounded-l-xl">Image</th>
                <th className="py-3 px-4 text-left font-semibold text-gray-600">Title</th>
                <th className="py-3 px-4 text-left font-semibold text-gray-600">Type</th>
                <th className="py-3 px-4 text-center font-semibold text-gray-600">Active</th>
                <th className="py-3 px-4 text-center font-semibold text-gray-600">Featured</th>
                <th className="py-3 px-4 text-left font-semibold text-gray-600">Created At</th>
                <th className="py-3 px-4 text-center font-semibold text-gray-600 rounded-r-xl">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {guides.map((guide) => (
                <tr key={guide.id} className="hover:bg-gray-50">
                  <td className="py-3 px-4">
                    {guide.image ? (
                      <img
                        src={guide.image}
                        alt={guide.title}
                        className="w-10 h-10 sm:w-12 sm:h-12 object-cover rounded"
                      />
                    ) : (
                      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-200 rounded flex items-center justify-center text-gray-500 text-xs">
                        No Image
                      </div>
                    )}
                  </td>
                  <td className="py-3 px-4 font-medium text-gray-800">{guide.title}</td>
                  <td className="py-3 px-4 text-gray-600">{guide.guide_type}</td>
                  <td className="py-3 px-4 text-center">
                    <span
                      className={
                        guide.is_active
                          ? "text-green-600 font-semibold"
                          : "text-red-600 font-semibold"
                      }
                    >
                      {guide.is_active ? "Yes" : "No"}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <input
                      type="checkbox"
                      checked={guide.is_featured || false}
                      onChange={() => toggleFeatured(guide.id)}
                      className="w-4 h-4 accent-teal-600"
                    />
                  </td>
                  <td className="py-3 px-4 text-gray-600">
                    {formatDate(guide.created_at)}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <div className="flex justify-center gap-2">
                      <button
                        onClick={() => {
                          setSelected(guide);
                          setShowModal(true);
                          setEditMode(false);
                        }}
                        className="text-blue-600 hover:text-blue-800"
                        title="View"
                      >
                        <Eye className="w-4 h-4 sm:w-5 sm:h-5" />
                      </button>
                      <button
                        onClick={() => handleEditClick(guide)}
                        className="text-green-600 hover:text-green-800"
                        title="Edit"
                      >
                        <Pencil className="w-4 h-4 sm:w-5 sm:h-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(guide.id)}
                        className="text-red-600 hover:text-red-800"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4 sm:w-5 sm:h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {guides.length === 0 && !loading && (
            <div className="text-center py-12 text-gray-500 text-lg">
              {hasActiveFilters ? 'No guides found matching your filters.' : 'No guides available.'}
            </div>
          )}



          {/* Pagination Component */}
          {(totalPages > 1 || totalItems > limit) && (
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              onPageChange={setPage}
              totalItems={totalItems}
              startIndex={startIndex}
              endIndex={endIndex}
            />
          )}
        </div>
      </div>

      {/* Modal */}
      {showModal && selected && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white/95 backdrop-blur rounded-xl p-4 sm:p-6 w-full max-w-4xl relative max-h-[90vh] overflow-y-auto shadow-xl">
            <button
              onClick={() => {
                setShowModal(false);
                setSelected(null);
                setEditMode(false);
              }}
              className="absolute top-2 right-3 text-gray-500 hover:text-black"
            >
              <X className="w-5 h-5" />
            </button>
            
            <h2 className="text-lg sm:text-xl font-bold mb-4">
              {editMode ? "Edit Guide" : "Guide Details"}
            </h2>

            {editMode ? (
              <form onSubmit={handleSubmit} className="space-y-6">
              

                {/* Guide Type */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium">Guide Type</label>
                    <select
                      name="type"
                      value={formData.type}
                      onChange={handleInputChange}
                      className="w-full border px-3 py-2 rounded"
                    >
                      <option value="University">University</option>
                      <option value="Subject">Subject</option>
                    </select>
                  </div>
                  {formData.type === "University" && (
                    <div>
                      <label className="block text-sm font-medium">University</label>
                      <select
                        name="university_id"
                        value={formData.university_id}
                        onChange={handleInputChange}
                        className="w-full border px-3 py-2 rounded"
                      >
                        <option value="">Select University</option>
                        {universities.map((uni) => (
                          <option key={uni.id} value={uni.id}>
                            {uni.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                  {formData.type === "Subject" && (
                    <div>
                      <label className="block text-sm font-medium">Subject</label>
                      <select
                        name="subject_id"
                        value={formData.subject_id}
                        onChange={handleInputChange}
                        className="w-full border px-3 py-2 rounded"
                      >
                        <option value="">Select Subject</option>
                        {subjects.map((sub) => (
                          <option key={sub.id} value={sub.id}>
                            {sub.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>

                {/* Title / Slug */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium">Title *</label>
                    <label className="block text-sm font-medium">Title *</label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      className="w-full border px-3 py-2 rounded"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium">Slug (Auto-generated)</label>
                    <input
                      type="text"
                      name="slug"
                      value={formData.slug}
                      onChange={handleInputChange}
                      className="w-full border px-3 py-2 rounded bg-gray-50"
                      placeholder="Auto-generated from title"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Slug is automatically generated from the title. You can edit it manually if needed.
                    </p>
                  </div>
                </div>

                
                {/* Summernote Description */}
                <div>
                  <label className="block text-sm font-medium">Description</label>
                  <SummernoteEditor
                    value={formData.description}
                    onChange={(val) => setFormData({ ...formData, description: val })}
                  />
                </div>

                {/* Featured Image */}
                <div>
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Featured Image</label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileUpload(e, 'featured')}
                        className="block w-full text-sm text-gray-500
                          file:mr-4 file:py-2 file:px-4
                          file:rounded-md file:border-0
                          file:text-sm file:font-semibold
                          file:bg-blue-50 file:text-blue-700
                          hover:file:bg-blue-100"
                        disabled={isUploading}
                      />
                      {uploadedImages && (
                        <div className="mt-2">
                          <img
                            src={uploadedImages}
                            alt="Logo preview"
                            className="h-20 object-contain"
                          />
                          
                          <button
                            type="button"
                            onClick={() => removeImage()}
                            className="mt-1 text-red-600 text-sm"
                            disabled={isUploading}
                          >
                            Remove
                          </button>
                        </div>
                      )}
                      {isUploading && !uploadedImages && (
                        <div className="mt-2 text-sm text-gray-500">Uploading Image...</div>
                      )}
                    </div>
                  </div>
                </div>


                {/* Reviews */}
         

                {/* Meta Tags */}
                <div>
                  <label className="flex items-center space-x-2 text-sm">
                    <input
                      type="checkbox"
                      name="metaTags"
                      checked={formData.metaTags}
                      onChange={handleInputChange}
                    />
                    <span>Enable Meta Tags</span>
                  </label>
                </div>
                {formData.metaTags && (
                  <div className="space-y-2">
                    <input
                      type="text"
                      name="metaTitle"
                      value={formData.metaTitle}
                      onChange={handleInputChange}
                      placeholder="Meta Title"
                      className="w-full border px-3 py-2 rounded"
                    />
                    <textarea
                      name="metaDescription"
                      value={formData.metaDescription}
                      onChange={handleInputChange}
                      placeholder="Meta Description"
                      className="w-full border px-3 py-2 rounded"
                      rows="3"
                    />
                    <input
                      type="text"
                      name="metaKeywords"
                      value={formData.metaKeywords}
                      onChange={handleInputChange}
                      placeholder="Meta Keywords (comma separated)"
                      className="w-full border px-3 py-2 rounded"
                    />
                  </div>
                )}

                {/* Active & Featured Checkboxes */}
                <div className="flex items-center gap-4">
                  <label className="flex items-center space-x-2 text-sm">
                    <input
                      type="checkbox"
                      name="active"
                      checked={formData.active}
                      onChange={handleInputChange}
                    />
                    <span>Active</span>
                  </label>
                  
                </div>

                {/* Submit Buttons */}
                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setEditMode(false)}
                    className="px-4 py-2 border rounded hover:bg-gray-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-teal-600 text-white rounded hover:bg-teal-700"
                    disabled={isLoading}
                  >
                    {isLoading ? "Updating..." : "Save Changes"}
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-2 text-xs sm:text-sm">
                {selected.image && (
                  <img
                    src={selected.image}
                    alt={selected.title}
                    className="w-full h-32 sm:h-40 object-cover rounded mb-4"
                  />
                )}
                <p><strong>Title:</strong> {selected.title}</p>
                <p><strong>Type:</strong> {selected.guide_type}</p>
                <p><strong>Sub Title:</strong> {selected.sub_title || "N/A"}</p>
                <p><strong>Slug:</strong> {selected.slug || "N/A"}</p>
                <p><strong>Active:</strong> {selected.is_active ? "Yes" : "No"}</p>
                <p><strong>Featured:</strong> {selected.is_featured ? "Yes" : "No"}</p>
                <p><strong>Created:</strong> {formatDate(selected.created_at)}</p>
                {selected.description && (
                  <div>
                    <strong>Description:</strong>
                    <div
                      className="mt-1 text-gray-600 max-h-20 overflow-y-auto text-[11px] sm:text-xs"
                      dangerouslySetInnerHTML={{
                        __html: selected.description.substring(0, 200) + "...",
                      }}
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default GuideList;