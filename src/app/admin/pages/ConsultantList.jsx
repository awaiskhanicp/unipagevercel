'use client';

import React, { useEffect, useState } from "react";
import { Trash2, CheckCircle, XCircle } from "lucide-react";
import Pagination from "../components/Pagination";
import Swal from "sweetalert2";

const ConsultantList = () => {
  const [selectedConsultant, setSelectedConsultant] = useState(null);
  const [items, setItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [paginatedItems, setPaginatedItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const limit = 15;
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState(""); // '' | 'active' | 'inactive'
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  
  // Applied filters state (only updated when search button is clicked)
  const [appliedSearchTerm, setAppliedSearchTerm] = useState("");
  const [appliedStatusFilter, setAppliedStatusFilter] = useState("");
  const [appliedStartDate, setAppliedStartDate] = useState("");
  const [appliedEndDate, setAppliedEndDate] = useState("");
  
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const fetchConsultants = async (p = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: p.toString(),
        limit: limit.toString()
      });
      
      if (appliedSearchTerm) {
        params.append('search', appliedSearchTerm);
      }
      if (appliedStatusFilter) {
        params.append('status', appliedStatusFilter);
      }
      if (appliedStartDate) {
        params.append('start_date', appliedStartDate);
      }
      if (appliedEndDate) {
        params.append('end_date', appliedEndDate);
      }

      const res = await fetch(`/api/internal/consultants?${params.toString()}`);
      const data = await res.json();
      console.log('Fetched data for page:', p, data);
      
      // Set the data directly from API (already paginated)
      setItems(data.data || []);
      setTotalItems(data.meta?.totalItems || 0);
      setTotalPages(data.meta?.totalPages || 1);
      setFilteredItems(data.data || []);
    } catch (e) {
      console.error('Error fetching consultants:', e);
      setItems([]);
      setFilteredItems([]);
      setTotalItems(0);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { 
    console.log('Page changed to:', page);
    fetchConsultants(page); 
  }, [page, appliedSearchTerm, appliedStatusFilter, appliedStartDate, appliedEndDate]);

  const handleSearch = () => {
    setAppliedSearchTerm(searchTerm);
    setAppliedStatusFilter(statusFilter);
    setAppliedStartDate(startDate);
    setAppliedEndDate(endDate);
    setPage(1);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('');
    setStartDate('');
    setEndDate('');
    setAppliedSearchTerm('');
    setAppliedStatusFilter('');
    setAppliedStartDate('');
    setAppliedEndDate('');
    setPage(1);
  };

  const hasActiveFilters = appliedSearchTerm || appliedStatusFilter || appliedStartDate || appliedEndDate;

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

  // Toggle consultant status (activate/deactivate)
  const toggleConsultantStatus = async (consultant) => {
    const newStatus = !consultant.is_active;
    const action = newStatus ? 'activate' : 'deactivate';
    
    console.log('Toggling consultant status:', { consultant, newStatus, action });
    
    try {
      const result = await Swal.fire({
        title: `Are you sure?`,
        text: `Do you want to ${action} ${consultant.name}?`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#0B6D76',
        cancelButtonColor: '#d33',
        confirmButtonText: `Yes, ${action} it!`,
        cancelButtonText: 'Cancel'
      });

      if (result.isConfirmed) {
        console.log('Sending API request to:', `/api/internal/consultants/${consultant.id}`);
        const response = await fetch(`/api/internal/consultants/${consultant.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            is_active: newStatus
          }),
        });

        const data = await response.json();
        console.log('API response:', { response: response.ok, data });
        
        if (response.ok && data.success) {
          // Update the consultant in the local state
          const updatedItems = items.map((c) =>
            c.id === consultant.id ? { ...c, is_active: newStatus } : c
          );
          console.log('Updating state:', { oldItems: items, updatedItems });
          setItems(updatedItems);
          
          // Update filtered items if they exist
          if (filteredItems.length > 0) {
            const updatedFiltered = filteredItems.map((c) =>
              c.id === consultant.id ? { ...c, is_active: newStatus } : c
            );
            setFilteredItems(updatedFiltered);
          }
          
          Swal.fire({
            icon: 'success',
            title: 'Success!',
            text: `Consultant ${action}d successfully.`,
            confirmButtonColor: '#0B6D76',
            confirmButtonText: 'OK'
          });
        } else {
          throw new Error(data.message || `Failed to ${action} consultant`);
        }
      }
    } catch (error) {
      console.error(`Error ${action}ing consultant:`, error);
      Swal.fire({
        icon: 'error',
        title: 'Error!',
        text: error.message || `Failed to ${action} consultant`,
        confirmButtonColor: '#0B6D76',
        confirmButtonText: 'OK'
      });
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
        const res = await fetch(`/api/internal/consultants/${id}`, { method: 'DELETE' });
        const data = await res.json();
        if (res.ok && data.success) {
          const updatedItems = items.filter((consultant) => consultant.id !== id);
          setItems(updatedItems);
          
          // Update filtered items as well
          const updatedFiltered = filteredItems.filter((consultant) => consultant.id !== id);
          setFilteredItems(updatedFiltered);
          
          await Swal.fire('Deleted!', 'Consultant has been deleted.', 'success');
          if (updatedItems.length === 0 && page > 1) setPage(page - 1);
        } else {
          await Swal.fire('Error!', data.message || 'Failed to delete consultant', 'error');
        }
      } catch (error) {
        console.error('Delete error:', error);
        await Swal.fire('Error!', 'Network error, please try again.', 'error');
      }
    }
  };

  return (
    <div className="p-4 sm:p-6 bg-gray-50 min-h-screen">
      <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-6 sm:mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-1">Consultant List</h1>
            <p className="text-gray-600 text-sm sm:text-base">Manage consultant records</p>
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Search Consultants</label>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  placeholder="Search by name, email or mobile..."
                  className="w-full p-2 border rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full p-2 border rounded"
                >
                  <option value="">All</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
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
            {(appliedSearchTerm || appliedStatusFilter || appliedStartDate || appliedEndDate) && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="text-sm text-gray-600">
                  Active filters: 
                  {appliedSearchTerm && <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 rounded">Search: "{appliedSearchTerm}"</span>}
                  {appliedStatusFilter && <span className="ml-2 px-2 py-1 bg-purple-100 text-purple-800 rounded">Status: {appliedStatusFilter === 'active' ? 'Active' : 'Inactive'}</span>}
                  {appliedStartDate && <span className="ml-2 px-2 py-1 bg-orange-100 text-orange-800 rounded">From: {formatDate(appliedStartDate)}</span>}
                  {appliedEndDate && <span className="ml-2 px-2 py-1 bg-yellow-100 text-yellow-800 rounded">To: {formatDate(appliedEndDate)}</span>}
                </div>
              </div>
            )}
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px]">
            <thead>
              <tr className="bg-gray-100">
                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600 rounded-l-xl">Name</th>
                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600">Email</th>
                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600">Mobile</th>
                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600">Status</th>
                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600">Created At</th>
                <th className="py-3 px-4 text-center text-sm font-semibold text-gray-600 rounded-r-xl">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="6" className="py-6 text-center text-gray-500">Loading...</td>
                </tr>
              ) : filteredItems.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-6 text-center text-gray-500">
                    {hasActiveFilters ? 'No consultants found matching your filters.' : 'No consultants found.'}
                  </td>
                </tr>
              ) : (
                filteredItems.map((consultant) => (
                  <tr key={consultant.id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-3 px-4 font-medium text-gray-800">{consultant.name}</td>
                    <td className="py-3 px-4 text-gray-600">{consultant.email}</td>
                    <td className="py-3 px-4 text-gray-600">{consultant.mobile}</td>
                    <td className="py-3 px-4 text-gray-600">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        consultant.is_active 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {consultant.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-500">{formatDate(consultant.created_at)}</td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => toggleConsultantStatus(consultant)}
                          className={`p-2 rounded-lg transition-colors ${
                            consultant.is_active 
                              ? 'text-orange-600 hover:bg-orange-100' 
                              : 'text-green-600 hover:bg-green-100'
                          }`}
                          title={consultant.is_active ? 'Deactivate' : 'Activate'}
                        >
                          {consultant.is_active ? <XCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                        </button>
                        <button
                          className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                          onClick={() => handleDelete(consultant.id)}
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
        {filteredItems.length > 0 && (
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={setPage}
            totalItems={totalItems}
            startIndex={(page - 1) * limit}
            endIndex={Math.min(page * limit, totalItems)}
          />
        )}
      </div>
    </div>
  );
};

export default ConsultantList;