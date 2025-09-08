

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import Pagination from '../../components/Pagination';
import Swal from 'sweetalert2';

const SummernoteEditor = dynamic(() => import('../../../components/organisms/SummernoteEditor'), { 
  ssr: false,
  loading: () => <p>Loading editor...</p>
});

const editTabs = [
  'GENERAL',
  'MORE DETAIL',
  'ABOUT UNIVERSITY',
  'GUIDE',
  'ACCOMMODATION',
  'EXPANSE',
];

export default function UniversityList() {
  const [universities, setUniversities] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingUniversity, setEditingUniversity] = useState(null);
  const [activeEditTab, setActiveEditTab] = useState('GENERAL');
  const [editForm, setEditForm] = useState({
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
    sm_question: '[]',
    sm_answer: '[]',
    review_detail: '[]',
    logo_url: '',
    feature_image_url: '',
    other_images_urls: '[]',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15; // Increased to show more universities per page
  
  // Search and filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCountry, setFilterCountry] = useState('');
  const [filterPopular, setFilterPopular] = useState('');
  const [filterYear, setFilterYear] = useState('');
  
  // Filter visibility state
  const [showFilters, setShowFilters] = useState(false);
  
  // Applied filters state (only applied when search button is clicked)
  const [appliedFilters, setAppliedFilters] = useState({
    search: '',
    country: '',
    popular: '',
    year: ''
  });
  
  // Pagination states
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  
  // Get unique countries for filter dropdown
  const uniqueCountries = [...new Set(universities.map(uni => uni.country).filter(Boolean))];
  
  // Filter universities based on APPLIED filters only (not live filtering)
  const filteredUniversities = universities.filter(uni => {
    const matchesSearch = !appliedFilters.search || 
      uni.name?.toLowerCase().includes(appliedFilters.search.toLowerCase()) ||
      uni.city?.toLowerCase().includes(appliedFilters.search.toLowerCase()) ||
      uni.country?.toLowerCase().includes(appliedFilters.search.toLowerCase()) ||
      uni.address?.toLowerCase().includes(appliedFilters.search.toLowerCase());
    
    const matchesCountry = !appliedFilters.country || uni.country === appliedFilters.country;
    const matchesPopular = appliedFilters.popular === '' || 
      (appliedFilters.popular === 'true' && uni.popular) || 
      (appliedFilters.popular === 'false' && !uni.popular);
    const matchesYear = !appliedFilters.year || uni.founded_in?.includes(appliedFilters.year);
    
    return matchesSearch && matchesCountry && matchesPopular && matchesYear;
  });
  
  // Calculate pagination for filtered results
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedUniversities = filteredUniversities.slice(startIndex, endIndex);

  useEffect(() => {
    const fetchUniversities = async () => {
      try {
        setIsLoading(true);
        // Fetch all universities with a high limit to get most of them
        const response = await fetch('/api/internal/university?page=1&limit=2000');
        if (!response.ok) throw new Error('Failed to fetch universities');
        const data = await response.json();
        
        if (data.success) {
          console.log('Fetched universities:', data.data?.length || 0, 'Total in database:', data.pagination?.totalItems || 0);
          setUniversities(data.data || []);
          setTotalItems(data.pagination?.totalItems || data.data?.length || 0);
          setTotalPages(data.pagination?.totalPages || 1);
        } else {
          // Fallback to old format if API doesn't return success
          setUniversities(data.data || data || []);
          setTotalItems(data.data?.length || data?.length || 0);
          setTotalPages(1);
        }
      } catch (error) {
        console.error('Error fetching universities:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Failed to load universities',
          confirmButtonColor: '#0B6D76'
        });
      } finally {
        setIsLoading(false);
      }
    };
    fetchUniversities();
  }, []);

  // Reset to first page when applied filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [appliedFilters]);

  // Function to apply filters when search button is clicked
  const applyFilters = () => {
    setAppliedFilters({
      search: searchTerm,
      country: filterCountry,
      popular: filterPopular,
      year: filterYear
    });
    setCurrentPage(1); // Reset to first page
  };

  // Function to clear all filters
  const clearFilters = () => {
    setSearchTerm('');
    setFilterCountry('');
    setFilterPopular('');
    setFilterYear('');
    setAppliedFilters({
      search: '',
      country: '',
      popular: '',
      year: ''
    });
    setCurrentPage(1);
  };

  // Function to load more universities if needed
  const loadMoreUniversities = async () => {
    if (isLoadingMore || universities.length >= totalItems) return;
    
    try {
      setIsLoadingMore(true);
      const nextPage = Math.floor(universities.length / itemsPerPage) + 1;
      const response = await fetch(`/api/internal/university?page=${nextPage}&limit=${itemsPerPage}`);
      
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data) {
          // Append new universities to existing list
          setUniversities(prev => [...prev, ...data.data]);
          console.log('Loaded more universities:', data.data.length, 'Total now:', universities.length + data.data.length);
        }
      }
    } catch (error) {
      console.error('Error loading more universities:', error);
    } finally {
      setIsLoadingMore(false);
    }
  };

  const handleEditClick = (university) => {
    // Helper function to safely handle JSON fields
    const safeJsonField = (field) => {
      if (!field) return '[]';
      if (typeof field === 'string') return field;
      if (typeof field === 'object') return JSON.stringify(field);
      return '[]';
    };

    setEditingUniversity(university);
    setEditForm({
      name: university.name || '',
      founded_in: university.founded_in || '',
      country: university.country || '',
      city: university.city || '',
      address: university.address || '',
      postcode: university.postcode || '',
      phone_no: university.phone_no || '',
      agency_number: university.agency_number || '',
      total_students: university.total_students || '',
      international_student: university.international_student || '',
      scholarship: university.scholarship || '',
      about: university.about || '',
      guide: university.guide || '',
      expanse: university.expanse || '',
      languages: university.languages || '',
      accommodation: university.accommodation || '',
      accommodation_detail: university.accommodation_detail || '',
      intake: university.intake || '',
      ranking: university.ranking || '',
      designation: university.designation || '',
      alternate_email: university.alternate_email || '',
      website: university.website || '',
      popular: university.popular || false,
      sm_question: safeJsonField(university.sm_question),
      sm_answer: safeJsonField(university.sm_answer),
      review_detail: safeJsonField(university.review_detail),
      logo_url: university.logo_url || '',
      feature_image_url: university.feature_image_url || '',
      other_images_urls: safeJsonField(university.other_images_urls),
    });
    setActiveEditTab('GENERAL');
    setShowEditModal(true);
  };



  const handleDelete = async (id) => {
    const confirmDelete = await Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc3545',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel',
    });

    if (confirmDelete.isConfirmed) {
      try {
                 const response = await fetch(`/api/internal/university/${id}`, { method: 'DELETE' });
         if (!response.ok) {
           const errorData = await response.json();
           throw new Error(errorData.error || errorData.message || 'Failed to delete university');
         }

         setUniversities(universities.filter(uni => uni.id !== id));
         Swal.fire({
           icon: 'success',
           title: 'Deleted!',
           text: 'University has been deleted.',
           confirmButtonColor: '#0B6D76'
         });
             } catch (error) {
         console.error('Error deleting university:', error);
         Swal.fire({
           icon: 'error',
           title: 'Error!',
           text: 'Failed to delete university',
           confirmButtonColor: '#0B6D76'
         });
       }
    }
  };

  const handleEditChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEditForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleEditEditorChange = (name, content) => {
    setEditForm(prev => ({
      ...prev,
      [name]: content || '',
    }));
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    
    if (!editForm.name.trim()) {
      Swal.fire({
        icon: 'error',
        title: 'Validation Error',
        text: 'University name is required',
        confirmButtonColor: '#0B6D76'
      });
      return;
    }

    setIsSubmitting(true);
    try {
      // Debug: Log what's being sent
      const updateData = {
        name: editForm.name.trim(),
        founded_in: editForm.founded_in.trim() || null,
        country: editForm.country.trim() || null,
        city: editForm.city.trim() || null,
        address: editForm.address.trim() || null,
        postcode: editForm.postcode.trim() || null,
        phone_no: editForm.phone_no.trim() || null,
        agency_number: editForm.agency_number.trim() || null,
        total_students: editForm.total_students && editForm.total_students.trim() !== '' ? parseInt(editForm.total_students) : null,
        international_student: editForm.international_student && editForm.international_student.trim() !== '' ? parseInt(editForm.international_student) : null,
        scholarship: editForm.scholarship === 'true' || editForm.scholarship === true,
        about: editForm.about.trim() || null,
        guide: editForm.guide.trim() || null,
        expanse: editForm.expanse.trim() || null,
        languages: editForm.languages.trim() || null,
        accommodation: editForm.accommodation.trim() || null,
        accommodation_detail: editForm.accommodation_detail.trim() || null,
        intake: editForm.intake.trim() || null,
        ranking: editForm.ranking && editForm.ranking.trim() !== '' ? parseFloat(editForm.ranking) : null,
        designation: editForm.designation.trim() || null,
        alternate_email: editForm.alternate_email.trim() || null,
        website: editForm.website.trim() || null,
        popular: editForm.popular,
        sm_question: editForm.sm_question,
        sm_answer: editForm.sm_answer,
        review_detail: editForm.review_detail,
        logo_url: editForm.logo_url || null,
        feature_image_url: editForm.feature_image_url || null,
        other_images_urls: editForm.other_images_urls,
      };
      
      console.log('Sending update data:', updateData);
      console.log('Edit form state:', editForm);
      console.log('Editing university ID:', editingUniversity.id);
      
      const response = await fetch(`/api/internal/university/${editingUniversity.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.log('Update error response:', errorData);
        throw new Error(errorData.error || errorData.message || 'Failed to update university');
      }

      const updatedUniversity = await response.json();
      
      // Update the university in the local state
      setUniversities(universities.map(uni => 
        uni.id === editingUniversity.id ? {
          ...uni,
          name: editForm.name.trim(),
          founded_in: editForm.founded_in.trim(),
          country: editForm.country.trim(),
          city: editForm.city.trim(),
          address: editForm.address.trim(),
          postcode: editForm.postcode.trim(),
          phone_no: editForm.phone_no.trim(),
          agency_number: editForm.agency_number.trim(),
          total_students: parseInt(editForm.total_students) || 0,
          international_student: parseInt(editForm.international_student) || 0,
          scholarship: editForm.scholarship.trim(),
          about: editForm.about.trim(),
          guide: editForm.guide.trim(),
          expanse: editForm.expanse.trim(),
          languages: editForm.languages.trim(),
          accommodation: editForm.accommodation.trim(),
          accommodation_detail: editForm.accommodation_detail.trim(),
          intake: editForm.intake.trim(),
          ranking: editForm.ranking.trim(),
          designation: editForm.designation.trim(),
          alternate_email: editForm.alternate_email.trim(),
          website: editForm.website.trim(),
          popular: editForm.popular,
          sm_question: editForm.sm_question,
          sm_answer: editForm.sm_answer,
          review_detail: editForm.review_detail,
          logo_url: editForm.logo_url,
          feature_image_url: editForm.feature_image_url,
          other_images_urls: editForm.other_images_urls,
        } : uni
      ));

              setShowEditModal(false);
        setEditingUniversity(null);
        setActiveEditTab('GENERAL');
        setEditForm({
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
          sm_question: '[]',
          sm_answer: '[]',
          review_detail: '[]',
          logo_url: '',
          feature_image_url: '',
          other_images_urls: '[]',
        });
      
      Swal.fire({
        icon: 'success',
        title: 'Success',
        text: 'University updated successfully',
        confirmButtonColor: '#0B6D76'
      });
    } catch (error) {
      console.error('Error updating university:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to update university',
        confirmButtonColor: '#0B6D76'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTogglePopular = async (id, currentStatus) => {
    try {
      const response = await fetch(`/api/internal/university/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ popular: !currentStatus }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || errorData.message || 'Failed to update university');
      }

      const updatedUniversity = await response.json();
      setUniversities(universities.map(uni => uni.id === id ? updatedUniversity : uni));
      Swal.fire({
        icon: 'success',
        title: 'Success',
        text: 'University status updated successfully',
        confirmButtonColor: '#0B6D76',
        timer: 2000,
        showConfirmButton: false
      });
    } catch (error) {
      console.error('Error updating university:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to update university status',
        confirmButtonColor: '#0B6D76'
      });
    }
  };

  if (isLoading) {
    return (
      <div className="p-4 sm:p-6 bg-gradient-to-br from-purple-50 to-pink-100 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-t-2 border-b-2 border-[#0B6D76] mx-auto"></div>
          <p className="mt-4 text-gray-600 text-sm sm:text-base">Loading universities...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 bg-gradient-to-br from-purple-50 to-pink-100 min-h-screen relative">
      <div className="bg-white rounded-2xl shadow-xl p-4 sm:p-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between gap-4 sm:items-center mb-6 sm:mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">Universities</h1>
            <p className="text-gray-600 text-sm sm:text-base">Manage university listings and information</p>
          </div>
          <div className="flex items-center gap-3">
            {/* Filter Toggle Button */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-xl flex items-center justify-center space-x-2 transition-all duration-200"
            >
              <span className="text-lg">🔍</span>
              <span>Filters</span>
            </button>
            
            {/* Add University Button */}
            <Link 
              href="/admin/university/add"
              className="bg-[#0B6D76] hover:bg-[#094F56] text-white px-4 sm:px-6 py-2 sm:py-3 rounded-xl flex items-center justify-center space-x-2 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              <span className="text-lg sm:text-xl">➕</span>
              <span>Add University</span>
            </Link>
          </div>
        </div>

        {/* Simple Status Indicator */}
        <div className="mb-4 text-sm text-gray-600 text-center">
          <span className="font-medium">📊</span> 
          <span className="ml-2">
            {filteredUniversities.length === universities.length 
              ? `Showing all ${universities.length} universities` 
              : `Showing ${filteredUniversities.length} of ${universities.length} universities (filtered)`
            }
          </span>
        </div>

        {/* Search and Filter Section - Hidden by default */}
        {showFilters && (
          <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              {/* Search Input */}
              <div className="lg:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Search Universities</label>
                <input
                  type="text"
                  placeholder="Search by name, city, country, or address..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0B6D76] focus:border-transparent"
                />
              </div>
              
              {/* Country Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Country</label>
                <select
                  value={filterCountry}
                  onChange={(e) => setFilterCountry(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0B6D76] focus:border-transparent"
                >
                  <option value="">All Countries</option>
                  {uniqueCountries.map((country) => (
                    <option key={country} value={country}>
                      {country}
                    </option>
                  ))}
                </select>
              </div>
              
              {/* Popular Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Popular Status</label>
                <select
                  value={filterPopular}
                  onChange={(e) => setFilterPopular(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0B6D76] focus:border-transparent"
                >
                  <option value="">All Status</option>
                  <option value="true">Popular Only</option>
                  <option value="false">Not Popular</option>
                </select>
              </div>
              
              {/* Year Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Founded Year</label>
                <input
                  type="text"
                  placeholder="e.g., 1990"
                  value={filterYear}
                  onChange={(e) => setFilterYear(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0B6D76] focus:border-transparent"
                />
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-200">
              <div className="flex gap-3">
                <button
                  onClick={applyFilters}
                  className="px-6 py-2 bg-[#0B6D76] text-white rounded-lg hover:bg-[#094F56] transition-colors"
                >
                  🔍 Search
                </button>
                <button
                  onClick={clearFilters}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Clear Filters
                </button>
              </div>
              
              {/* Active Filters Display */}
              {(appliedFilters.search || appliedFilters.country || appliedFilters.popular !== '' || appliedFilters.year) && (
                <div className="text-sm text-gray-600">
                  Active filters: 
                  {appliedFilters.search && <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 rounded">Search: "{appliedFilters.search}"</span>}
                  {appliedFilters.country && <span className="ml-2 px-2 py-1 bg-green-100 text-green-800 rounded">Country: {appliedFilters.country}</span>}
                  {appliedFilters.popular !== '' && <span className="ml-2 px-2 py-1 bg-purple-100 text-purple-800 rounded">Popular: {appliedFilters.popular === 'true' ? 'Yes' : 'No'}</span>}
                  {appliedFilters.year && <span className="ml-2 px-2 py-1 bg-orange-100 text-orange-800 rounded">Year: {appliedFilters.year}</span>}
                </div>
              )}
            </div>
            
            {/* Results Summary */}
            <div className="mt-4 text-sm text-gray-600">
              Showing {startIndex + 1}-{Math.min(endIndex, filteredUniversities.length)} of {filteredUniversities.length} universities
              {appliedFilters.search || appliedFilters.country || appliedFilters.popular !== '' || appliedFilters.year ? (
                <span className="ml-2 text-blue-600">
                  (filtered from {universities.length} total)
                </span>
              ) : (
                <span className="ml-2 text-gray-500">
                  (all universities)
                </span>
              )}
            </div>
          </div>
        )}

        {/* Table */}
        <div className="overflow-x-auto">
          <div className="overflow-x-auto max-x-[350px] w-full">
            <table className=" overflow-x-auto max-x-[350px] w-full sm:min-w-full bg-white border border-gray-200 rounded-xl text-sm sm:text-base">
              <thead className="sticky top-0 bg-white z-10">
                <tr>
                  <th className="py-2 sm:py-3 px-3 sm:px-4 border-b text-left">Name</th>
                  <th className="py-2 sm:py-3 px-3 sm:px-4 border-b text-left">Location</th>
                  <th className="py-2 sm:py-3 px-3 sm:px-4 border-b text-center">Popular</th>
                  <th className="py-2 sm:py-3 px-3 sm:px-4 border-b text-center">Created At</th>
                  <th className="py-2 sm:py-3 px-3 sm:px-4 border-b text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {paginatedUniversities.map((uni) => (
                  <tr key={uni.id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-2 px-3 border-b font-medium text-gray-800">
                      <Link href={`/university/${uni.id}`} className="hover:underline">
                        {uni.name}
                      </Link>
                    </td>
                    <td className="py-2 px-3 border-b text-gray-600">
                      {uni.city && uni.country ? `${uni.city}, ${uni.country}` : '-'}
                    </td>
                    <td className="py-2 px-3 border-b text-center">
                      {/* Toggle Switch */}
                      <label className="inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={!!uni.popular}
                          onChange={() => handleTogglePopular(uni.id, uni.popular)}
                          className="sr-only peer"
                        />
                        <div className="w-9 sm:w-11 h-5 sm:h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[#0B6D76] rounded-full peer peer-checked:bg-[#0B6D76] transition-all duration-200 relative">
                          <div className="absolute left-1 top-0.5 sm:top-1 bg-white w-3.5 sm:w-4 h-3.5 sm:h-4 rounded-full transition-transform duration-200 peer-checked:translate-x-4 sm:peer-checked:translate-x-5"></div>
                        </div>
                        <span className={`ml-2 text-xs sm:text-sm font-medium ${uni.popular ? 'text-[#0B6D76]' : 'text-gray-400'}`}>{uni.popular ? 'On' : 'Off'}</span>
                      </label>
                    </td>
                    <td className="py-2 px-3 border-b text-center text-gray-500">
                      {new Date(uni.created_at).toLocaleDateString()}
                    </td>
                    <td className="py-2 px-3 border-b text-center">
                      <div className="flex flex-wrap justify-center gap-2">
                        <button 
                          onClick={() => handleEditClick(uni)}
                          className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                          title="Edit"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => handleDelete(uni.id)}
                          className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                          title="Delete"
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        {/* Pagination for filtered results */}
        {filteredUniversities.length > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={Math.ceil(filteredUniversities.length / itemsPerPage)}
            onPageChange={setCurrentPage}
            totalItems={filteredUniversities.length}
            startIndex={startIndex}
            endIndex={endIndex}
          />
        )}

        {filteredUniversities.length === 0 && (
          <div className="text-center py-8 sm:py-12">
            {universities.length === 0 ? (
              <>
                <div className="text-gray-500 text-base sm:text-lg">No universities found</div>
                <p className="text-gray-400 mt-2 text-sm sm:text-base">Try adding a new university</p>
              </>
            ) : (
              <>
                <div className="text-gray-500 text-base sm:text-lg">No universities match your filters</div>
                <p className="text-gray-400 mt-2 text-sm sm:text-base">Try adjusting your search criteria or clear filters</p>
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setFilterCountry('');
                    setFilterPopular('');
                    setFilterYear('');
                  }}
                  className="mt-4 px-4 py-2 bg-[#0B6D76] text-white rounded-lg hover:bg-[#094F56] transition-colors"
                >
                  Clear all filters
                </button>
              </>
            )}
          </div>
        )}
      </div>

      {/* Edit University Modal */}
      {showEditModal && editingUniversity && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4"
          onClick={() => {
            setShowEditModal(false);
            setEditingUniversity(null);
            setActiveEditTab('GENERAL');
            setEditForm({
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
              sm_question: '[]',
              sm_answer: '[]',
              review_detail: '[]',
              logo_url: '',
              feature_image_url: '',
              other_images_urls: '[]',
            });
          }}
        >
          <div 
            className="bg-white rounded-lg shadow-xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-800">
                Edit University: {editingUniversity.name}
              </h2>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setEditingUniversity(null);
                  setActiveEditTab('GENERAL');
                  setEditForm({
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
                    sm_question: '[]',
                    sm_answer: '[]',
                    review_detail: '[]',
                    logo_url: '',
                    feature_image_url: '',
                    other_images_urls: '[]',
                  });
                }}
                className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-6">
              {/* Tabs */}
              <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-8">
                  {editTabs.map((tab) => (
                    <button
                      key={tab}
                      type="button"
                      onClick={() => setActiveEditTab(tab)}
                      className={`py-2 px-1 border-b-2 font-medium text-sm ${
                        activeEditTab === tab
                          ? 'border-[#0B6D76] text-[#0B6D76]'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </nav>
              </div>

              {/* Tab Content */}
              {activeEditTab === 'GENERAL' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* University Name */}
                    <div className="md:col-span-2">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        University Name *
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={editForm.name}
                        onChange={handleEditChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0B6D76] focus:border-transparent"
                      />
                    </div>

                    {/* Founded In */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Founded In
                      </label>
                      <input
                        type="text"
                        name="founded_in"
                        value={editForm.founded_in}
                        onChange={handleEditChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0B6D76] focus:border-transparent"
                        placeholder="e.g., 1990"
                      />
                    </div>

                    {/* Country */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Country
                      </label>
                      <input
                        type="text"
                        name="country"
                        value={editForm.country}
                        onChange={handleEditChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0B6D76] focus:border-transparent"
                      />
                    </div>

                    {/* City */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        City
                      </label>
                      <input
                        type="text"
                        name="city"
                        value={editForm.city}
                        onChange={handleEditChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0B6D76] focus:border-transparent"
                      />
                    </div>

                    {/* Popular Status */}
                    <div className="md:col-span-2">
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          name="popular"
                          checked={editForm.popular}
                          onChange={handleEditChange}
                          className="rounded text-[#0B6D76] focus:ring-[#0B6D76]"
                        />
                        <span className="text-sm font-semibold text-gray-700">Mark as Popular</span>
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {activeEditTab === 'MORE DETAIL' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Address */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Address
                      </label>
                      <input
                        type="text"
                        name="address"
                        value={editForm.address}
                        onChange={handleEditChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0B6D76] focus:border-transparent"
                      />
                    </div>

                    {/* Postcode */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Postcode
                      </label>
                      <input
                        type="text"
                        name="postcode"
                        value={editForm.postcode}
                        onChange={handleEditChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0B6D76] focus:border-transparent"
                      />
                    </div>

                    {/* Phone Number */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Phone Number
                      </label>
                      <input
                        type="text"
                        name="phone_no"
                        value={editForm.phone_no}
                        onChange={handleEditChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0B6D76] focus:border-transparent"
                      />
                    </div>

                    {/* Agency Number */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Agency Number
                      </label>
                      <input
                        type="text"
                        name="agency_number"
                        value={editForm.agency_number}
                        onChange={handleEditChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0B6D76] focus:border-transparent"
                      />
                    </div>

                    {/* Total Students */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Total Students
                      </label>
                      <input
                        type="number"
                        name="total_students"
                        value={editForm.total_students}
                        onChange={handleEditChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0B6D76] focus:border-transparent"
                      />
                    </div>

                    {/* International Students */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        International Students
                      </label>
                      <input
                        type="number"
                        name="international_student"
                        value={editForm.international_student}
                        onChange={handleEditChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0B6D76] focus:border-transparent"
                      />
                    </div>

                    {/* Scholarship */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Scholarship
                      </label>
                      <input
                        type="text"
                        name="scholarship"
                        value={editForm.scholarship}
                        onChange={handleEditChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0B6D76] focus:border-transparent"
                        placeholder="e.g., Available for international students"
                      />
                    </div>

                    {/* Teaching Languages */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Teaching Languages
                      </label>
                      <input
                        type="text"
                        name="languages"
                        value={editForm.languages}
                        onChange={handleEditChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0B6D76] focus:border-transparent"
                        placeholder="e.g., English, Spanish"
                      />
                    </div>

                    {/* Intake Periods */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Intake Periods
                      </label>
                      <input
                        type="text"
                        name="intake"
                        value={editForm.intake}
                        onChange={handleEditChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0B6D76] focus:border-transparent"
                        placeholder="e.g., January, September"
                      />
                    </div>

                    {/* Ranking */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Ranking
                      </label>
                      <input
                        type="text"
                        name="ranking"
                        value={editForm.ranking}
                        onChange={handleEditChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0B6D76] focus:border-transparent"
                        placeholder="e.g., Top 100 worldwide"
                      />
                    </div>

                    {/* Designation */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Designation
                      </label>
                      <input
                        type="text"
                        name="designation"
                        value={editForm.designation}
                        onChange={handleEditChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0B6D76] focus:border-transparent"
                      />
                    </div>

                    {/* Alternate Email */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Alternate Email
                      </label>
                      <input
                        type="email"
                        name="alternate_email"
                        value={editForm.alternate_email}
                        onChange={handleEditChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0B6D76] focus:border-transparent"
                      />
                    </div>

                    {/* Website */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Website
                      </label>
                      <input
                        type="url"
                        name="website"
                        value={editForm.website}
                        onChange={handleEditChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0B6D76] focus:border-transparent"
                        placeholder="https://example.com"
                      />
                    </div>
                  </div>
                </div>
              )}

              {activeEditTab === 'ABOUT UNIVERSITY' && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    About University
                  </label>
                  <SummernoteEditor
                    value={editForm.about}
                    onChange={(content) => handleEditEditorChange('about', content)}
                    key="edit-about-editor"
                  />
                </div>
              )}

              {activeEditTab === 'GUIDE' && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    University Guide
                  </label>
                  <SummernoteEditor
                    value={editForm.guide}
                    onChange={(content) => handleEditEditorChange('guide', content)}
                    key="edit-guide-editor"
                  />
                </div>
              )}

              {activeEditTab === 'ACCOMMODATION' && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Accommodation Information
                  </label>
                  <SummernoteEditor
                    value={editForm.accommodation}
                    onChange={(content) => handleEditEditorChange('accommodation', content)}
                    key="edit-accommodation-editor"
                  />
                </div>
              )}

              {activeEditTab === 'EXPANSE' && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Costs and Expenses
                  </label>
                  <SummernoteEditor
                    value={editForm.expanse}
                    onChange={(content) => handleEditEditorChange('expanse', content)}
                    key="edit-expanse-editor"
                  />
                </div>
              )}

              {/* Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingUniversity(null);
                    setActiveEditTab('GENERAL');
                    setEditForm({
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
                      sm_question: '[]',
                      sm_answer: '[]',
                      review_detail: '[]',
                      logo_url: '',
                      feature_image_url: '',
                      other_images_urls: '[]',
                    });
                  }}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-[#0B6D76] text-white rounded-lg hover:bg-[#085a61] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Updating...' : 'Update University'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}