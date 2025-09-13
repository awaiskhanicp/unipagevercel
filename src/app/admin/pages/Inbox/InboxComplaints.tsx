"use client";

import React, { useEffect, useState,useCallback } from "react";
import { FaSearch, FaEye, FaReply, FaFilter, FaTimes, FaCalendar } from "react-icons/fa";
import Pagination from "../../../admin/components/Pagination";

interface Complaint {
  id: number;
  name: string;
  email: string;
  phone: string;
  location: string;
  subject: string;
  message: string;
  is_read: number;
  created_at: string;
  updated_at: string;
}

interface ComplaintsResponse {
  success: boolean;
  data: Complaint[];
  meta: {
    page: number;
    limit: number;
    totalItems: number;
    totalPages: number;
    startIndex: number;
    endIndex: number;
  };
}

const InboxComplaints = () => {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  
  const itemsPerPage = 15;

  const fetchComplaints = useCallback(async () => {
    try {
      setLoading(true);

      let url = `/api/internal/complaints?page=${currentPage}&limit=${itemsPerPage}`;

      if (appliedSearch) {
        url += `&search=${encodeURIComponent(appliedSearch)}`;
      }
      if (locationFilter) {
        url += `&location=${encodeURIComponent(locationFilter)}`;
      }
      if (startDate) {
        url += `&startDate=${encodeURIComponent(startDate)}`;
      }
      if (endDate) {
        url += `&endDate=${encodeURIComponent(endDate)}`;
      }

      const response = await fetch(url);
      const data: ComplaintsResponse = await response.json();

      if (data.success) {
        setComplaints(data.data);
        setTotalItems(data.meta.totalItems);
        setTotalPages(data.meta.totalPages);
      }
    } catch (error) {
      console.error("Fetch error:", error);
    } finally {
      setLoading(false);
    }
  }, [currentPage, itemsPerPage, appliedSearch, locationFilter, startDate, endDate]); 
  

  useEffect(() => {
    fetchComplaints();
  }, [fetchComplaints]); 


  const handleSearchClick = () => {
    setCurrentPage(1);
    setAppliedSearch(search);
  };

  const handleClearFilters = () => {
    setSearch("");
    setAppliedSearch("");
    setLocationFilter("");
    setStartDate("");
    setEndDate("");
    setCurrentPage(1);
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  const viewComplaintDetails = (complaint: Complaint) => {
    setSelectedComplaint(complaint);
    setShowDetailModal(true);
  };

  const markAsRead = async (id: number) => {
    try {
      // You would need to create an API endpoint to update the is_read status
      const response = await fetch(`/api/internal/complaints/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ is_read: 1 }),
      });
      
      if (response.ok) {
        // Update local state
        setComplaints(prev => prev.map(comp => 
          comp.id === id ? { ...comp, is_read: 1 } : comp
        ));
        
        if (selectedComplaint?.id === id) {
          setSelectedComplaint(prev => prev ? { ...prev, is_read: 1 } : null);
        }
      }
    } catch (error) {
      console.error("Error marking as read:", error);
    }
  };

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + complaints.length;

  const hasActiveFilters = appliedSearch || locationFilter || startDate || endDate;

  // Extract unique locations from complaints for filter dropdown
  const locations = [...new Set(complaints.map(comp => comp.location).filter(Boolean))];

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">Customer Complaints</h1>
        <p className="text-gray-600">Manage and respond to customer complaints and feedback</p>
      </div>

      {/* Search and Filter Section */}
      <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4 mb-4">
          <div className="flex-1 relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, email, subject, or message..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearchClick()}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0B6D76] focus:border-transparent outline-none"
            />
          </div>
          <button
            onClick={handleSearchClick}
            className="px-4 py-2 bg-[#0B6D76] text-white rounded-lg hover:bg-[#095a61] transition-colors flex items-center gap-2"
          >
            <FaSearch /> Search
          </button>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2"
          >
            <FaFilter /> Filters
          </button>
          {hasActiveFilters && (
            <button
              onClick={handleClearFilters}
              className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors flex items-center gap-2"
            >
              <FaTimes /> Clear
            </button>
          )}
        </div>

        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-gray-200">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
              <select
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0B6D76] focus:border-transparent outline-none"
              >
                <option value="">All Locations</option>
                {locations.map((location) => (
                  <option key={location} value={location}>
                    {location}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
              <div className="relative">
                <FaCalendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0B6D76] focus:border-transparent outline-none"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
              <div className="relative">
                <FaCalendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0B6D76] focus:border-transparent outline-none"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Complaints Table */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-[#2E3B5A] text-white">
              <tr>
                <th className="py-3 px-4 text-left text-sm font-semibold">#</th>
                <th className="py-3 px-4 text-left text-sm font-semibold">Name</th>
                <th className="py-3 px-4 text-left text-sm font-semibold">Email</th>
                <th className="py-3 px-4 text-left text-sm font-semibold">Subject</th>
                <th className="py-3 px-4 text-left text-sm font-semibold">Location</th>
                <th className="py-3 px-4 text-left text-sm font-semibold">Date</th>
                <th className="py-3 px-4 text-left text-sm font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {complaints.map((complaint, index) => (
                <tr 
                  key={complaint.id} 
                  className={`hover:bg-gray-50 transition-colors ${complaint.is_read ? '' : 'bg-blue-50'}`}
                >
                  <td className="py-3 px-4 text-gray-600">{startIndex + index + 1}</td>
                  <td className="py-3 px-4 font-medium text-gray-800">{complaint.name}</td>
                  <td className="py-3 px-4 text-gray-600">{complaint.email}</td>
                  <td className="py-3 px-4 text-gray-600 max-w-xs truncate">{complaint.subject}</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                      {complaint.location || 'N/A'}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-gray-600">
                    {complaint.created_at ? new Date(complaint.created_at).toLocaleDateString() : ""}
                  </td>
                  <td className="py-3 px-4">
                    <button
                      onClick={() => viewComplaintDetails(complaint)}
                      className="px-3 py-1 bg-[#0B6D76] text-white rounded-lg hover:bg-[#095a61] transition-colors flex items-center gap-1 text-sm"
                    >
                      <FaEye /> View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {loading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0B6D76] mx-auto"></div>
            <p className="text-gray-500 mt-4">Loading complaints...</p>
          </div>
        )}
        
        {!loading && complaints.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">📝</div>
            <p className="text-gray-500 text-lg mb-2">
              {hasActiveFilters ? 'No complaints match your filters' : 'No complaints found'}
            </p>
            <p className="text-gray-400 text-sm">
              {hasActiveFilters ? 'Try adjusting your search criteria' : 'All customer complaints will appear here'}
            </p>
            {hasActiveFilters && (
              <button
                onClick={handleClearFilters}
                className="mt-4 px-4 py-2 bg-[#0B6D76] text-white rounded-lg hover:bg-[#095a61] transition-colors"
              >
                Clear all filters
              </button>
            )}
          </div>
        )}

        {!loading && complaints.length > 0 && (
          <div className="border-t border-gray-200 px-6 py-4">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
              totalItems={totalItems}
              startIndex={startIndex}
              endIndex={endIndex}
            />
          </div>
        )}
      </div>

      {/* Complaint Detail Modal */}
      {showDetailModal && selectedComplaint && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="bg-[#2E3B5A] text-white p-6 rounded-t-xl">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold">Complaint Details</h2>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="text-white hover:text-gray-200"
                >
                  <FaTimes size={20} />
                </button>
              </div>
              <p className="text-blue-100 mt-1">ID: #{selectedComplaint.id}</p>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Name</h3>
                  <p className="text-gray-800">{selectedComplaint.name}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Email</h3>
                  <p className="text-gray-800">{selectedComplaint.email}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Phone</h3>
                  <p className="text-gray-800">{selectedComplaint.phone || 'Not provided'}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Location</h3>
                  <p className="text-gray-800">{selectedComplaint.location || 'Not specified'}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Date Submitted</h3>
                  <p className="text-gray-800">
                    {selectedComplaint.created_at ? new Date(selectedComplaint.created_at).toLocaleString() : 'N/A'}
                  </p>
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Subject</h3>
                <p className="text-gray-800 font-medium">{selectedComplaint.subject}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Message</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-gray-800 whitespace-pre-wrap">{selectedComplaint.message}</p>
                </div>
              </div>
            </div>
            
            <div className="border-t border-gray-200 p-6 flex justify-end gap-3">
              <button
                onClick={() => setShowDetailModal(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InboxComplaints;