'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Download, Edit, Trash2, Filter, X, Search, Calendar, FileText } from 'lucide-react';
import Swal from 'sweetalert2';

const StudentSupportDocumentList = () => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [saving, setSaving] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  
  // Applied filter states
  const [appliedSearchTerm, setAppliedSearchTerm] = useState("");
  const [appliedStartDate, setAppliedStartDate] = useState("");
  const [appliedEndDate, setAppliedEndDate] = useState("");

  // Reset to first page when applied filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [appliedSearchTerm, appliedStartDate, appliedEndDate]);

  const fetchDocuments = useCallback(async () => {
    try {
      setLoading(true);
      
      // Build query parameters
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: itemsPerPage.toString(),
      });

      if (appliedSearchTerm) {
        params.append("search", appliedSearchTerm);
      }
      if (appliedStartDate) {
        params.append("startDate", appliedStartDate);
      }
      if (appliedEndDate) {
        params.append("endDate", appliedEndDate);
      }

      const response = await fetch(`/api/internal/student-support-documents?${params.toString()}`);
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to fetch documents');
      }

      const data = await response.json();
      
      // Handle both array response and paginated response
      if (Array.isArray(data)) {
        setDocuments(data);
        setTotalItems(data.length);
        setTotalPages(1);
      } else if (data.data && Array.isArray(data.data)) {
        setDocuments(data.data);
        setTotalItems(data.meta?.totalItems || data.data.length);
        setTotalPages(data.meta?.totalPages || 1);
      } else {
        setDocuments([]);
        setTotalItems(0);
        setTotalPages(1);
      }
      
      setError('');
    } catch (err) {
      console.error('Error fetching documents:', err);
      setError(err.message || 'Failed to fetch documents');
      setDocuments([]);
    } finally {
      setLoading(false);
    }
  }, [currentPage, appliedSearchTerm, appliedStartDate, appliedEndDate, itemsPerPage]);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  // Handle search button click
  const handleSearch = () => {
    setAppliedSearchTerm(searchTerm);
    setAppliedStartDate(startDate);
    setAppliedEndDate(endDate);
    setCurrentPage(1);
  };

  // Clear all filters
  const clearFilters = () => {
    setSearchTerm("");
    setStartDate("");
    setEndDate("");
    setAppliedSearchTerm("");
    setAppliedStartDate("");
    setAppliedEndDate("");
    setCurrentPage(1);
  };

  // Check if there are active filters
  const hasActiveFilters = appliedSearchTerm || appliedStartDate || appliedEndDate;

  const handleDelete = async (id) => {
    // Confirm deletion
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!'
    });

    if (!result.isConfirmed) return;

    try {
      const response = await fetch('/api/internal/student-support-documents', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id }),
      });

      if (!response.ok) {
        throw new Error('Failed to delete document');
      }

      // Remove the document from the list
      setDocuments(prev => prev.filter(doc => doc.id !== id));
      
      Swal.fire(
        'Deleted!',
        'The document has been deleted.',
        'success'
      );
    } catch (err) {
      console.error('Error deleting document:', err);
      Swal.fire(
        'Error!',
        'Failed to delete the document.',
        'error'
      );
    }
  };

  const handleEdit = (doc) => {
    setSelectedDoc(doc);
    setEditModalOpen(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      const formData = new FormData();
      formData.append('id', selectedDoc.id);
      formData.append('title', e.target.title.value);
      formData.append('description', e.target.description.value);
      
      if (e.target.file.files[0]) {
        formData.append('file', e.target.file.files[0]);
      }

      const response = await fetch('/api/internal/student-support-documents', {
        method: 'PATCH',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to update document');
      }

      const data = await response.json();
      
      // Update the document in the list
      setDocuments(prev => prev.map(doc => 
        doc.id === selectedDoc.id ? data.document : doc
      ));
      
      setEditModalOpen(false);
      setSelectedDoc(null);
      
      Swal.fire(
        'Updated!',
        'The document has been updated.',
        'success'
      );
    } catch (err) {
      console.error('Error updating document:', err);
      Swal.fire(
        'Error!',
        'Failed to update the document.',
        'error'
      );
    } finally {
      setSaving(false);
    }
  };

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);

  return (
    <div className="space-y-6 p-6 bg-gradient-to-br from-blue-50 to-indigo-100 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Student Support Documents</h1>
          <p className="text-gray-600 mt-2">Manage and access uploaded documents</p>
        </div>
        <button
          onClick={() => setIsFilterOpen(!isFilterOpen)}
          className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
            isFilterOpen 
              ? 'bg-blue-600 text-white' 
              : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
          }`}
        >
          <Filter size={18} />
          Filters {hasActiveFilters && `(${[appliedSearchTerm, appliedStartDate, appliedEndDate].filter(Boolean).length})`}
        </button>
      </div>

      {/* Filter Section */}
      {isFilterOpen && (
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Search Documents</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  placeholder="Search by title, description..."
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>
          
          <div className="flex gap-3 mt-4 pt-4 border-t border-gray-200">
            <button
              onClick={handleSearch}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <Search size={18} />
              Search
            </button>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors flex items-center gap-2"
              >
                <X size={18} />
                Clear Filters
              </button>
            )}
          </div>

          {/* Active Filters Display */}
          {hasActiveFilters && (
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <h4 className="text-sm font-medium text-blue-800 mb-2">Active Filters:</h4>
              <div className="flex flex-wrap gap-2">
                {appliedSearchTerm && (
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full flex items-center gap-1">
                    <Search size={12} />
                    Search: {appliedSearchTerm}
                  </span>
                )}
                {appliedStartDate && (
                  <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full flex items-center gap-1">
                    <Calendar size={12} />
                    From: {new Date(appliedStartDate).toLocaleDateString()}
                  </span>
                )}
                {appliedEndDate && (
                  <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full flex items-center gap-1">
                    <Calendar size={12} />
                    To: {new Date(appliedEndDate).toLocaleDateString()}
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Documents Table */}
      <div className="bg-white rounded-2xl shadow-xl p-6">
        {loading ? (
          <div className="text-center text-gray-600 py-12">
            <div className="animate-pulse">
              <FileText className="mx-auto text-gray-300" size={48} />
              <p className="mt-2">Loading documents...</p>
            </div>
          </div>
        ) : error ? (
          <div className="text-center text-red-600 py-12">
            <X className="mx-auto text-red-400" size={48} />
            <p className="mt-2">{error}</p>
            <button
              onClick={fetchDocuments}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        ) : documents.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="mx-auto text-gray-300" size={48} />
            <div className="text-gray-500 text-lg mt-2">
              {hasActiveFilters ? 'No documents found matching your filters.' : 'No documents found'}
            </div>
            <p className="text-gray-400 mt-2">
              {hasActiveFilters ? 'Try adjusting your filters or clear them to see all documents.' : 'Please upload new documents'}
            </p>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Clear all filters
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gradient-to-r from-blue-50 to-indigo-50">
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 rounded-l-xl">Title</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Description</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Download</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">Created At</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">Updated At</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900 rounded-r-xl">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {documents.map((doc) => (
                    <tr key={doc.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 font-medium text-gray-900">{doc.file_name}</td>
                      <td className="px-6 py-4 text-gray-600 max-w-md truncate">{doc.file_desc}</td>
                      <td className="px-6 py-4">
                        <a 
                          href={doc.document_file} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="flex items-center space-x-1 text-blue-600 hover:text-blue-800 hover:underline"
                        >
                          <Download size={16} />
                          <span>Download</span>
                        </a>
                      </td>
                      <td className="px-6 py-4 text-center text-gray-500">
                        {doc.created_at ? new Date(doc.created_at).toLocaleDateString() : '-'}
                      </td>
                      <td className="px-6 py-4 text-center text-gray-500">
                        {doc.updated_at ? new Date(doc.updated_at).toLocaleDateString() : '-'}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex justify-center space-x-2">
                          <button
                            onClick={() => handleEdit(doc)}
                            className="p-2 text-green-600 hover:bg-green-100 rounded-lg transition-colors"
                            title="Edit Document"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(doc.id)}
                            className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                            title="Delete Document"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

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
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`px-3 py-1 rounded border text-sm ${
                        currentPage === page
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
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
          </>
        )}
      </div>

      {/* Edit Modal */}
      {editModalOpen && selectedDoc && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white max-w-2xl w-full rounded-xl shadow-xl p-6 overflow-y-auto max-h-[90vh]">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">Edit Document: {selectedDoc.file_name}</h2>
              <button
                onClick={() => setEditModalOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input
                  type="text"
                  name="title"
                  defaultValue={selectedDoc.file_name}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  name="description"
                  defaultValue={selectedDoc.file_desc}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Replace File (Optional)
                </label>
                <input
                  type="file"
                  name="file"
                  accept=".pdf"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">Only PDF files are accepted</p>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setEditModalOpen(false)}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentSupportDocumentList;