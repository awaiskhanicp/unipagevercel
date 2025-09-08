"use client";

import React, { useEffect, useState } from "react";
import Pagination from "../../admin/components/Pagination";
import { Eye, Trash2, X } from "lucide-react";
import Swal from 'sweetalert2';

const ContactMessages = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [limit] = useState(15);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [officeFilter, setOfficeFilter] = useState("");
  
  // Applied filters state (only updated when search button is clicked)
  const [appliedSearchTerm, setAppliedSearchTerm] = useState("");
  const [appliedStartDate, setAppliedStartDate] = useState("");
  const [appliedEndDate, setAppliedEndDate] = useState("");
  const [appliedOfficeFilter, setAppliedOfficeFilter] = useState("");
  
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [officeLocations, setOfficeLocations] = useState([]);
  const [officeLoading, setOfficeLoading] = useState(false);

  const fetchOfficeLocations = async () => {
    try {
      setOfficeLoading(true);
      console.log('🔍 Frontend: Fetching office locations...');
      
      // First test if the main contact messages API is working
      console.log('🔍 Frontend: Testing main contact messages API...');
      const testRes = await fetch('/api/internal/contactUs?page=1&limit=5');
      console.log('🔍 Frontend: Main API test response status:', testRes.status);
      
      if (testRes.ok) {
        const testData = await testRes.json();
        console.log('🔍 Frontend: Main API test response:', testData);
      }
      
      // Now fetch office locations
      const res = await fetch('/api/internal/contactUs/offices');
      console.log('🔍 Frontend: Office locations response status:', res.status);
      
      if (res.ok) {
        const data = await res.json();
        console.log('🔍 Frontend: Office locations API response:', data);
        
        if (data.success && data.data) {
          setOfficeLocations(data.data);
          console.log('✅ Frontend: Office locations loaded successfully:', data.data.length);
        } else {
          console.warn('⚠️ Frontend: Office locations API returned success: false:', data);
          setOfficeLocations([]);
        }
      } else {
        console.error('❌ Frontend: Failed to fetch office locations:', res.status, res.statusText);
        setOfficeLocations([]);
      }
    } catch (error) {
      console.error('❌ Frontend: Error fetching office locations:', error);
      setOfficeLocations([]);
    } finally {
      setOfficeLoading(false);
    }
  };

  const fetchMessages = async (p = 1) => {
    setLoading(true);
    try {
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
      if (appliedOfficeFilter) {
        params.append('office', appliedOfficeFilter);
      }

      const apiUrl = `/api/internal/contactUs?${params.toString()}`;
      console.log('🔍 Frontend: Fetching contact messages with params:', params.toString());
      console.log('🔍 Frontend: Full API URL:', apiUrl);

      const startTime = Date.now();
      const res = await fetch(apiUrl);
      const responseTime = Date.now() - startTime;
      
      console.log('🔍 Frontend: Response status:', res.status);
      console.log('🔍 Frontend: Response time:', `${responseTime}ms`);
      
      if (!res.ok) {
        const errorText = await res.text();
        console.error('❌ Frontend: API response not ok:', res.status, errorText);
        throw new Error(`API Error: ${res.status} - ${errorText}`);
      }
      
      const data = await res.json();
      
      console.log('🔍 Frontend: Contact messages API response:', data);
      console.log('🔍 Frontend: Response size:', `${JSON.stringify(data).length} bytes`);
      
      if (data.success) {
        setMessages(data.data || []);
        setTotalItems(data.meta?.totalItems || 0);
        setTotalPages(data.meta?.totalPages || 1);
        console.log('✅ Frontend: Successfully set messages data:', {
          messagesCount: data.data?.length || 0,
          totalItems: data.meta?.totalItems || 0,
          totalPages: data.meta?.totalPages || 1
        });
      } else {
        console.warn('⚠️ Frontend: API returned success: false:', data);
        // Fallback to array format if available
        const items = Array.isArray(data) ? data : data.data;
        if (items) {
          setMessages(items);
          setTotalItems(items.length);
          setTotalPages(Math.ceil(items.length / limit));
          console.log('✅ Frontend: Fallback to array format successful');
        } else {
          setMessages([]);
          setTotalItems(0);
          setTotalPages(1);
          console.warn('⚠️ Frontend: No data available, setting empty state');
        }
      }
    } catch (error) {
      console.error("❌ Frontend: Error fetching messages:", error);
      console.error("❌ Frontend: Error details:", {
        name: error.name,
        message: error.message,
        stack: error.stack
      });
      setMessages([]);
      setTotalItems(0);
      setTotalPages(1);
      
      if (error.message.includes('API Error')) {
        console.error('❌ Frontend: API Error detected');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages(page);
  }, [page, appliedSearchTerm, appliedStartDate, appliedEndDate, appliedOfficeFilter]);

  useEffect(() => {
    fetchOfficeLocations();
  }, []);

  const handleSearch = () => {
    setAppliedSearchTerm(searchTerm);
    setAppliedStartDate(startDate);
    setAppliedEndDate(endDate);
    setAppliedOfficeFilter(officeFilter);
    setPage(1);
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
    setPage(1);
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
        const res = await fetch(`/api/internal/contactUs/${id}`, {
          method: "DELETE",
        });
        
        if (!res.ok) throw new Error("Failed to delete message");
        
        // Refresh the current page data instead of filtering locally
        fetchMessages(page);
        
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

  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + messages.length;

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="bg-white rounded-2xl shadow-lg p-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-6 sm:mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-1">Contact Messages</h1>
            <p className="text-gray-600 text-sm sm:text-base">Manage and review contact form submissions</p>
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Search Messages</label>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  placeholder="Search by name, email, phone, office, or message..."
                  className="w-full p-2 border rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Office Location</label>
                <select
                  value={officeFilter}
                  onChange={(e) => setOfficeFilter(e.target.value)}
                  className="w-full p-2 border rounded"
                >
                  <option value="">All Offices</option>
                  {officeLoading ? (
                    <option value="">Loading offices...</option>
                  ) : officeLocations.length === 0 ? (
                    <>
                      <option value="">No offices found.</option>
                      <option value="Lahore Office">Lahore Office (Sample)</option>
                      <option value="Karachi Office">Karachi Office (Sample)</option>
                      <option value="Islamabad Office">Islamabad Office (Sample)</option>
                    </>
                  ) : (
                    officeLocations.map((office) => (
                      <option key={office.id} value={office.location}>
                        {office.location}
                      </option>
                    ))
                  )}
                </select>
                {/* Debug info */}
                <div className="text-xs text-gray-500 mt-1">
                  {officeLoading ? 'Loading...' : `${officeLocations.length} offices loaded`}
                  {officeLocations.length === 0 && ' (showing sample offices)'}
                </div>
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
              <div className="flex items-end gap-2 sm:col-span-2 lg:col-span-4">
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
            {(appliedSearchTerm || appliedStartDate || appliedEndDate || appliedOfficeFilter) && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="text-sm text-gray-600">
                  Active filters: 
                  {appliedSearchTerm && <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 rounded">Search: "{appliedSearchTerm}"</span>}
                  {appliedOfficeFilter && <span className="ml-2 px-2 py-1 bg-green-100 text-green-800 rounded">Office: {appliedOfficeFilter}</span>}
                  {appliedStartDate && <span className="ml-2 px-2 py-1 bg-orange-100 text-orange-800 rounded">From: {formatDate(appliedStartDate)}</span>}
                  {appliedEndDate && <span className="ml-2 px-2 py-1 bg-yellow-100 text-yellow-800 rounded">To: {formatDate(appliedEndDate)}</span>}
                </div>
              </div>
            )}
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="bg-gray-100">
                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600 rounded-l-xl">Name</th>
                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600">Email</th>
                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600">Phone</th>
                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600">Office</th>
                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600">Message</th>
                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600 rounded-r-xl">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="6" className="py-6 text-center text-gray-500">Loading...</td>
                </tr>
              ) : messages.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-6 text-center text-gray-500">
                    {hasActiveFilters ? 'No messages found matching your filters.' : 'No messages available.'}
                  </td>
                </tr>
              ) : (
                messages.map((msg) => (
                  <tr key={msg.id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-3 px-4 font-medium text-gray-800">{msg.user_name}</td>
                    <td className="py-3 px-4 text-gray-600">{msg.user_email}</td>
                    <td className="py-3 px-4 text-gray-600">{msg.phone_number}</td>
                    <td className="py-3 px-4 text-gray-600">{msg.office_location}</td>
                    <td className="py-3 px-4 text-gray-600">
                      <div className="max-h-10 overflow-y-auto">
                        {msg.message}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-gray-600 whitespace-nowrap">
                      {msg.created_at ? formatDate(msg.created_at) : '—'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={(p) => setPage(Math.min(Math.max(1, p), totalPages))}
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