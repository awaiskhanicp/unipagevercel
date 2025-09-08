'use client';

import React, { useState, useEffect } from 'react';
import { Search, Filter, X, Calendar, Clock } from 'lucide-react';

const AdvancedFilter = ({ 
  onFilterChange, 
  searchPlaceholder = "Search...",
  className = ""
}) => {
  const [filters, setFilters] = useState({
    search: '',
    createdFrom: '',
    createdTo: '',
    updatedFrom: '',
    updatedTo: ''
  });

  const [isExpanded, setIsExpanded] = useState(false);

  // Apply filters when they change
  useEffect(() => {
    onFilterChange(filters);
  }, [filters, onFilterChange]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const clearAllFilters = () => {
    setFilters({
      search: '',
      createdFrom: '',
      createdTo: '',
      updatedFrom: '',
      updatedTo: ''
    });
  };

  const hasActiveFilters = Object.values(filters).some(value => value !== '');

  const handleSearch = () => {
    // Trigger search - filters are already applied via useEffect
    setIsExpanded(false);
  };

  return (
    <div className={`bg-white rounded-xl border border-gray-200 p-4 ${className}`}>
      {/* Main Row */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search Input */}
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder={searchPlaceholder}
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0B6D76] focus:border-transparent text-sm"
          />
        </div>

        {/* Filter Toggle Button */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className={`px-4 py-2.5 rounded-lg border transition-colors flex items-center justify-center gap-2 font-medium ${
            isExpanded || hasActiveFilters
              ? 'bg-[#0B6D76] text-white border-[#0B6D76]'
              : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
          }`}
        >
          <Filter className="w-4 h-4" />
          Filters
          {hasActiveFilters && (
            <span className="w-2 h-2 bg-white rounded-full"></span>
          )}
        </button>

        {/* Clear All Button */}
        {hasActiveFilters && (
          <button
            onClick={clearAllFilters}
            className="px-4 py-2.5 text-red-600 border border-red-300 rounded-lg hover:bg-red-50 transition-colors flex items-center justify-center gap-2 font-medium"
          >
            <X className="w-4 h-4" />
            Clear
          </button>
        )}
      </div>

      {/* Date Filters Section - Only show when expanded */}
      {isExpanded && (
        <div className="border-t border-gray-200 pt-4 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Created From */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Created From
              </label>
              <input
                type="date"
                value={filters.createdFrom}
                onChange={(e) => handleFilterChange('createdFrom', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0B6D76] focus:border-transparent text-sm"
              />
            </div>

            {/* Created To */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Created To
              </label>
              <input
                type="date"
                value={filters.createdTo}
                onChange={(e) => handleFilterChange('createdTo', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0B6D76] focus:border-transparent text-sm"
              />
            </div>

        
          </div>

          {/* Search Button */}
          <div className="mt-4 flex justify-end">
            <button
              onClick={handleSearch}
              className="px-6 py-2.5 bg-[#0B6D76] text-white rounded-lg hover:bg-[#085a61] transition-colors flex items-center justify-center gap-2 font-medium"
            >
              <Search className="w-4 h-4" />
              Search
            </button>
          </div>

          {/* Active Filters Display */}
          {hasActiveFilters && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex flex-wrap gap-2">
                <span className="text-sm font-medium text-gray-700">Active filters:</span>
                {filters.search && (
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                    Search: "{filters.search}"
                  </span>
                )}
                {filters.createdFrom && (
                  <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                    Created from: {filters.createdFrom}
                  </span>
                )}
                {filters.createdTo && (
                  <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                    Created to: {filters.createdTo}
                  </span>
                )}
                {filters.updatedFrom && (
                  <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm">
                    Updated from: {filters.updatedFrom}
                  </span>
                )}
                {filters.updatedTo && (
                  <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm">
                    Updated to: {filters.updatedTo}
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdvancedFilter;