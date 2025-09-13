"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Trash2 } from "lucide-react";
import axios from "axios";
import Pagination from "../../components/Pagination";
import Swal from "sweetalert2";

const LeadsList = () => {
  const [leads, setLeads] = useState([]);
  const [showConfirm, setShowConfirm] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(15);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [countryFilter, setCountryFilter] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  
  // Applied filters state (only updated when search button is clicked)
  const [appliedSearchTerm, setAppliedSearchTerm] = useState('');
  const [appliedStartDate, setAppliedStartDate] = useState('');
  const [appliedEndDate, setAppliedEndDate] = useState('');
  const [appliedDepartmentFilter, setAppliedDepartmentFilter] = useState('');
  const [appliedCountryFilter, setAppliedCountryFilter] = useState('');

  // Reset to first page when applied filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [appliedSearchTerm, appliedStartDate, appliedEndDate, appliedDepartmentFilter, appliedCountryFilter]);

  const fetchLeads = useCallback(async () => {
    try {
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
      if (appliedDepartmentFilter) {
        params.append("department", appliedDepartmentFilter);
      }
      if (appliedCountryFilter) {
        params.append("country", appliedCountryFilter);
      }

      const response = await fetch(`/api/internal/minhaj-leads?${params.toString()}`);

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
      setLeads(data.data || []);
      setTotalItems(data.meta?.totalItems || 0);
      setTotalPages(data.meta?.totalPages || 1);
    } catch (error) {
      console.error("Fetch error:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to fetch leads",
      });
    }
  }, [currentPage, appliedSearchTerm, appliedStartDate, appliedEndDate, appliedDepartmentFilter, appliedCountryFilter, itemsPerPage]);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  const handleSearch = () => {
    setAppliedSearchTerm(searchTerm);
    setAppliedStartDate(startDate);
    setAppliedEndDate(endDate);
    setAppliedDepartmentFilter(departmentFilter);
    setAppliedCountryFilter(countryFilter);
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setStartDate('');
    setEndDate('');
    setDepartmentFilter('');
    setCountryFilter('');
    setAppliedSearchTerm('');
    setAppliedStartDate('');
    setAppliedEndDate('');
    setAppliedDepartmentFilter('');
    setAppliedCountryFilter('');
    setCurrentPage(1);
  };

  const hasActiveFilters = appliedSearchTerm || appliedStartDate || appliedEndDate || appliedDepartmentFilter || appliedCountryFilter;


  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + leads.length;

  return (
    <div className="space-y-6 p-6 bg-gradient-to-br from-blue-50 to-cyan-100 min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div className="text-center md:text-left">
          <h1 className="text-3xl font-bold text-gray-900">Leads List</h1>
          <p className="text-gray-600 mt-2">Manage all leads</p>
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
              {[appliedSearchTerm, appliedStartDate, appliedEndDate, appliedDepartmentFilter, appliedCountryFilter].filter(Boolean).length}
            </span>
          )}
        </button>
      </div>

      {/* Filter Section */}
      {isFilterOpen && (
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Search Leads</label>
              <input
                type="text"
                placeholder="Search by name, email, roll number, or WhatsApp..."
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
              <label className="block text-sm font-medium text-gray-700 mb-2">Department</label>
              <select
                value={departmentFilter}
                onChange={(e) => setDepartmentFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0B6D76] focus:border-transparent"
              >
                <option value="">All Departments</option>
                <option value="Computer Science">Computer Science</option>
                <option value="Business">Business</option>
                <option value="Engineering">Engineering</option>
                <option value="Medical">Medical</option>
                {/* Add more department options as needed */}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Country</label>
              <select
                value={countryFilter}
                onChange={(e) => setCountryFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0B6D76] focus:border-transparent"
              >
                <option value="">All Countries</option>
                <option value="USA">USA</option>
                <option value="UK">UK</option>
                <option value="Canada">Canada</option>
                <option value="Australia">Australia</option>
                {/* Add more country options as needed */}
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
                {appliedSearchTerm && <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded">Search: {appliedSearchTerm}</span>}
                {appliedStartDate && <span className="px-2 py-1 bg-green-100 text-green-800 rounded">Start: {appliedStartDate}</span>}
                {appliedEndDate && <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded">End: {appliedEndDate}</span>}
                {appliedDepartmentFilter && <span className="px-2 py-1 bg-orange-100 text-orange-800 rounded">Dept: {appliedDepartmentFilter}</span>}
                {appliedCountryFilter && <span className="px-2 py-1 bg-pink-100 text-pink-800 rounded">Country: {appliedCountryFilter}</span>}
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
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 rounded-l-xl">Full Name</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Email</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Roll Number</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">WhatsApp</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Department</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Country</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Created At</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {leads.map((lead) => (
              <tr key={lead.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 font-medium text-gray-900">{lead.full_name}</td>
                <td className="px-6 py-4 text-gray-600">{lead.email}</td>
                <td className="px-6 py-4 text-gray-600">{lead.roll_number}</td>
                <td className="px-6 py-4 text-gray-600">{lead.whatsapp_number}</td>
                <td className="px-6 py-4 text-gray-600">{lead.department}</td>
                <td className="px-6 py-4 text-gray-600">{lead.country}</td>
                <td className="px-6 py-4 text-gray-500">
                  {lead.created_at ? new Date(lead.created_at).toLocaleDateString() : ""}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {leads.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-500 text-lg">
              {hasActiveFilters ? 'No leads found matching your filters.' : 'No leads available.'}
            </div>
            <p className="text-gray-400 mt-2">
              {hasActiveFilters ? 'Try adjusting your search criteria or clear filters' : 'No leads have been created yet'}
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
    </div>
  );
};

export default LeadsList;