'use client';

import { useEffect, useState, useCallback } from "react";
import Layout from "../../components/Layout";
import { Eye, Trash2, X } from "lucide-react";
import Pagination from "../../components/Pagination";

export default function OnlineConsultantPage() {
  const [consultants, setConsultants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState(null);
  const [page, setPage] = useState(1);
  const [limit] = useState(15);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [interestedCountry, setInterestedCountry] = useState("");
  
  // Applied filters state (only updated when search button is clicked)
  const [appliedSearchTerm, setAppliedSearchTerm] = useState("");
  const [appliedStartDate, setAppliedStartDate] = useState("");
  const [appliedEndDate, setAppliedEndDate] = useState("");
  const [appliedInterestedCountry, setAppliedInterestedCountry] = useState("");
  
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [countries, setCountries] = useState([]);

  useEffect(() => {
    fetchCountries();
  }, []);

  const fetchData = useCallback(() => {
    setLoading(true);
    
    const params = new URLSearchParams({
      page: page.toString(),
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
    if (appliedInterestedCountry) {
      params.append('interested_country', appliedInterestedCountry);
    }

    fetch(`/api/internal/freeconsulation?${params.toString()}`)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setConsultants(data.data || []);
          setTotalItems(data.meta?.totalItems || 0);
          setTotalPages(data.meta?.totalPages || 1);
        } else {
          setConsultants([]);
          setTotalItems(0);
          setTotalPages(1);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch consultations", err);
        setConsultants([]);
        setTotalItems(0);
        setTotalPages(1);
        setLoading(false);
      });
  }, [page, appliedSearchTerm, appliedStartDate, appliedEndDate, appliedInterestedCountry, limit]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const fetchCountries = async () => {
    try {
      const res = await fetch('/api/internal/countries');
      if (res.ok) {
        const data = await res.json();
        setCountries(data.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch countries:', error);
    }
  };

  const handleSearch = () => {
    setAppliedSearchTerm(searchTerm);
    setAppliedStartDate(startDate);
    setAppliedEndDate(endDate);
    setAppliedInterestedCountry(interestedCountry);
    setPage(1);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setStartDate('');
    setEndDate('');
    setInterestedCountry('');
    setAppliedSearchTerm('');
    setAppliedStartDate('');
    setAppliedEndDate('');
    setAppliedInterestedCountry('');
    setPage(1);
  };

  const hasActiveFilters = appliedSearchTerm || appliedStartDate || appliedEndDate || appliedInterestedCountry;

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
    const confirmDelete = window.confirm("Are you sure you want to delete this entry?");
    if (!confirmDelete) return;

    try {
      await fetch(`/api/internal/freeconsulation/${id}`, { method: "DELETE" });
      fetchData(); // Refresh list
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + consultants.length;

  return (
    <Layout>
      <div className="p-4 sm:p-8 bg-gray-50 min-h-screen">
        <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6">
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-6 sm:mb-8">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-1">Online Consultant Applications</h1>
              <p className="text-gray-600 text-sm sm:text-base">Review recent form submissions from users who applied online.</p>
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">Search Applications</label>
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    placeholder="Search by name, email, phone, apply for, country, or city..."
                    className="w-full p-2 border rounded"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Interested Country</label>
                  <select
                    value={interestedCountry}
                    onChange={(e) => setInterestedCountry(e.target.value)}
                    className="w-full p-2 border rounded"
                  >
                    <option value="">All Countries</option>
                    {countries.map((country) => (
                      <option key={country.id} value={country.country}>
                        {country.country}
                      </option>
                    ))}
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
            </div>
          )}

          {loading ? (
            <p className="text-gray-600 text-center">Loading...</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-[900px] w-full text-xs sm:text-sm text-left text-gray-700">
                <thead className="bg-gray-100 text-gray-500 uppercase">
                  <tr>
                    <th className="px-4 py-3">Name</th>
                    <th className="px-4 py-3">Email</th>
                    <th className="px-4 py-3">Mobile</th>
                    <th className="px-4 py-3">Apply For</th>
                    <th className="px-4 py-3">Interested Country</th>
                    <th className="px-4 py-3">City</th>
                    <th className="px-4 py-3">Date</th>
                    {/* <th className="px-4 py-3">Actions</th> */}
                  </tr>
                </thead>
                <tbody>
                  {consultants.map((item, index) => (
                    <tr key={item.id} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                      <td className="px-4 py-3 font-medium text-gray-800">{item.name}</td>
                      <td className="px-4 py-3">{item.email}</td>
                      <td className="px-4 py-3">{item.phone_number}</td>
                      <td className="px-4 py-3">{item.apply_for}</td>
                      <td className="px-4 py-3">{item.interested_country}</td>
                      <td className="px-4 py-3">{item.city}</td>
                      <td className="px-4 py-3">{formatDate(item.created_at)}</td>
                      <td className="px-4 py-3 flex space-x-2">
                        {/* <button
                          onClick={() => setSelectedItem(item)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <Eye size={18} />
                        </button>
                          <button
                          onClick={() => handleDelete(item.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 size={18} />
                        </button> */}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {consultants.length === 0 && (
                <p className="text-gray-500 text-center py-6">
                  {hasActiveFilters ? 'No applications found matching your filters.' : 'No applications found.'}
                </p>
              )}

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
          )}
        </div>

        {/* 👁️ View Modal */}
        {selectedItem && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-lg p-6 w-full max-w-lg relative">
              <button
                onClick={() => setSelectedItem(null)}
                className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
              >
                <X size={20} />
              </button>
              <h2 className="text-lg sm:text-xl font-bold mb-4">Application Details</h2>
              <div className="space-y-2 text-gray-700 text-sm sm:text-base">
                <p><strong>Name:</strong> {selectedItem.name}</p>
                <p><strong>Email:</strong> {selectedItem.user_email}</p>
                <p><strong>Phone:</strong> {selectedItem.phone_number}</p>
                <p><strong>City:</strong> {selectedItem.city}</p>
                <p><strong>Last Education:</strong> {selectedItem.last_education}</p>
                <p><strong>Apply For:</strong> {selectedItem.apply_for}</p>
                <p><strong>Interested Country:</strong> {selectedItem.interested_country}</p>
                <p><strong>Date:</strong> {formatDate(selectedItem.created_at)}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}