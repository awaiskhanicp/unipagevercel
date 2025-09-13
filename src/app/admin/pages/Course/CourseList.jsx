
'use client';

import React, { useState, useEffect } from "react";
import { Plus, Edit, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import dynamic from 'next/dynamic';
import Pagination from '../../components/Pagination';
import Swal from 'sweetalert2';

const AddCourse = dynamic(() => import('./AddCourse'), { ssr: false });

const CourseList = () => {
  const [courses, setCourses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fetchingCourses, setFetchingCourses] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(15);
  const [totalItems, setTotalItems] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [levels, setLevels] = useState([]);
  
  // Filter states
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [qualificationFilter, setQualificationFilter] = useState('');
  const [popularFilter, setPopularFilter] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  
  // Applied filters state (only updated when search button is clicked)
  const [appliedSearchTerm, setAppliedSearchTerm] = useState('');
  const [appliedStartDate, setAppliedStartDate] = useState('');
  const [appliedEndDate, setAppliedEndDate] = useState('');
  const [appliedQualificationFilter, setAppliedQualificationFilter] = useState('');
  const [appliedPopularFilter, setAppliedPopularFilter] = useState('');
  const [appliedSubjectFilter, setAppliedSubjectFilter] = useState('');
  
  // Load all courses state
  const [isLoadingAll, setIsLoadingAll] = useState(false);
  const [allCoursesLoaded, setAllCoursesLoaded] = useState(false);

  // Update pagination when total items change
  useEffect(() => {
    const pages = Math.ceil(totalItems / itemsPerPage);
    // Reset to first page if current page is out of bounds
    if (currentPage > pages && pages > 0) {
      setCurrentPage(1);
    }
  }, [totalItems, currentPage, itemsPerPage]);

  const router = useRouter();

  // Reset to first page when applied filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [appliedSearchTerm, appliedStartDate, appliedEndDate, appliedQualificationFilter, appliedPopularFilter, appliedSubjectFilter]);

  // Fetch universities and subjects on mount
  useEffect(() => {

    const fetchdata = async () => {
      const [levels, subjects] = await Promise.all([
        fetch('/api/frontend/getpostlevel', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          }
        }),
        fetch('/api/frontend/getsubject', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          }
        }),
      ]);

      if(!levels.ok || !subjects.ok) throw new Error('Failed to fetch data')

      const levelData = await levels.json();
      const subjectsData = await subjects.json();

      setLevels(levelData.data);
      setSubjects(subjectsData.data);

    }

    fetchdata()

  }, [])
 
  // Fetch courses when page or applied filters change
  useEffect(() => {
    fetchCourses();
  }, [currentPage, appliedSearchTerm, appliedStartDate, appliedEndDate, appliedQualificationFilter, appliedPopularFilter, appliedSubjectFilter]);


  async function fetchCourses() {
    try {
      setFetchingCourses(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: itemsPerPage.toString()
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
      if (appliedQualificationFilter) {
        params.append('qualification', appliedQualificationFilter);
      }
      if (appliedPopularFilter) {
        params.append('popular', appliedPopularFilter);
      }
      if (appliedSubjectFilter) {
        params.append('subject', appliedSubjectFilter);
      }

      

      const res = await fetch(`/api/internal/course?${params.toString()}`);
      const data = await res.json();
      
      if (data.success) {
        setCourses(data.data);
        // Use the correct pagination field from the API response
        setTotalItems(data.pagination?.totalItems || data.total || data.data.length);
        
      } else {
        setCourses([]);
        setTotalItems(0);
      }
    } catch (err) {
      console.error('Error fetching courses:', err);
      setCourses([]);
      setTotalItems(0);
      Swal.fire({
        icon: 'error',
        title: 'Error!',
        text: 'Failed to load courses',
        confirmButtonColor: '#0B6D76',
        confirmButtonText: 'OK'
      });
    } finally {
      setFetchingCourses(false);
    }
  }

  const handleSearch = () => {
    console.log('=== FRONTEND FILTER DEBUG ===');
    console.log('Search Term:', searchTerm);
    console.log('Start Date:', startDate);
    console.log('End Date:', endDate);
    console.log('Qualification Filter:', qualificationFilter);
    console.log('Popular Filter:', popularFilter);
    console.log('Subject Filter:', subjectFilter);
    
    setAppliedSearchTerm(searchTerm);
    setAppliedStartDate(startDate);
    setAppliedEndDate(endDate);
    setAppliedQualificationFilter(qualificationFilter);
    setAppliedPopularFilter(popularFilter);
    setAppliedSubjectFilter(subjectFilter);
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setStartDate('');
    setEndDate('');
    setQualificationFilter('');
    setPopularFilter('');
    setSubjectFilter('');
    setAppliedSearchTerm('');
    setAppliedStartDate('');
    setAppliedEndDate('');
    setAppliedQualificationFilter('');
    setAppliedPopularFilter('');
    setAppliedSubjectFilter('');
    setCurrentPage(1);
  };

  // Function to load all courses at once
  const loadAllCourses = async () => {
    try {
      setIsLoadingAll(true);
      const params = new URLSearchParams({
        page: '1',
        limit: '10000' // Large limit to get all courses
      });
      
      // Apply current filters if any
      if (appliedSearchTerm) params.append('search', appliedSearchTerm);
      if (appliedStartDate) params.append('start_date', appliedStartDate);
      if (appliedEndDate) params.append('end_date', appliedEndDate);
      if (appliedQualificationFilter) params.append('qualification', appliedQualificationFilter);
      if (appliedPopularFilter) params.append('popular', appliedPopularFilter);
      if (appliedSubjectFilter) params.append('subject', appliedSubjectFilter);
      
      const res = await fetch(`/api/internal/course?${params.toString()}`);
      const data = await res.json();
      
      if (data.success) {
        setCourses(data.data);
        setTotalItems(data.data.length); // Update total to show all loaded
        setAllCoursesLoaded(true);
        
        Swal.fire({
          icon: 'success',
          title: 'Success!',
          text: `Loaded all ${data.data.length} courses`,
          confirmButtonColor: '#0B6D76',
          timer: 2000,
          showConfirmButton: false
        });
      }
    } catch (error) {
      console.error('Error loading all courses:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error!',
        text: 'Failed to load all courses',
        confirmButtonColor: '#0B6D76'
      });
    } finally {
      setIsLoadingAll(false);
    }
  };

  // Function to reset to paginated view
  const resetToPaginatedView = () => {
    setAllCoursesLoaded(false);
    fetchCourses(); // This will fetch the current page with current filters
  };

  const hasActiveFilters = appliedSearchTerm || appliedStartDate || appliedEndDate || appliedQualificationFilter || appliedPopularFilter || appliedSubjectFilter;

  const handleDelete = async (id) => {
    try {
      const result = await Swal.fire({
        title: 'Are you sure?',
        text: "You won't be able to revert this!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Yes, delete it!',
        cancelButtonText: 'Cancel'
      });

      console.log("Course ID", id)

      if (result.isConfirmed) {
        const res = await fetch(`/api/internal/course/${id}`, {
          method: 'DELETE'
        });
        
        if (res.ok) {
          setCourses(prev => prev.filter(c => c.id !== id));
          Swal.fire({
            icon: 'success',
            title: 'Deleted!',
            text: 'Course has been deleted successfully.',
            confirmButtonColor: '#0B6D76',
            confirmButtonText: 'OK'
          });
        } else {
          throw new Error('Failed to delete course');
        }
      }
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error!',
        text: 'Error deleting course: ' + error.message,
        confirmButtonColor: '#0B6D76',
        confirmButtonText: 'OK'
      });
    }
  };

  const handleTogglePopular = async (course) => {
    try {
      const res = await fetch(`/api/internal/new/togglepopular/${course.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ popular: !course.popular })
      });
      
      if (res.ok) {
        setCourses(prev =>
          prev.map(c => (c.id === course.id ? { ...c, popular: !c.popular } : c))
        );
        
        Swal.fire({
          icon: 'success',
          title: 'Updated!',
          text: `Course popularity ${!course.popular ? 'enabled' : 'disabled'} successfully.`,
          confirmButtonColor: '#0B6D76',
          confirmButtonText: 'OK',
          timer: 2000,
          showConfirmButton: false
        });
      } else {
        throw new Error('Failed to update popular status');
      }
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error!',
        text: 'Error updating popular status: ' + error.message,
        confirmButtonColor: '#0B6D76',
        confirmButtonText: 'OK'
      });
    }
  };

  const handleEdit = (course) => {
    setSelectedCourse(course);
    setEditModalOpen(true);
  };

  const handleEditSubmit = async (updatedData) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/internal/course/${selectedCourse.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedData),
      });
      
      if (res.ok) {
        await Swal.fire({
          icon: 'success',
          title: 'Success!',
          text: 'Course updated successfully!',
          confirmButtonColor: '#0B6D76',
          confirmButtonText: 'OK'
        });
        
        setEditModalOpen(false);
        setSelectedCourse(null);
        fetchCourses();
      } else {
        const err = await res.json();
        throw new Error(err.message || 'Failed to update course');
      }
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error!',
        text: 'Error updating course: ' + error.message,
        confirmButtonColor: '#0B6D76',
        confirmButtonText: 'OK'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
    <title>List of all Courses - University Page</title>
    <meta name="description" content="List of all Courses - University Page" />
    <div className="space-y-6 p-6 bg-gradient-to-br from-blue-50 to-indigo-100 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Course Management</h1>
        <div className="flex gap-3">
          <button
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
              isFilterOpen 
                ? 'bg-[#0B6D76] text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            🔍 Filters
            {hasActiveFilters && (
              <span className="ml-1 px-2 py-1 bg-white text-[#0B6D76] text-xs rounded-full">
                {[appliedSearchTerm, appliedStartDate, appliedEndDate, appliedQualificationFilter, appliedPopularFilter, appliedSubjectFilter].filter(Boolean).length}
              </span>
            )}
          </button>
          <button
            onClick={() => router.push('/admin/course/add')}
            className="px-4 py-2 bg-[#0B6D76] text-white rounded-lg hover:bg-[#09545c] transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Course
          </button>
        </div>
      </div>

      {/* Filter Section */}
      {isFilterOpen && (
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Search Courses</label>
              <input
                type="text"
                placeholder="Search by course name, university, or subject..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0B6D76] focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0B6D76] focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0B6D76] focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Qualification</label>
              <select
                value={qualificationFilter}
                onChange={(e) => setQualificationFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0B6D76] focus:border-transparent"
              >
                <option value="">Select Qualification</option>
                {levels.map((level) => (
                  <option key={level.id} value={level.id}>
                    {level.title}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Popular Status</label>
              <select
                value={popularFilter}
                onChange={(e) => setPopularFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0B6D76] focus:border-transparent"
              >
                <option value="">All Status</option>
                <option value="true">Popular</option>
                <option value="false">Not Popular</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
              <select
                value={subjectFilter}
                onChange={(e) => setSubjectFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0B6D76] focus:border-transparent"
              >
                <option value="">All Subjects</option>
                {subjects.map((subject) => (
                  <option key={subject.id} value={subject.id}>
                    {subject.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-200">
            <div className="flex gap-2">
              <button
                onClick={handleSearch}
                className="px-4 py-2 bg-[#0B6D76] text-white rounded-lg hover:bg-[#094F56] transition-colors flex items-center gap-2"
              >
                🔍 Search
              </button>
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                >
                  Clear Filters
                </button>
              )}
              <button
                onClick={loadAllCourses}
                disabled={isLoadingAll}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isLoadingAll ? '⏳ Loading...' : '📚 Load All Courses'}
              </button>
            </div>
            
            {/* Active Filters Display */}
            {hasActiveFilters && (
              <div className="text-sm text-gray-600">
                Active filters: 
                {appliedSearchTerm && <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 rounded">Search: "{appliedSearchTerm}"</span>}
                {appliedStartDate && <span className="ml-2 px-2 py-1 bg-green-100 text-green-800 rounded">Start: {appliedStartDate}</span>}
                {appliedEndDate && <span className="ml-2 px-2 py-1 bg-purple-100 text-purple-800 rounded">End: {appliedEndDate}</span>}
                {appliedQualificationFilter && <span className="ml-2 px-2 py-1 bg-orange-100 text-orange-800 rounded">Qualification: {appliedQualificationFilter}</span>}
                {appliedPopularFilter && <span className="ml-2 px-2 py-1 bg-pink-100 text-pink-800 rounded">Popular: {appliedPopularFilter === 'true' ? 'Yes' : 'No'}</span>}
                {appliedSubjectFilter && (
                  <span className="ml-2 px-2 py-1 bg-indigo-100 text-indigo-800 rounded">
                    Subject: {subjects.find(s => String(s.id) === String(appliedSubjectFilter))?.name || appliedSubjectFilter}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Success Message */}
      {courses.length > 0 && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-5 w-2 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-green-800">
                  Showing {courses.length} courses
                  {!allCoursesLoaded && totalItems > courses.length && (
                    <span className="ml-2 text-green-600">
                      (of {totalItems} total available)
                    </span>
                  )}
                  {allCoursesLoaded && (
                    <span className="ml-2 text-green-600">
                      (all courses loaded)
                    </span>
                  )}
                </p>
              </div>
            </div>
            <div className="text-right">
              {!allCoursesLoaded ? (
                <p className="text-sm font-medium text-green-800">
                  Page {currentPage} of {Math.ceil(totalItems / itemsPerPage)}
                </p>
              ) : (
                <p className="text-sm font-medium text-green-600">
                  All courses loaded
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Table Section */}
      <div className="bg-white rounded-2xl shadow-xl p-6">
        {fetchingCourses ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0B6D76] mx-auto mb-4"></div>
            <div className="text-gray-500 text-lg">Loading courses...</div>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full max-w-[1200px]">
                <thead>
                  <tr className="bg-gradient-to-r from-blue-50 to-indigo-50">
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 rounded-l-xl">Course Name</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">University Name</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Subject</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Qualification</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">Popular</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">Created At</th>
                    <th className="px-6 py-4 text-center text-gray-900 rounded-r-xl">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {courses.map((course) => (
                    <tr key={course.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 font-medium text-gray-900">{course.name}</td>
                      <td className="px-6 py-4 text-gray-600">
                        {course.university || 'Not Available'}
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        {course.subject_name || 'Not Available'}
                      </td>
                      <td className="px-6 py-4 text-gray-600">{course.qualification || course.qualification || '-'}</td>
                      <td className="px-6 py-4 text-center">
                        <label className="inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={!!course.popular}
                            onChange={() => handleTogglePopular(course)}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[#0B6D76] rounded-full peer peer-checked:bg-[#0B6D76] transition-all duration-200 relative">
                            <div className="absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform duration-200 peer-checked:translate-x-5"></div>
                          </div>
                          <span className={`ml-2 text-sm font-medium ${course.popular ? 'text-[#0B6D76]' : 'text-gray-400'}`}>{course.popular ? 'On' : 'Off'}</span>
                        </label>
                      </td>
                      <td className="px-6 py-4 text-center text-gray-500">
                        {new Date(course.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={() => handleEdit(course)}
                          className="p-2 text-green-600 hover:bg-green-100 rounded-lg transition-colors mr-2"
                          title="Edit Course"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(course.id)}
                          className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                          title="Delete Course"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {courses.length === 0 && (
              <div className="text-center py-12">
                <div className="text-gray-500 text-lg">
                  {hasActiveFilters ? 'No courses found matching your filters.' : 'No courses found'}
                </div>
                <p className="text-gray-400 mt-2">
                  {hasActiveFilters ? 'Try adjusting your search criteria or clear filters' : 'Try adding a new course'}
                </p>
                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    className="mt-4 px-4 py-2 bg-[#0B6D76] text-white rounded-lg hover:bg-[#09545c] transition-colors"
                  >
                    Clear all filters
                  </button>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* Pagination Component */}
      {!allCoursesLoaded && Math.ceil(totalItems / itemsPerPage) > 1 && (
        <div className="bg-white rounded-2xl shadow-xl p-6">
          <div className="text-center mb-4">
            <p className="text-gray-600 mb-2">
              Currently showing page {currentPage} of {Math.ceil(totalItems / itemsPerPage)}
            </p>
            <p className="text-sm text-gray-500">
              Showing {courses.length} courses per page. Use pagination below or load all courses at once.
            </p>
          </div>
          <Pagination
            currentPage={currentPage}
            totalPages={Math.ceil(totalItems / itemsPerPage)}
            onPageChange={setCurrentPage}
            totalItems={totalItems}
          />
        </div>
      )}
      
      {/* All Courses Loaded Message */}
      {allCoursesLoaded && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
          <p className="text-blue-800 font-medium">
            🎉 All {courses.length} courses have been loaded and are now visible!
          </p>
          <p className="text-blue-600 text-sm mt-1">
            No more pagination needed - you can see everything at once.
          </p>
          <button
            onClick={resetToPaginatedView}
            className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            🔄 Back to Paginated View
          </button>
        </div>
      )}

      {/* Edit Modal */}
      {editModalOpen && selectedCourse && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white max-w-4xl w-full rounded-xl shadow-xl p-6 overflow-y-auto max-h-[90vh]">
            <h2 className="text-xl font-bold mb-4 text-center">Edit Course: {selectedCourse.name}</h2>
            <AddCourse
              initialData={selectedCourse}
              onSubmit={handleEditSubmit}
              loading={loading}
              onCancel={() => {
                setEditModalOpen(false);
                setSelectedCourse(null);
              }}
            />
          </div>
        </div>
      )}
    </div>
    </>
  );
};

export default CourseList;