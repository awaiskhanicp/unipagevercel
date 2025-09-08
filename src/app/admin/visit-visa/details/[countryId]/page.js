'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Layout from '../../../components/Layout';
import { Delete, Pencil, Plus } from 'lucide-react';
import Pagination from '../../../components/Pagination';

const VisaCountryDetailsPage = () => {
  const params = useParams();
  const router = useRouter();
  
  // State management
  const [visaTypes, setVisaTypes] = useState([]);
  const [visaRequirements, setVisaRequirements] = useState([]);
  const [visaFaqs, setVisaFaqs] = useState([]);
  const [allVisaTypes, setAllVisaTypes] = useState([]);
  const [allVisaRequirements, setAllVisaRequirements] = useState([]);
  const [allVisaFaqs, setAllVisaFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState('');
  
  // Pagination states for each table
  const [typesPage, setTypesPage] = useState(1);
  const [requirementsPage, setRequirementsPage] = useState(1);
  const [faqsPage, setFaqsPage] = useState(1);
  const itemsPerPage = 5;
  
  // Modal states
  const [showAddVisaTypeModal, setShowAddVisaTypeModal] = useState(false);
  
  // Form states
  const [newVisaType, setNewVisaType] = useState({
    name: '',
    country_name: ''
  });

  // Fetch data on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch ALL visa types from database
        const typesResponse = await fetch('/api/internal/visa-types?get_all=true');
        if (!typesResponse.ok) throw new Error('Failed to fetch visa types');
        const typesData = await typesResponse.json();
        setVisaTypes(typesData.data || []);
        
        // Fetch ALL visa requirements from database
        const reqResponse = await fetch('/api/internal/visa-requirements?get_all=true');
        if (!reqResponse.ok) throw new Error('Failed to fetch visa requirements');
        const reqData = await reqResponse.json();
        setVisaRequirements(reqData.data || []);

        // Fetch ALL visa FAQs from database
        const faqsResponse = await fetch('/api/internal/visa-faqs?get_all=true');
        if (!faqsResponse.ok) throw new Error('Failed to fetch visa FAQs');
        const faqsData = await faqsResponse.json();
        setVisaFaqs(faqsData.data || []);
        
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [params.countryId]);

  // Function to fetch all data from database
  const fetchAllData = async () => {
    try {
      setLoading(true);
      
      // Fetch ALL visa types
      const allTypesResponse = await fetch('/api/internal/visa-types?get_all=true');
      if (allTypesResponse.ok) {
        const allTypesData = await allTypesResponse.json();
        if (allTypesData.success) {
          setVisaTypes(allTypesData.data || []);
        }
      }
      
      // Fetch ALL visa requirements
      const allReqResponse = await fetch('/api/internal/visa-requirements?get_all=true');
      if (allReqResponse.ok) {
        const allReqData = await allReqResponse.json();
        if (allReqData.success) {
          setVisaRequirements(allReqData.data || []);
        }
      }
      
      // Fetch ALL visa FAQs
      const allFaqsResponse = await fetch('/api/internal/visa-faqs?get_all=true');
      if (allFaqsResponse.ok) {
        const allFaqsData = await allFaqsResponse.json();
        if (allFaqsData.success) {
          setVisaFaqs(allFaqsData.data || []);
        }
      }
      
      setMessage('Data refreshed successfully!');
      setTimeout(() => setMessage(''), 3000);
      
      // Reset pagination to first page for all tables
      setTypesPage(1);
      setRequirementsPage(1);
      setFaqsPage(1);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Modal handlers
  const handleCloseModal = () => {
    setShowAddVisaTypeModal(false);
  };

  // Visa Type handlers
  const handleAddVisaType = () => {
    setShowAddVisaTypeModal(true);
  };

  const handleSaveVisaType = async () => {
    try {
      const response = await fetch('/api/internal/visa-types', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          visa_country_id: params.countryId,
          ...newVisaType
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to create visa type');

      setVisaTypes([...visaTypes, data.data]);
      handleCloseModal();
      setNewVisaType({ name: '', country_name: '' });
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDeleteVisaType = async (id) => {
    try {
      const response = await fetch(`/api/internal/visa-types/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete visa type');
      setVisaTypes(visaTypes.filter(type => type.id !== id));
    } catch (err) {
      setError(err.message);
    }
  };

  // Visa Requirement handlers
const handleDeleteRequirement = async (id) => {
  try {
    const response = await fetch(`/api/internal/visa-requirements/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete visa requirement');
    setVisaRequirements(visaRequirements.filter(req => req.id !== id));
  } catch (err) {
    setError(err.message);
  }
};

// Visa FAQ handlers
const handleDeleteFaq = async (id) => {
  try {
    const response = await fetch(`/api/internal/visa-faqs/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete visa FAQ');
    setVisaFaqs(visaFaqs.filter(faq => faq.id !== id));
  } catch (err) {
    setError(err.message);
  }
};

  // Navigation handlers
  const handleAddVisaRequirement = () => {
    router.push(`/admin/visit-visa/details/${params.countryId}/add-requirement`);
  };

  const handleAddFAQ = () => {
    router.push(`/admin/visit-visa/details/${params.countryId}/add-requirement/add_faq`);
  };

  // Pagination calculation functions
  const getPaginatedData = (data, currentPage, itemsPerPage) => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return data.slice(startIndex, endIndex);
  };

  const getTotalPages = (data) => Math.ceil(data.length / itemsPerPage);

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0B6D76]"></div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="flex justify-center items-center min-h-screen">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-8 p-6 bg-gradient-to-br from-blue-50 to-indigo-100 min-h-screen">

        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Visa Country Details</h1>
            <p className="text-gray-600 mt-1">Manage visa types, requirements and FAQs for selected country</p>
          </div>
          <div className="flex gap-3">
            <button
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl shadow-md transition-all flex items-center gap-2"
              onClick={fetchAllData}
            >
              🔄 Refresh All Data
            </button>
            <button
              className="bg-[#0B6D76] hover:bg-[#09545c] text-white px-6 py-3 rounded-xl shadow-md transition-all flex items-center gap-2"
              onClick={handleAddVisaType}
            >
              <Plus size={18} />
              Add Visa Type
            </button>
          </div>
        </div>

        {/* Success Message */}
        {message && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
            {message}
          </div>
        )}

        {/* Visa Types Table */}
        <div className="bg-white rounded-2xl shadow-xl p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-800">Visa Types ({visaTypes.length})</h2>
            <button
              onClick={fetchAllData}
              className="text-sm bg-blue-100 text-blue-600 px-3 py-1 rounded-lg hover:bg-blue-200 transition-colors"
            >
              🔄 Refresh All Data
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gradient-to-r from-blue-50 to-indigo-50">
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 rounded-l-xl">#</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Country</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Type</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Created</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900 rounded-r-xl">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {getPaginatedData(visaTypes, typesPage, itemsPerPage).map((item, idx) => (
                  <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-900">{(typesPage - 1) * itemsPerPage + idx + 1}</td>
                    <td className="px-6 py-2 text-gray-700">{item.country_name}</td>
                    <td className="px-6 py-2 text-gray-700">{item.name}</td>
                    <td className="px-6 py-2 text-gray-700">{formatDate(item.created_at)}</td>
                    <td className="px-6 py-2 text-center">
                      <button 
                        onClick={() => handleDeleteVisaType(item.id)}
                        className="bg-red-100 text-red-600 px-3 py-1 rounded-lg hover:bg-red-200 transition-colors text-sm"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {visaTypes.length === 0 && (
              <div className="text-center py-8 text-gray-500">No visa types found</div>
            )}
          </div>
          
          {/* Pagination for Visa Types */}
          {visaTypes.length > 0 && (
            <Pagination
              currentPage={typesPage}
              totalPages={getTotalPages(visaTypes)}
              onPageChange={setTypesPage}
              totalItems={visaTypes.length}
              startIndex={(typesPage - 1) * itemsPerPage}
              endIndex={typesPage * itemsPerPage}
            />
          )}
        </div>

        {/* Add Buttons */}
        <div className="flex justify-center gap-4">
          <button
            className="bg-[#0B6D76] text-white px-6 py-3 rounded-xl shadow-md transition-all flex items-center gap-2"
            onClick={handleAddVisaRequirement}
          >
            <Plus size={18} />
            Add Visa Requirement
          </button>
        </div>

        {/* Visa Requirements Table */}
        <div className="bg-white rounded-2xl shadow-xl p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-800">Visa Requirements ({visaRequirements.length})</h2>
            <button
              onClick={fetchAllData}
              className="text-sm bg-blue-100 text-blue-600 px-3 py-1 rounded-lg hover:bg-blue-200 transition-colors"
            >
              🔄 Refresh All Data
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gradient-to-r from-blue-50 to-indigo-50">
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 rounded-l-xl">#</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Title</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Country</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Type</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Description</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">Edit</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900 rounded-r-xl">Delete</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {getPaginatedData(visaRequirements, requirementsPage, itemsPerPage).map((item, idx) => (
                  <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-900">{(requirementsPage - 1) * itemsPerPage + idx + 1}</td>
                    <td className="px-6 py-2 text-gray-700">{item.title}</td>
                    <td className="px-6 py-2 text-gray-700">{item.visa_country_name}</td>
                    <td className="px-6 py-2 text-gray-700">{item.visa_type_name}</td>
                    <td className="px-6 py-2 text-gray-700 max-w-xs truncate">{item.description}</td>
                    <td className="px-6 py-2 text-center">
                      <button
                        onClick={() => router.push(`/admin/visit-visa/details/${params.countryId}/edit-requirement/${item.id}`)}
                        className="hover:bg-yellow-100 px-3 py-1 rounded-lg transition-colors text-sm"
                      >
                        <Pencil size={18} />
                      </button>
                    </td>
                    <td className="px-6 py-2 text-center">
                      <button 
                        onClick={() => handleDeleteRequirement(item.id)}
                        className="text-red-600 px-3 py-1 rounded-lg hover:bg-red-100 transition-colors text-sm"
                      >
                        <Delete size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {visaRequirements.length === 0 && (
              <div className="text-center py-8 text-gray-500">No visa requirements found</div>
            )}
          </div>
          
          {/* Pagination for Visa Requirements */}
          {visaRequirements.length > 0 && (
            <Pagination
              currentPage={requirementsPage}
              totalPages={getTotalPages(visaRequirements)}
              onPageChange={setRequirementsPage}
              totalItems={visaRequirements.length}
              startIndex={(requirementsPage - 1) * itemsPerPage}
              endIndex={requirementsPage * itemsPerPage}
            />
          )}
        </div>
<div className="flex justify-end mt-4">
 <button
            className="bg-[#0B6D76] text-white px-6 py-3 rounded-xl shadow-md transition-all flex items-center gap-2"
            onClick={handleAddFAQ}
          >
            <Plus size={18} />
            Add FAQ
          </button>
</div>
 

        {/* Visa FAQs Table */}
        <div className="bg-white rounded-2xl shadow-xl p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-800">Visa FAQs ({visaFaqs.length})</h2>
            <button
              onClick={fetchAllData}
              className="text-sm bg-blue-100 text-blue-600 px-3 py-1 rounded-lg hover:bg-blue-200 transition-colors"
            >
              🔄 Refresh All Data
            </button>
            </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gradient-to-r from-blue-50 to-indigo-50">
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 rounded-l-xl">#</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Question</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Country</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Type</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Description</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">Edit</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900 rounded-r-xl">Delete</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {getPaginatedData(visaFaqs, faqsPage, itemsPerPage).map((item, idx) => (
                  <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-900">{(faqsPage - 1) * itemsPerPage + idx + 1}</td>
                    <td className="px-6 py-2 text-gray-700">{item.title}</td>
                    <td className="px-6 py-2 text-gray-700">{item.visa_country_name}</td>
                    <td className="px-6 py-2 text-gray-700">{item.visa_type_name}</td>
                    <td className="px-6 py-2 text-gray-700 max-w-xs truncate">{item.description}</td>
                    <td className="px-6 py-2 text-center">
                      <button
                        onClick={() => router.push(`/admin/visit-visa/details/${params.countryId}/edit-faq/${item.id}`)}
                        className="hover:bg-yellow-100 px-3 py-1 rounded-lg transition-colors text-sm"
                      >
                        <Pencil size={18} />
                      </button>
                    </td>
                    <td className="px-6 py-2 text-center">
                      <button 
                        onClick={() => handleDeleteFaq(item.id)}
                        className="text-red-600 px-3 py-1 rounded-lg hover:bg-red-100 transition-colors text-sm"
                      >
                        <Delete size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {visaFaqs.length === 0 && (
              <div className="text-center py-8 text-gray-500">No visa FAQs found</div>
            )}
          </div>
          
          {/* Pagination for Visa FAQs */}
          {visaFaqs.length > 0 && (
            <Pagination
              currentPage={faqsPage}
              totalPages={getTotalPages(visaFaqs)}
              onPageChange={setFaqsPage}
              totalItems={visaFaqs.length}
              startIndex={(faqsPage - 1) * itemsPerPage}
              endIndex={faqsPage * itemsPerPage}
            />
          )}
        </div>

        {/* Add Visa Type Modal */}
        {showAddVisaTypeModal && (
          <div className="fixed inset-0 flex items-center justify-center bg-black/30 backdrop-blur-sm z-50">
            <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md relative">
              <button
                className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
                onClick={handleCloseModal}
              >
                &times;
              </button>
              <h2 className="text-xl font-semibold mb-4">Add Visa Type</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium">Country Name</label>
                  <input
                    type="text"
                    className="w-full border rounded px-3 py-2"
                    value={newVisaType.country_name}
                    onChange={(e) => setNewVisaType({...newVisaType, country_name: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium">Visa Title</label>
                  <input
                    type="text"
                    className="w-full border rounded px-3 py-2"
                    value={newVisaType.name}
                    onChange={(e) => setNewVisaType({...newVisaType, name: e.target.value})}
                  />
                </div>
                <div className="text-right">
                  <button
                    type="button"
                    onClick={handleSaveVisaType}
                    className="bg-[#0B6D76] hover:bg-[#09545c] text-white px-4 py-2 rounded"
                  >
                    Save
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </Layout>
  );
};

export default VisaCountryDetailsPage;