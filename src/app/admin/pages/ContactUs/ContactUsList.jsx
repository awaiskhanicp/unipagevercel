"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Trash2, Eye } from "lucide-react";
import Pagination from "../../../admin/components/Pagination";
import Swal from "sweetalert2";

const ContactMessages = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(15);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [officeFilter, setOfficeFilter] = useState("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  
  // Applied filters state (only updated when search button is clicked)
  const [appliedSearchTerm, setAppliedSearchTerm] = useState("");
  const [appliedStartDate, setAppliedStartDate] = useState("");
  const [appliedEndDate, setAppliedEndDate] = useState("");
  const [appliedOfficeFilter, setAppliedOfficeFilter] = useState("");
  
  const [officeLocations, setOfficeLocations] = useState([]);
  const [officeLoading, setOfficeLoading] = useState(false);

  const fetchOfficeLocations = async () => {
    try {
      setOfficeLoading(true);
      const res = await fetch('/api/internal/contact-us/offices');
      
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.data) {
          setOfficeLocations(data.data);
        } else {
          setOfficeLocations([]);
        }
      } else {
        setOfficeLocations([]);
      }
    } catch (error) {
      console.error('Error fetching office locations:', error);
      setOfficeLocations([]);
    } finally {
      setOfficeLoading(false);
    }
  };

  const fetchMessages = useCallback(async () => {
    setLoading(true);
    try {
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
      if (appliedOfficeFilter) {
        params.append('office', appliedOfficeFilter);
      }

      const res = await fetch(`/api/internal/contact-us?${params.toString()}`);
      
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`API Error: ${res.status} - ${errorText}`);
      }
      
      const data = await res.json();
      
      if (data.success) {
        setMessages(data.data || []);
        setTotalItems(data.meta?.totalItems || 0);
        setTotalPages(data.meta?.totalPages || 1);
      } else {
        const items = Array.isArray(data) ? data : data.data;
        if (items) {
          setMessages(items);
          setTotalItems(items.length);
          setTotalPages(Math.ceil(items.length / itemsPerPage));
        } else {
          setMessages([]);
          setTotalItems(0);
          setTotalPages(1);
        }
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
      setMessages([]);
      setTotalItems(0);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  }, [currentPage, appliedSearchTerm, appliedStartDate, appliedEndDate, appliedOfficeFilter, itemsPerPage]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  useEffect(() => {
    fetchOfficeLocations();
  }, []);

  const handleSearch = () => {
    setAppliedSearchTerm(searchTerm);
    setAppliedStartDate(startDate);
    setAppliedEndDate(endDate);
    setAppliedOfficeFilter(officeFilter);
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setStartDate('');
    setEndDate('');
    setOfficeFilter('');
    setAppliedSearchTerm('');
    setAppliedStartDate('');
    setAppliedEndDate('');
    setAppliedOfficeFilter('');
    setCurrentPage(1);
  };

  const hasActiveFilters = appliedSearchTerm || appliedStartDate || appliedEndDate || appliedOfficeFilter;

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

      if (result.isConfirmed) {
        const res = await fetch(`/api/internal/contact-us/${id}`, {
          method: "DELETE",
        });
        
        if (!res.ok) throw new Error("Failed to delete message");
        
        // Refresh the current page data
        fetchMessages();
        
        Swal.fire({
          icon: 'success',
          title: 'Deleted!',
          text: 'Message has been deleted successfully.',
          confirmButtonColor: '#0B6D76',
          confirmButtonText: 'OK'
        });
      }
    } catch (error) {
      console.error("Delete error:", error);
      Swal.fire({
        icon: 'error',
        title: 'Delete Failed!',
        text: 'Failed to delete message.',
        confirmButtonColor: '#0B6D76',
        confirmButtonText: 'OK'
      });
    }
  };

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + messages.length;

  return (
    <div className="space-y-6 p-6 bg-gradient-to-br from-blue-50 to-cyan-100 min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div className="text-center md:text-left">
          <h1 className="text-3xl font-bold text-gray-900">Contact Messages</h1>
          <p className="text-gray-600 mt-2">Manage and review contact form submissions</p>
        </div>
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
              {[appliedSearchTerm, appliedStartDate, appliedEndDate, appliedOfficeFilter].filter(Boolean).length}
            </span>
          )}
        </button>
      </div>

      {/* Filter Section */}
      {isFilterOpen && (
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Search Messages</label>
              <input
                type="text"
                placeholder="Search by name, email, phone, office, or message..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0B6D76] focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Office Location</label>
              <select
                value={officeFilter}
                onChange={(e) => setOfficeFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0B6D76] focus:border-transparent"
              >
                <option value="">All Offices</option>
                {officeLoading ? (
                  <option value="">Loading offices...</option>
                ) : officeLocations.length === 0 ? (
                  <>
                    <option value="Lahore">Lahore Office </option>
                    <option value="Karachi">Karachi Office </option>
                    <option value="Islamabad">Islamabad Office </option>
                  </>
                ) : (
                  officeLocations.map((office) => (
                    <option key={office.id} value={office.location}>
                      {office.location}
                    </option>
                  ))
                )}
              </select>
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
            </div>
            
            {/* Active Filters Display */}
            {hasActiveFilters && (
              <div className="text-sm text-gray-600">
                Active filters: 
                {appliedSearchTerm && <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 rounded">Search: &quot;{appliedSearchTerm}&quot;</span>}
                {appliedOfficeFilter && <span className="ml-2 px-2 py-1 bg-green-100 text-green-800 rounded">Office: {appliedOfficeFilter}</span>}
                {appliedStartDate && <span className="ml-2 px-2 py-1 bg-purple-100 text-purple-800 rounded">Start: {appliedStartDate}</span>}
                {appliedEndDate && <span className="ml-2 px-2 py-1 bg-orange-100 text-orange-800 rounded">End: {appliedEndDate}</span>}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-xl p-6 overflow-x-auto">
        <table className="w-full min-w-[900px]">
          <thead className="sticky top-0 bg-gradient-to-r from-blue-50 to-cyan-50 z-10">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 rounded-l-xl">Name</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Email</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Phone</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Office</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Message</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 rounded-r-xl">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                  Loading messages...
                </td>
              </tr>
            ) : messages.length === 0 ? (
              <tr>
                <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                  <div className="text-gray-500 text-lg">
                    {hasActiveFilters ? 'No messages found matching your filters.' : 'No messages available.'}
                  </div>
                  <p className="text-gray-400 mt-2">
                    {hasActiveFilters ? 'Try adjusting your search criteria or clear filters' : 'No contact messages have been submitted yet'}
                  </p>
                  {hasActiveFilters && (
                    <button
                      onClick={clearFilters}
                      className="mt-4 px-4 py-2 bg-[#0B6D76] text-white rounded-lg hover:bg-[#094F56] transition-colors"
                    >
                      Clear all filters
                    </button>
                  )}
                </td>
              </tr>
            ) : (
              messages.map((msg) => (
                <tr key={msg.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-gray-900">{msg.user_name}</td>
                  <td className="px-6 py-4 text-gray-600">{msg.user_email}</td>
                  <td className="px-6 py-4 text-gray-600">{msg.phone_number}</td>
                  <td className="px-6 py-4 text-gray-600">{msg.office_location}</td>
                  <td className="px-6 py-4 text-gray-600 max-w-xs truncate">{msg.message}</td>
                  <td className="px-6 py-4 text-gray-500 whitespace-nowrap">
                    {msg.created_at ? formatDate(msg.created_at) : '—'}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Pagination */}
        {totalPages > 1 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            totalItems={totalItems}
            startIndex={startIndex}
            endIndex={endIndex}
          />
        )}
      </div>
    </div>
  );
};

export default ContactMessages;