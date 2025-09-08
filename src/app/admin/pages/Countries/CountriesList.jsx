
"use client";

import React, { useState, useEffect } from "react";
import { Plus, Edit, Trash2, X, Save } from "lucide-react";
import { useRouter } from "next/navigation";
import Pagination from '../../components/Pagination';
import Swal from 'sweetalert2';

const CountriesList = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  
  // Applied filters state (only updated when search button is clicked)
  const [appliedSearchTerm, setAppliedSearchTerm] = useState("");
  const [appliedStartDate, setAppliedStartDate] = useState("");
  const [appliedEndDate, setAppliedEndDate] = useState("");
  const [appliedStatusFilter, setAppliedStatusFilter] = useState("");
  
  const [countries, setCountries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editFormData, setEditFormData] = useState({});
  const [isEditing, setIsEditing] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(15);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const router = useRouter();

  const currencyOptions = ["USD", "PKR", "EUR", "GBP", "AUD", "CAD", "AED", "SAR"];

  // Fetch countries when page changes or applied filters change
  useEffect(() => {
    fetchCountries();
  }, [currentPage, appliedSearchTerm, appliedStartDate, appliedEndDate, appliedStatusFilter]);

  const fetchCountries = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: itemsPerPage.toString()
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
      
      if (appliedStatusFilter) {
        params.append('status', appliedStatusFilter);
      }

      const res = await fetch(`/api/internal/countries?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch countries");

      const data = await res.json();
      if (data.success) {
        setCountries(data.data || []);
        setTotalItems(data.meta?.totalItems || 0);
        setTotalPages(data.meta?.totalPages || 1);
      } else {
        setCountries([]);
        setTotalItems(0);
        setTotalPages(1);
      }
    } catch (err) {
      console.error("Fetch error:", err);
      Swal.fire({
        icon: 'error',
        title: 'Error!',
        text: 'Failed to load countries',
        confirmButtonColor: '#0B6D76',
        confirmButtonText: 'OK'
      });
      setCountries([]);
      setTotalItems(0);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      // Show delete confirmation SweetAlert
      const result = await Swal.fire({
        title: 'Are you sure?',
        text: "You won't be able to revert this!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Yes, delete it!',
        cancelButtonText: 'Cancel'
      });

      if (result.isConfirmed) {
        const res = await fetch(`/api/internal/countries?id=${id}`, {
          method: "DELETE",
        });

        if (!res.ok) throw new Error("Failed to delete country");

        // Refresh the current page data instead of filtering locally
        fetchCountries();
        
        // Show success SweetAlert
        Swal.fire({
          icon: 'success',
          title: 'Deleted!',
          text: 'Country has been deleted successfully.',
          confirmButtonColor: '#0B6D76',
          confirmButtonText: 'OK'
        });
      }
    } catch (err) {
      console.error("Delete error:", err);
      Swal.fire({
        icon: 'error',
        title: 'Error!',
        text: 'Failed to delete country',
        confirmButtonColor: '#0B6D76',
        confirmButtonText: 'OK'
      });
    }
  };

  const handleEdit = (country) => {
    setEditingCountry(country);
    setEditFormData({
      name: country.country || "",
      code: country.code || "",
      currency: country.currency || "USD",
      consultationFee: country.consultation_fee || "",
      consultationDiscountFee: country.consultation_fee_discount || "",
      featureImage: country.image || ""
    });
    setShowEditModal(true);
  };

  const handleSaveEdit = async () => {
    try {
      const res = await fetch(`/api/internal/countries?id=${editingCountry.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          country: editFormData.name,
          code: editFormData.code,
          currency: editFormData.currency,
          consultation_fee: editFormData.consultationFee,
          consultation_fee_discount: editFormData.consultationDiscountFee,
          image: editFormData.featureImage
        }),
      });

      if (!res.ok) throw new Error("Failed to update country");

      // Refresh the current page data instead of updating locally
      fetchCountries();
      
      setShowEditModal(false);
      setEditingCountry(null);
      setEditFormData({});

      Swal.fire({
        icon: 'success',
        title: 'Updated!',
        text: 'Country has been updated successfully.',
        confirmButtonColor: '#0B6D76',
        confirmButtonText: 'OK'
      });
    } catch (err) {
      console.error("Update error:", err);
      Swal.fire({
        icon: 'error',
        title: 'Error!',
        text: 'Failed to update country',
        confirmButtonColor: '#0B6D76',
        confirmButtonText: 'OK'
      });
    }
  };

  const handleSearch = () => {
    setAppliedSearchTerm(searchTerm);
    setAppliedStartDate(startDate);
    setAppliedEndDate(endDate);
    setAppliedStatusFilter(statusFilter);
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setSearchTerm("");
    setStartDate("");
    setEndDate("");
    setStatusFilter("");
    setAppliedSearchTerm("");
    setAppliedStartDate("");
    setAppliedEndDate("");
    setAppliedStatusFilter("");
    setCurrentPage(1);
  };

  const hasActiveFilters = appliedSearchTerm || appliedStartDate || appliedEndDate || appliedStatusFilter;

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + countries.length;

  return (
    <div className="p-4 sm:p-6 bg-gradient-to-br from-blue-50 to-cyan-100 min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div className="text-center md:text-left">
          <h1 className="text-3xl font-bold text-gray-900">Countries List</h1>
          <p className="text-gray-600 mt-2">Manage all countries and their settings</p>
        </div>
        <div className="flex items-center gap-3">
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
                {[appliedSearchTerm, appliedStartDate, appliedEndDate, appliedStatusFilter].filter(Boolean).length}
              </span>
            )}
          </button>
          <button
            onClick={() => router.push("/countries/add")}
            className="bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Add Country
          </button>
        </div>
      </div>

      {/* Filter Section */}
      {isFilterOpen && (
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Search Countries</label>
              <input
                type="text"
                placeholder="Search by name, code, or currency..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0B6D76] focus:border-transparent"
              />
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
              <div className="text-sm text-gray-600">
                Active filters: 
                {appliedSearchTerm && <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 rounded">Search: "{appliedSearchTerm}"</span>}
                {appliedStartDate && <span className="ml-2 px-2 py-1 bg-green-100 text-green-800 rounded">Start: {appliedStartDate}</span>}
                {appliedEndDate && <span className="ml-2 px-2 py-1 bg-purple-100 text-purple-800 rounded">End: {appliedEndDate}</span>}
                {appliedStatusFilter && <span className="ml-2 px-2 py-1 bg-orange-100 text-orange-800 rounded">Status: {appliedStatusFilter}</span>}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Search and Table */}
      <div className="bg-white rounded-2xl shadow-xl p-6">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px]">
            <thead className="sticky top-0 bg-gradient-to-r from-blue-50 to-cyan-50 z-10">
              <tr>
                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-900 rounded-l-xl">Country</th>
                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-900">Code</th>
                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-900">Currency</th>
                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-900">Consultation Fee</th>
                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-900">Discount Fee</th>
                <th className="py-3 px-4 text-center text-sm font-semibold text-gray-900 rounded-r-xl">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="6" className="py-6 text-center text-gray-500">Loading...</td>
                </tr>
              ) : countries.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-6 text-center text-gray-500">
                    {hasActiveFilters ? 'No countries found matching your filters.' : 'No countries available.'}
                  </td>
                </tr>
              ) : (
                countries.map((country) => (
                  <tr key={country.id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-3 px-4 font-medium text-gray-900">{country.country}</td>
                    <td className="py-3 px-4 text-gray-600">{country.code}</td>
                    <td className="py-3 px-4 text-gray-600">{country.currency}</td>
                    <td className="py-3 px-4 text-gray-600">${country.consultation_fee}</td>
                    <td className="py-3 px-4 text-gray-600">${country.consultation_fee_discount}</td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => handleEdit(country)}
                          className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(country.id)}
                          className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
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

      {/* Edit Modal */}
      {showEditModal && editingCountry && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-md relative">
            <button
              onClick={() => setShowEditModal(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
            >
              <X className="w-5 h-5" />
            </button>
            
            <h2 className="text-lg font-semibold mb-4">Edit Country</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Country Name</label>
                <input
                  type="text"
                  value={editFormData.name}
                  onChange={(e) => setEditFormData({...editFormData, name: e.target.value})}
                  className="w-full border px-3 py-2 rounded"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Code</label>
                <input
                  type="text"
                  value={editFormData.code}
                  onChange={(e) => setEditFormData({...editFormData, code: e.target.value})}
                  className="w-full border px-3 py-2 rounded"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Currency</label>
                <select
                  value={editFormData.currency}
                  onChange={(e) => setEditFormData({...editFormData, currency: e.target.value})}
                  className="w-full border px-3 py-2 rounded"
                >
                  {currencyOptions.map(currency => (
                    <option key={currency} value={currency}>{currency}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Consultation Fee</label>
                <input
                  type="number"
                  value={editFormData.consultationFee}
                  onChange={(e) => setEditFormData({...editFormData, consultationFee: e.target.value})}
                  className="w-full border px-3 py-2 rounded"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Discount Fee</label>
                <input
                  type="number"
                  value={editFormData.consultationDiscountFee}
                  onChange={(e) => setEditFormData({...editFormData, consultationDiscountFee: e.target.value})}
                  className="w-full border px-3 py-2 rounded"
                />
              </div>
            </div>
            
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowEditModal(false)}
                className="px-4 py-2 border rounded hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CountriesList;