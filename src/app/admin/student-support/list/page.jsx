'use client';

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Layout from '../../components/Layout';
import dynamic from 'next/dynamic';
import { Download, Edit, Trash2 } from 'lucide-react';

const AddEditDocument = dynamic(() => import('../../../admin/student-support/adit/AddEditDocument'), { ssr: false });

const StudentSupportDocumentList = () => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [saving, setSaving] = useState(false);
  
  // Filter states (input)
  const [searchTerm, setSearchTerm] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  
  // Applied filter states
  const [appliedSearchTerm, setAppliedSearchTerm] = useState("");
  const [appliedStartDate, setAppliedStartDate] = useState("");
  const [appliedEndDate, setAppliedEndDate] = useState("");
  
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  useEffect(() => {
    fetchDocuments();
  }, [appliedSearchTerm, appliedStartDate, appliedEndDate]);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      
      // Build query parameters
      const params = new URLSearchParams();
      if (appliedSearchTerm) params.append('search', appliedSearchTerm);
      if (appliedStartDate) params.append('startDate', appliedStartDate);
      if (appliedEndDate) params.append('endDate', appliedEndDate);
      
      console.log('🔍 Frontend: Fetching documents with params:', params.toString());
      
      const url = params.toString() ? `/api/internal/student-support-documents?${params}` : '/api/internal/student-support-documents';
      const res = await axios.get(url);
      
      console.log('🔍 Frontend: Documents API response:', res.data);
      
      setDocuments(Array.isArray(res.data) ? res.data : []);
      setError('');
    } catch (err) {
      console.error('❌ Frontend: Error fetching documents:', err);
      setError('Failed to fetch documents.');
      setDocuments([]);
    } finally {
      setLoading(false);
    }
  };

  // Handle search button click
  const handleSearch = () => {
    setAppliedSearchTerm(searchTerm);
    setAppliedStartDate(startDate);
    setAppliedEndDate(endDate);
  };

  // Clear all filters
  const clearFilters = () => {
    setSearchTerm("");
    setStartDate("");
    setEndDate("");
    setAppliedSearchTerm("");
    setAppliedStartDate("");
    setAppliedEndDate("");
  };

  // Check if there are active filters
  const hasActiveFilters = appliedSearchTerm || appliedStartDate || appliedEndDate;

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this document?')) return;

    try {
      await axios.delete('/api/internal/student-support-documents', { data: { id } });
      setDocuments(prev => prev.filter(doc => doc.id !== id));
      alert('Document deleted successfully!');
    } catch (err) {
      alert('Failed to delete document.');
    }
  };

  const handleEdit = (doc) => {
    setSelectedDoc(doc);
    setEditModalOpen(true);
  };

  const handleEditSubmit = async (updatedData) => {
    setSaving(true);
    try {
      const formData = new FormData();
      formData.append('id', selectedDoc.id);
      formData.append('title', updatedData.title);
      formData.append('description', updatedData.description);
      if (updatedData.file) formData.append('file', updatedData.file);

      await fetch('/api/internal/student-support-documents', {
        method: 'PATCH',
        body: formData,
      });
      alert('Document updated successfully!');
      setEditModalOpen(false);
      setSelectedDoc(null);
      fetchDocuments();
    } catch (err) {
      alert('Failed to update document.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Layout>
      <div className="space-y-6 p-6 bg-gradient-to-br from-blue-50 to-indigo-100 min-h-screen">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Student Support Documents</h1>
            <p className="text-gray-600 mt-2">Manage and access uploaded documents</p>
          </div>
          <button
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className={`px-4 py-2 rounded-lg transition-colors ${
              isFilterOpen 
                ? 'bg-blue-600 text-white' 
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            🔍 Filters {hasActiveFilters && `(${hasActiveFilters ? 1 : 0})`}
          </button>
        </div>

        {/* Filter Section */}
        {isFilterOpen && (
          <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Search Documents</label>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  placeholder="Search by title, description..."
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
            </div>
            
            <div className="flex gap-3 mt-4">
              <button
                onClick={handleSearch}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                🔍 Search
              </button>
              <button
                onClick={clearFilters}
                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
              >
                Clear Filters
              </button>
            </div>

            {/* Active Filters Display */}
            {hasActiveFilters && (
              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <h4 className="text-sm font-medium text-blue-800 mb-2">Active Filters:</h4>
                <div className="flex flex-wrap gap-2">
                  {appliedSearchTerm && (
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                      Search: {appliedSearchTerm}
                    </span>
                  )}
                  {appliedStartDate && (
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                      From: {new Date(appliedStartDate).toLocaleDateString()}
                    </span>
                  )}
                  {appliedEndDate && (
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                      To: {new Date(appliedEndDate).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-xl p-6">
          {loading ? (
            <div className="text-center text-gray-600 py-12">Loading...</div>
          ) : error ? (
            <div className="text-center text-red-600 py-12">{error}</div>
          ) : documents.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-500 text-lg">
                {hasActiveFilters ? 'No documents found matching your filters.' : 'No documents found'}
              </div>
              <p className="text-gray-400 mt-2">
                {hasActiveFilters ? 'Try adjusting your filters or clear them to see all documents.' : 'Please upload new documents'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gradient-to-r from-blue-50 to-indigo-50">
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 rounded-l-xl">Title</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Description</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Download</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">Created At</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">Updated At</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900 rounded-r-xl">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {documents.map((doc) => (
                    <tr key={doc.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 font-medium text-gray-900">{doc.file_name}</td>
                      <td className="px-6 py-4 text-gray-600">{doc.file_desc}</td>
                      <td className="px-6 py-4 text-blue-600 hover:underline">
                        <a href={doc.document_file} target="_blank" rel="noopener noreferrer" className="flex items-center space-x-1">
                          <Download className="w-4 h-4" />
                          <span>Download</span>
                        </a>
                      </td>
                      <td className="px-6 py-4 text-center text-gray-500">
                        {doc.created_at ? new Date(doc.created_at).toLocaleDateString() : ''}
                      </td>
                      <td className="px-6 py-4 text-center text-gray-500">
                        {doc.updated_at ? new Date(doc.updated_at).toLocaleDateString() : ''}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={() => handleEdit(doc)}
                          className="p-2 text-green-600 hover:bg-green-100 rounded-lg transition-colors mr-2"
                          title="Edit Document"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(doc.id)}
                          className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                          title="Delete Document"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Edit Modal */}
        {editModalOpen && selectedDoc && (
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white max-w-2xl w-full rounded-xl shadow-xl p-6 overflow-y-auto max-h-[90vh]">
              <h2 className="text-xl font-bold mb-4 text-center">
                Edit Document: {selectedDoc.file_name}
              </h2>

              <AddEditDocument
                mode="edit"
                initialData={selectedDoc}
                onSuccess={() => {
                  setEditModalOpen(false);
                  setSelectedDoc(null);
                  fetchDocuments();
                }}
              />
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default StudentSupportDocumentList;