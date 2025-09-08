"use client";

import React, { useEffect, useState } from "react";
import { Edit, Trash2 } from "lucide-react";
import Pagination from '../../components/Pagination';

const ApplyNowList = () => {
  const [list, setList] = useState([]);
  const [deleteId, setDeleteId] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [appliedSearchTerm, setAppliedSearchTerm] = useState(''); // Only applied when search button is clicked
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(15);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const fetchList = async (p = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: p.toString(),
        limit: itemsPerPage.toString()
      });
      
      if (appliedSearchTerm) {
        params.append('search', appliedSearchTerm);
      }

      console.log('🔍 Fetching applynow with params:', params.toString());
      console.log('🔍 Applied search term:', appliedSearchTerm);

      const res = await fetch(`/api/internal/applynow?${params.toString()}`);
      const data = await res.json();
      
      console.log('🔍 ApplyNow API response:', data);
      
      if (data.success) {
        setList(data.data || []);
        setTotalItems(data.meta?.totalItems || 0);
        setTotalPages(data.meta?.totalPages || 1);
        
        console.log('🔍 ApplyNow loaded:', {
          count: data.data?.length || 0,
          totalItems: data.meta?.totalItems || 0,
          totalPages: data.meta?.totalPages || 1,
          searchTerm: appliedSearchTerm
        });
      } else {
        setList([]);
        setTotalItems(0);
        setTotalPages(1);
      }
    } catch (error) {
      console.error('Error fetching applynow:', error);
      setList([]);
      setTotalItems(0);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { 
    fetchList(currentPage); 
  }, [currentPage, appliedSearchTerm]);

  const handleDelete = async () => {
    try {
      await fetch(`/api/internal/applynow/${deleteId}`, { method: 'DELETE' });
      fetchList(currentPage);
    } catch {}
    setShowConfirm(false);
    setDeleteId(null);
  };

  // Handle search button click
  const handleSearch = () => {
    console.log('🔍 Search button clicked with term:', searchTerm);
    setAppliedSearchTerm(searchTerm);
    setCurrentPage(1);
  };

  // Clear search
  const clearSearch = () => {
    setSearchTerm('');
    setAppliedSearchTerm('');
    setCurrentPage(1);
  };

  // Reset to first page when search term changes
  const handleSearchChange = (value) => {
    setSearchTerm(value);
    // Don't reset page here - only when search button is clicked
  };

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + list.length;

  return (
    <div className="p-4 sm:p-6 bg-gradient-to-br from-blue-50 to-cyan-100 min-h-screen">
      <div className="bg-white rounded-2xl shadow-xl p-4 sm:p-6">
        {/* Search */}
        <div className="mb-6">
          <div className="flex items-center gap-3">
            <div className="flex-1 flex items-center gap-2">
              <input
                type="text"
                placeholder="Search by name, city, phone, education, interest, or country..."
                value={searchTerm}
                onChange={(e) => handleSearchChange(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
              />
              <button
                onClick={handleSearch}
                className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                🔍 Search
              </button>
              {appliedSearchTerm && (
                <button
                  onClick={clearSearch}
                  className="px-4 py-3 bg-gray-500 text-white rounded-xl hover:bg-gray-600 transition-colors"
                >
                  Clear
                </button>
              )}
            </div>
          </div>
          
          {/* Active Search Display */}
          {appliedSearchTerm && (
            <div className="mt-3 text-sm text-gray-600 bg-blue-100 px-4 py-2 rounded-lg">
              <span className="font-medium">Active search:</span> "{appliedSearchTerm}"
              <span className="ml-2 text-xs text-gray-500">
                (Found {list.length} results)
              </span>
            </div>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px]">
            <thead className="sticky top-0 bg-gradient-to-r from-blue-50 to-cyan-50 z-10">
              <tr className="bg-gradient-to-r from-blue-50 to-cyan-50">
                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-900 rounded-l-xl">Name</th>
                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-900">City</th>
                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-900">Phone</th>
                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-900">Education</th>
                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-900">Interest</th>
                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-900">Date</th>
                {/* <th className="py-3 px-4 text-center text-sm font-semibold text-gray-900 rounded-r-xl">Action</th> */}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="7" className="py-6 text-center text-gray-500">Loading...</td>
                </tr>
              ) : list.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-6 text-center text-gray-500">
                    {appliedSearchTerm ? `No entries found matching "${appliedSearchTerm}".` : 'No entries found.'}
                  </td>
                </tr>
              ) : (
                list.map((c) => (
                  <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-3 px-4 font-medium text-gray-900">{c.name}</td>
                    <td className="py-3 px-4 text-gray-600">{c.city}</td>
                    <td className="py-3 px-4 text-gray-600">{c.phone_number}</td>
                    <td className="py-3 px-4 text-gray-600">{c.last_education}</td>
                    <td className="py-3 px-4 text-gray-600">{c.intrested_country}</td>
                    <td className="py-3 px-4 text-gray-500">{c.created_at ? new Date(c.created_at).toLocaleDateString() : ''}</td>
                    <td className="py-3 px-4 flex justify-center gap-2 flex-wrap">
                      {/* <button className="p-2 text-green-600 hover:bg-green-100 rounded-lg transition-colors">
                        <Edit className="w-4 h-4" />
                      </button> */}
                      {/* <button
                        onClick={() => {
                            // setDeleteId(c.id);
                            // setShowConfirm(true);
                        }}
                        className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button> */}
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
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            totalItems={totalItems}
            startIndex={startIndex}
            endIndex={endIndex}
          />
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      {showConfirm && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-[1200px] shadow-xl">
            <h2 className="text-lg font-semibold text-gray-800 mb-2">Are you sure?</h2>
            <p className="text-sm text-gray-600 mb-4">
              This will permanently delete the entry. This action cannot be undone.
            </p>
            <div className="flex justify-end gap-2 flex-wrap">
              <button
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 w-full sm:w-auto"
                onClick={() => {
                  setShowConfirm(false);
                  setDeleteId(null);
                }}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 w-full sm:w-auto"
                onClick={handleDelete}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ApplyNowList;