"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Trash2 } from "lucide-react";
import axios from "axios";
import Pagination from "../../components/Pagination";
import Swal from "sweetalert2";

const OnlineConsultantList = () => {
  const [consultations, setConsultations] = useState([]);
  const [deleteId, setDeleteId] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(15);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [interestedCountryFilter, setInterestedCountryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  
  // Applied filters state (only updated when search button is clicked)
  const [appliedSearchTerm, setAppliedSearchTerm] = useState('');
  const [appliedStartDate, setAppliedStartDate] = useState('');
  const [appliedEndDate, setAppliedEndDate] = useState('');
  const [appliedInterestedCountryFilter, setAppliedInterestedCountryFilter] = useState('');
  const [appliedStatusFilter, setAppliedStatusFilter] = useState('');

  // Reset to first page when applied filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [appliedSearchTerm, appliedStartDate, appliedEndDate, appliedInterestedCountryFilter, appliedStatusFilter]);

  const fetchConsultations = useCallback(async () => {
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: itemsPerPage.toString(),
      });

      if (appliedSearchTerm) {
        params.append("search", appliedSearchTerm);
      }
      if (appliedStartDate) {
        params.append("start_date", appliedStartDate);
      }
      if (appliedEndDate) {
        params.append("end_date", appliedEndDate);
      }
      if (appliedInterestedCountryFilter) {
        params.append("interested_country", appliedInterestedCountryFilter);
      }
      if (appliedStatusFilter) {
        params.append("status", appliedStatusFilter);
      }

      const response = await fetch(`/api/internal/online-consultant?${params.toString()}`);

      if (!response.ok) {
        const data = await response.json();
        Swal.fire({
          icon: "error",
          title: "Oops...",
          text: data.message || "An error occurred",
        });
        return;
      }

      const data = await response.json();
      setConsultations(data.data || []);
      setTotalItems(data.meta?.totalItems || 0);
      setTotalPages(data.meta?.totalPages || 1);
    } catch (error) {
      console.error("Fetch error:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to fetch consultations",
      });
    }
  }, [currentPage, appliedSearchTerm, appliedStartDate, appliedEndDate, appliedInterestedCountryFilter, appliedStatusFilter, itemsPerPage]);

  useEffect(() => {
    fetchConsultations();
  }, [fetchConsultations]);

  const handleSearch = () => {
    setAppliedSearchTerm(searchTerm);
    setAppliedStartDate(startDate);
    setAppliedEndDate(endDate);
    setAppliedInterestedCountryFilter(interestedCountryFilter);
    setAppliedStatusFilter(statusFilter);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setStartDate('');
    setEndDate('');
    setInterestedCountryFilter('');
    setStatusFilter('');
    setAppliedSearchTerm('');
    setAppliedStartDate('');
    setAppliedEndDate('');
    setAppliedInterestedCountryFilter('');
    setAppliedStatusFilter('');
  };

  const hasActiveFilters = appliedSearchTerm || appliedStartDate || appliedEndDate || appliedInterestedCountryFilter || appliedStatusFilter;

  const handleDelete = async () => {
    try {
      await axios.delete(`/api/online-consultant/${deleteId}`);
      setConsultations((prev) => prev.filter((c) => c.id !== deleteId));
      Swal.fire({
        icon: "success",
        title: "Deleted!",
        text: "Consultation has been deleted successfully",
      });
    } catch (error) {
      console.error("Delete error:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to delete consultation",
      });
    }
    setShowConfirm(false);
    setDeleteId(null);
  };

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + consultations.length;

  // Common countries for filter dropdown
  const commonCountries = ['Italy', 'UK', 'France', 'Turkey', 'China', 'Cyprus', 'Others'];

  return (
    <div className="space-y-6 p-6 bg-gradient-to-br from-blue-50 to-cyan-100 min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div className="text-center md:text-left">
          <h1 className="text-3xl font-bold text-gray-900">Online Consultant List</h1>
          <p className="text-gray-600 mt-2">Manage all online consultation requests</p>
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
              {[appliedSearchTerm, appliedStartDate, appliedEndDate, appliedInterestedCountryFilter, appliedStatusFilter].filter(Boolean).length}
            </span>
          )}
        </button>
      </div>

      {/* Filter Section */}
      {isFilterOpen && (
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Search Consultations</label>
              <input
                type="text"
                placeholder="Search by name, email, phone, education, program, or country..."
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
              <label className="block text-sm font-medium text-gray-700 mb-2">Interested Country</label>
              <select
                value={interestedCountryFilter}
                onChange={(e) => setInterestedCountryFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0B6D76] focus:border-transparent"
              >
                <option value="">All Countries</option>
                {commonCountries.map((country) => (
                  <option key={country} value={country}>{country}</option>
                ))}
                <option value="Other">Other</option>
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
            </div>
            
            {/* Active Filters Display */}
            {hasActiveFilters && (
              <div className="text-sm text-gray-600 flex flex-wrap gap-2">
                Active filters: 
                {appliedSearchTerm && <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded">Search: &quot;{appliedSearchTerm}&quot;</span>}
                {appliedStartDate && <span className="px-2 py-1 bg-green-100 text-green-800 rounded">Start: {appliedStartDate}</span>}
                {appliedEndDate && <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded">End: {appliedEndDate}</span>}
                {appliedInterestedCountryFilter && <span className="px-2 py-1 bg-orange-100 text-orange-800 rounded">Country: {appliedInterestedCountryFilter}</span>}
                {appliedStatusFilter && <span className="px-2 py-1 bg-pink-100 text-pink-800 rounded">Status: {appliedStatusFilter}</span>}
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
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 rounded-l-xl">Name</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Email</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Phone</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Education</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Program</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Country</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Created At</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {consultations.map((c) => (
              <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 font-medium text-gray-900">{c.student_name}</td>
                <td className="px-6 py-4 text-gray-600">{c.student_email}</td>
                <td className="px-6 py-4 text-gray-600">{c.student_phone_number}</td>
                <td className="px-6 py-4 text-gray-600">{c.student_last_education}</td>
                <td className="px-6 py-4 text-gray-600">{c.student_apply_for}</td>
                <td className="px-6 py-4 text-gray-600">{c.interested_country}</td>
                <td className="px-6 py-4 text-gray-500">
                  {c.created_at ? new Date(c.created_at).toLocaleDateString() : ""}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {consultations.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-500 text-lg">
              {hasActiveFilters ? 'No consultations found matching your filters.' : 'No consultations available.'}
            </div>
            <p className="text-gray-400 mt-2">
              {hasActiveFilters ? 'Try adjusting your search criteria or clear filters' : 'No consultation requests have been submitted yet'}
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

      {/* Delete Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md mx-4">
            <h3 className="text-lg font-semibold mb-4">Confirm Delete</h3>
            <p className="text-gray-600 mb-6">Are you sure you want to delete this consultation?</p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowConfirm(false)}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
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
 
export default OnlineConsultantList;