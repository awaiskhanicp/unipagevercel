'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Download, Search, Calendar, Filter, X, FileText, Mail, Phone, User } from 'lucide-react';
import Swal from 'sweetalert2';

const StudentSupportDocumentDownloadList = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(15);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [documentFilter, setDocumentFilter] = useState('');
  const [documents, setDocuments] = useState([]);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  
  // Applied filters state
  const [appliedSearchTerm, setAppliedSearchTerm] = useState('');
  const [appliedStartDate, setAppliedStartDate] = useState('');
  const [appliedEndDate, setAppliedEndDate] = useState('');
  const [appliedDocumentFilter, setAppliedDocumentFilter] = useState('');

  // Reset to first page when applied filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [appliedSearchTerm, appliedStartDate, appliedEndDate, appliedDocumentFilter]);

  // Fetch documents for filter dropdown
  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        const response = await fetch('/api/internal/student-support-documents');
        if (response.ok) {
          const data = await response.json();
          setDocuments(Array.isArray(data) ? data : []);
        }
      } catch (error) {
        console.error('Error fetching documents:', error);
      }
    };
    fetchDocuments();
  }, []);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: itemsPerPage.toString(),
      });

      if (appliedSearchTerm) {
        params.append('search', appliedSearchTerm);
      }
      if (appliedStartDate) {
        params.append('startDate', appliedStartDate);
      }
      if (appliedEndDate) {
        params.append('endDate', appliedEndDate);
      }
      if (appliedDocumentFilter) {
        params.append('documentId', appliedDocumentFilter);
      }

      const response = await fetch(`/api/internal/student-support-document-downloads?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch download users');
      }

      const data = await response.json();
      
      if (data.success) {
        setUsers(data.data || []);
        setTotalItems(data.meta?.totalItems || 0);
        setTotalPages(data.meta?.totalPages || 1);
      } else {
        throw new Error(data.message || 'Failed to fetch download users');
      }
      
      setError('');
    } catch (err) {
      console.error('Error fetching download users:', err);
      setError(err.message || 'Failed to fetch download users');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, [currentPage, appliedSearchTerm, appliedStartDate, appliedEndDate, appliedDocumentFilter, itemsPerPage]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleSearch = () => {
    setAppliedSearchTerm(searchTerm);
    setAppliedStartDate(startDate);
    setAppliedEndDate(endDate);
    setAppliedDocumentFilter(documentFilter);
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setStartDate('');
    setEndDate('');
    setDocumentFilter('');
    setAppliedSearchTerm('');
    setAppliedStartDate('');
    setAppliedEndDate('');
    setAppliedDocumentFilter('');
    setCurrentPage(1);
  };

  const hasActiveFilters = appliedSearchTerm || appliedStartDate || appliedEndDate || appliedDocumentFilter;

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + users.length, totalItems);

  return (
    <div className="space-y-6 p-6 bg-gradient-to-br from-blue-50 to-cyan-100 min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div className="text-center md:text-left">
          <h1 className="text-3xl font-bold text-gray-900">Document Download Users</h1>
          <p className="text-gray-600 mt-2">Track users who downloaded support documents</p>
        </div>
        <button
          onClick={() => setIsFilterOpen(!isFilterOpen)}
          className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
            isFilterOpen 
              ? 'bg-[#0B6D76] text-white' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <Filter size={18} />
          Filters
          {hasActiveFilters && (
            <span className="ml-1 px-2 py-1 bg-white text-[#0B6D76] text-xs rounded-full">
              {[appliedSearchTerm, appliedStartDate, appliedEndDate, appliedDocumentFilter].filter(Boolean).length}
            </span>
          )}
        </button>
      </div>

      {/* Filter Section */}
      {isFilterOpen && (
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Search Users</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  placeholder="Search by name, email, or phone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0B6D76] focus:border-transparent"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0B6D76] focus:border-transparent"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0B6D76] focus:border-transparent"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Document</label>
              <select
                value={documentFilter}
                onChange={(e) => setDocumentFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0B6D76] focus:border-transparent"
              >
                <option value="">All Documents</option>
                {documents.map((doc) => (
                  <option key={doc.id} value={doc.id}>
                    {doc.file_name}
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
                <Search size={18} />
                Search
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
              <div className="text-sm text-gray-600 flex flex-wrap gap-2">
                {appliedSearchTerm && (
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                    Search: "{appliedSearchTerm}"
                  </span>
                )}
                {appliedStartDate && (
                  <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                    From: {new Date(appliedStartDate).toLocaleDateString()}
                  </span>
                )}
                {appliedEndDate && (
                  <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs">
                    To: {new Date(appliedEndDate).toLocaleDateString()}
                  </span>
                )}
                {appliedDocumentFilter && (
                  <span className="px-2 py-1 bg-orange-100 text-orange-800 rounded-full text-xs">
                    Document: {documents.find(d => d.id === appliedDocumentFilter)?.file_name}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-xl p-6 overflow-x-auto">
        <table className="w-full min-w-[1000px]">
          <thead className="sticky top-0 bg-gradient-to-r from-blue-50 to-cyan-50 z-10">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 rounded-l-xl">User</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Contact Info</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 rounded-r-xl">Download Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center">
                    <User className="w-5 h-5 text-gray-400 mr-2" />
                    <span className="font-medium text-gray-900">{user.name || 'Unknown'}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="space-y-1">
                    {user.email && (
                      <div className="flex items-center">
                        <Mail className="w-4 h-4 text-gray-400 mr-2" />
                        <span className="text-gray-600">{user.email}</span>
                      </div>
                    )}
                    {user.phone && (
                      <div className="flex items-center">
                        <Phone className="w-4 h-4 text-gray-400 mr-2" />
                        <span className="text-gray-600">{user.phone}</span>
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 text-gray-500">
                  {user.created_at ? new Date(user.created_at).toLocaleDateString() : ''}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {users.length === 0 && !loading && (
          <div className="text-center py-12">
            <div className="text-gray-500 text-lg">
              {hasActiveFilters ? 'No users found matching your filters.' : 'No download records found.'}
            </div>
            <p className="text-gray-400 mt-2">
              {hasActiveFilters ? 'Try adjusting your search criteria or clear filters' : 'No users have downloaded documents yet'}
            </p>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="mt-4 px-4 py-2 bg-[#0B6D76] text-white rounded-lg hover:bg-[#094F56] transition-colors"
              >
                Clear all filters
              </button>
            )}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-6 pt-6 border-t border-gray-200">
            <div className="text-sm text-gray-700">
              Showing {startIndex + 1} to {endIndex} of {totalItems} results
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 rounded border border-gray-300 text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Previous
              </button>
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }
                
                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`px-3 py-1 rounded border text-sm ${
                      currentPage === pageNum
                        ? 'bg-[#0B6D76] text-white border-[#0B6D76]'
                        : 'border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 rounded border border-gray-300 text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {loading && (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0B6D76] mx-auto"></div>
          <p className="text-gray-600 mt-2">Loading users...</p>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
          <p className="text-red-600">{error}</p>
          <button
            onClick={fetchUsers}
            className="mt-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      )}
    </div>
  );
};

export default StudentSupportDocumentDownloadList;