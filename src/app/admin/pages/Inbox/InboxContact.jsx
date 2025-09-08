"use client";

import React, { useEffect, useState } from "react";
import { Filter, Search, X } from "lucide-react";
import Pagination from "../../components/Pagination";

const InboxContact = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    search: "",
    startDate: "",
    endDate: "",
    office: ""
  });

  const fetchMessages = async (p = 1, filterParams = {}) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: p.toString(),
        limit: limit.toString(),
        ...filterParams
      });
      
      const res = await fetch(`/api/internal/contactUs?${params}`);
      const data = await res.json();
      if (data.success) {
        setMessages(data.data || []);
        setTotalItems(data.meta?.totalItems || 0);
        setTotalPages(data.meta?.totalPages || 1);
      } else {
        setMessages([]);
        setTotalItems(0);
        setTotalPages(1);
      }
    } catch {
      setMessages([]);
      setTotalItems(0);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages(page, {}); // Load all messages without filters initially
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  // Remove the automatic filter effect - search only happens on button click

  const handleSearch = () => {
    setPage(1); // Reset to first page when searching
    fetchMessages(1, filters);
  };

  const clearFilters = () => {
    setFilters({
      search: "",
      startDate: "",
      endDate: "",
      office: ""
    });
    setPage(1);
    fetchMessages(1, {});
  };

  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + messages.length;

  // Check if any filters are active
  const hasActiveFilters = Object.values(filters).some(value => value !== "");

  // Get active filter count
  const activeFilterCount = Object.values(filters).filter(value => value !== "").length;

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Inbox Contact Messages</h1>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2 transition-colors"
        >
          <Filter className="w-5 h-5" />
          {showFilters ? 'Hide Filters' : 'Show Filters'}
          {hasActiveFilters && (
            <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
              {activeFilterCount}
            </span>
          )}
        </button>
      </div>

      {/* Filter Section */}
      {showFilters && (
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Search Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search
              </label>
              <input
                type="text"
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                placeholder="Search by name, email, phone, office, or message"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Start Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Start Date
              </label>
              <input
                type="date"
                value={filters.startDate}
                onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* End Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                End Date
              </label>
              <input
                type="date"
                value={filters.endDate}
                onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Office Location */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Office Location
              </label>
              <input
                type="text"
                value={filters.office}
                onChange={(e) => setFilters({ ...filters, office: e.target.value })}
                placeholder="Filter by office location"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 mt-4">
            <button
              onClick={handleSearch}
              disabled={loading}
              className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Searching...
                </>
              ) : (
                <>
                  <Search className="w-5 h-5" />
                  Search
                </>
              )}
            </button>
            <button
              onClick={clearFilters}
              className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600 flex items-center gap-2 transition-colors"
            >
              <X className="w-5 h-5" />
              Clear Filters
            </button>
          </div>
        </div>
      )}

      {/* Active Filters Summary */}
      {hasActiveFilters && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-blue-800 font-medium">Active Filters:</span>
              <div className="flex flex-wrap gap-2">
                {filters.search && (
                  <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                    Search: "{filters.search}"
                  </span>
                )}
                {filters.startDate && (
                  <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                    From: {filters.startDate}
                  </span>
                )}
                {filters.endDate && (
                  <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                    To: {filters.endDate}
                  </span>
                )}
                {filters.office && (
                  <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                    Office: "{filters.office}"
                  </span>
                )}
              </div>
            </div>
            <button
              onClick={clearFilters}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              Clear All
            </button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-lg p-6">
        {/* Results Summary */}
        <div className="mb-4 flex items-center justify-between">
          <div className="text-sm text-gray-600">
            {hasActiveFilters ? (
              <span>
                Showing {totalItems} filtered result{totalItems !== 1 ? 's' : ''}
                {totalItems === 0 && ' - No messages match your filters'}
              </span>
            ) : (
              <span>
                Showing {totalItems} message{totalItems !== 1 ? 's' : ''} total
              </span>
            )}
          </div>
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              Clear Filters
            </button>
          )}
        </div>

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
                  <td colSpan="6" className="py-6 text-center text-gray-500">No messages found.</td>
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
                      {msg.created_at ? new Date(msg.created_at).toLocaleString() : '—'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <Pagination
  currentPage={page}
  totalPages={totalPages}
  onPageChange={(p) => setPage(Math.min(Math.max(1, p), totalPages))}
  totalItems={totalItems}
  startIndex={startIndex}
  endIndex={endIndex}
/>

      </div>
    </div>
  );
};

export default InboxContact;