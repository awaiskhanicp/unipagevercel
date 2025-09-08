'use client';

import { useState, useEffect } from 'react';
import { Eye, Trash2, Download, Search, Briefcase, User, Mail, Phone, Calendar } from 'lucide-react';
import Swal from 'sweetalert2';
import Pagination from '../components/Pagination';

const JobApplicationsPage = () => {
  const [applications, setApplications] = useState([]); // Only current page data
  const [filteredApplications, setFilteredApplications] = useState([]); // Only current page data
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const itemsPerPage = 15;

  // Applied filters (what's actually being used in API calls)
  const [appliedSearchTerm, setAppliedSearchTerm] = useState('');
  const [appliedStartDate, setAppliedStartDate] = useState('');
  const [appliedEndDate, setAppliedEndDate] = useState('');

  useEffect(() => {
    fetchApplications();
  }, [currentPage, appliedSearchTerm, appliedStartDate, appliedEndDate]); // Add date filter dependencies

  const fetchApplications = async () => {
    setLoading(true);
    try {
      console.log('Fetching applications for page:', currentPage, 'Search:', appliedSearchTerm, 'Date range:', { appliedStartDate, appliedEndDate });
      
      // Build URL with search, date filters and pagination parameters
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: itemsPerPage.toString()
      });
      
      if (appliedSearchTerm.trim()) {
        params.append('search', appliedSearchTerm.trim());
      }
      
      if (appliedStartDate) {
        params.append('start_date', appliedStartDate);
      }
      
      if (appliedEndDate) {
        params.append('end_date', appliedEndDate);
      }
      
      const response = await fetch(`/api/internal/job-applies?${params.toString()}`);
      const data = await response.json();
      
      console.log('API response for page:', currentPage, 'Data count:', data.data?.length, 'Search:', appliedSearchTerm, 'Date range:', { appliedStartDate, appliedEndDate });
      
      if (data.success) {
        console.log('Fetched job applications for page:', currentPage, 'Total items:', data.meta?.totalItems);
        setApplications(data.data || []); // Only current page data
        setFilteredApplications(data.data || []); // Set filtered to same data since search is server-side
        setTotalItems(data.meta?.totalItems || 0);
        setTotalPages(data.meta?.totalPages || 1);
      } else {
        console.error('API returned error:', data);
        setApplications([]);
        setFilteredApplications([]);
        setTotalItems(0);
        setTotalPages(1);
      }
    } catch (error) {
      console.error('Error fetching job applications:', error);
      setApplications([]);
      setFilteredApplications([]);
      setTotalItems(0);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  // Handle search - fetch new data from server
  const handleSearch = () => {
    setAppliedSearchTerm(searchTerm);
    setAppliedStartDate(startDate);
    setAppliedEndDate(endDate);
    setCurrentPage(1); // Reset to first page when searching
    // The useEffect will trigger fetchApplications with new filters
  };

  const clearFilters = () => {
    setSearchTerm('');
    setStartDate('');
    setEndDate('');
    setAppliedSearchTerm('');
    setAppliedStartDate('');
    setAppliedEndDate('');
    setCurrentPage(1);
  };

  const hasActiveFilters = appliedSearchTerm || appliedStartDate || appliedEndDate;

  const handleViewDetails = (application) => {
    setSelectedApplication(application);
    setShowDetails(true);
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
        const res = await fetch(`/api/internal/job-applies/${id}`, { method: 'DELETE' });
        const data = await res.json();
        if (res.ok && data.success) {
          // Remove from current page data
          const updatedApplications = applications.filter((app) => app.id !== id);
          setApplications(updatedApplications);
          
          // Update filtered applications as well
          const updatedFiltered = filteredApplications.filter((app) => app.id !== id);
          setFilteredApplications(updatedFiltered);
          
          // If we deleted the last item on the current page and there are more pages, go to previous page
          if (updatedApplications.length === 0 && currentPage > 1) {
            setCurrentPage(currentPage - 1);
          } else if (updatedApplications.length === 0 && currentPage === 1 && totalPages > 1) {
            // If first page is empty and there are more pages, stay on page 1 but refresh
            fetchApplications();
          }
          
          await Swal.fire('Deleted!', 'Job application has been deleted.', 'success');
        } else {
          await Swal.fire('Error!', data.message || 'Failed to delete application', 'error');
        }
      } catch (error) {
        console.error('Delete error:', error);
        await Swal.fire('Error!', 'Network error, please try again.', 'error');
      }
    }
  };

  const downloadResume = (resumeUrl, fileName) => {
    if (resumeUrl) {
      const link = document.createElement('a');
      link.href = resumeUrl;
      link.download = fileName || 'resume.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  if (loading) {
    return (
      <div className="p-6 bg-gradient-to-br from-blue-50 to-cyan-100 min-h-screen flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 max-w-3xl w-full text-center">
          <p>Loading job applications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gradient-to-br from-blue-50 to-cyan-100 min-h-screen">
      <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6 sm:mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-1">Job Applications</h1>
            <p className="text-gray-600 text-sm sm:text-base">Manage all job applications submitted by candidates</p>
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
          <div className="bg-white rounded-lg shadow-md p-4 mb-6 border border-gray-200">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Search Applications</label>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  placeholder="Search by name, email, phone, or job title..."
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
              <div className="flex items-end gap-2">
                <button 
                  onClick={handleSearch} 
                  className="px-4 py-2 bg-teal-600 text-white rounded hover:bg-teal-700 flex items-center gap-2"
                  disabled={loading}
                >
                  🔍 Search
                </button>
                <button 
                  onClick={clearFilters} 
                  className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                  disabled={loading}
                >
                  Clear Filters
                </button>
              </div>
            </div>

            {/* Active Filters Display */}
            {hasActiveFilters && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="text-sm text-gray-600">
                  Active filters: 
                  {appliedSearchTerm && <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 rounded">Search: "{appliedSearchTerm}"</span>}
                  {appliedStartDate && <span className="ml-2 px-2 py-1 bg-green-100 text-green-800 rounded">From: {appliedStartDate}</span>}
                  {appliedEndDate && <span className="ml-2 px-2 py-1 bg-green-100 text-green-800 rounded">To: {appliedEndDate}</span>}
                </div>
              </div>
            )}
          </div>
        )}

       
        {/* Table */}
        <div className="overflow-x-auto rounded-xl border border-gray-200">
          <table className="w-full min-w-[900px]">
            <thead className="sticky top-0 bg-gray-50 z-10">
              <tr>
                <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-semibold text-gray-700">Applicant</th>
                <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-semibold text-gray-700">Contact Info</th>
                <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-semibold text-gray-700">Job Title</th>
                <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-semibold text-gray-700">Start Date</th>
                <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-semibold text-gray-700">Applied Date</th>
                <th className="px-4 sm:px-6 py-3 sm:py-4 text-center text-xs sm:text-sm font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredApplications.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-6 text-center text-gray-500">
                    {hasActiveFilters ? 'No applications found matching your filters.' : 'No job applications found.'}
                  </td>
                </tr>
              ) : (
                filteredApplications.map((application) => (
                  <tr key={application.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 sm:px-6 py-3 sm:py-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <User className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{application.name}</p>
                          <p className="text-sm text-gray-500">{application.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 sm:px-6 py-3 sm:py-4">
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <Phone className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-700">{application.phone_number}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Mail className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-700">{application.email}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 sm:px-6 py-3 sm:py-4">
                      <div className="flex items-center space-x-2">
                        <Briefcase className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-700">{application.job_title || 'N/A'}</span>
                      </div>
                    </td>
                    <td className="px-4 sm:px-6 py-3 sm:py-4">
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-700">
                          {application.start_date ? new Date(application.start_date).toLocaleDateString() : 'N/A'}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 sm:px-6 py-3 sm:py-4">
                      <span className="text-gray-500">
                        {application.created_at ? new Date(application.created_at).toLocaleDateString() : 'N/A'}
                      </span>
                    </td>
                    <td className="px-4 sm:px-6 py-3 sm:py-4 text-center">
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => handleViewDetails(application)}
                          className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {application.resume && (
                          <button
                            onClick={() => downloadResume(application.resume, `${application.name}_resume.pdf`)}
                            className="p-2 text-green-600 hover:bg-green-100 rounded-lg transition-colors"
                            title="Download Resume"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(application.id)}
                          className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {filteredApplications.length > 0 && (
          <div className="mt-4">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              totalItems={totalItems}
              startIndex={(currentPage - 1) * itemsPerPage}
              endIndex={Math.min(currentPage * itemsPerPage, totalItems)}
            />
          </div>
        )}

        {/* Application Details Modal */}
        {showDetails && selectedApplication && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-800">
                  Application Details
                </h2>
                <button
                  onClick={() => setShowDetails(false)}
                  className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
                >
                  ×
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Full Name</label>
                    <p className="text-gray-900">{selectedApplication.name}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Email</label>
                    <p className="text-gray-900">{selectedApplication.email}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Phone</label>
                    <p className="text-gray-900">{selectedApplication.phone_number}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Start Date</label>
                    <p className="text-gray-900">
                      {selectedApplication.start_date ? new Date(selectedApplication.start_date).toLocaleDateString() : 'N/A'}
                    </p>
                  </div>
                </div>

                {selectedApplication.job_title && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Job Title</label>
                    <p className="text-gray-900">{selectedApplication.job_title}</p>
                  </div>
                )}

                {selectedApplication.job_type && selectedApplication.job_type !== 'N/A' && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Job Type</label>
                    <p className="text-gray-900">{selectedApplication.job_type}</p>
                  </div>
                )}

                {selectedApplication.location && selectedApplication.location !== 'N/A' && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Job Location</label>
                    <p className="text-gray-900">{selectedApplication.location}</p>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Applied Date</label>
                  <p className="text-gray-900">
                    {selectedApplication.created_at ? new Date(selectedApplication.created_at).toLocaleDateString() : 'N/A'}
                  </p>
                </div>

                {selectedApplication.resume && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Resume</label>
                    <button
                      onClick={() => downloadResume(selectedApplication.resume, `${selectedApplication.name}_resume.pdf`)}
                      className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <Download className="w-4 h-4" />
                      <span>Download Resume</span>
                    </button>
                  </div>
                )}
              </div>

              <div className="flex justify-end mt-6 pt-4 border-t">
                <button
                  onClick={() => setShowDetails(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default JobApplicationsPage;