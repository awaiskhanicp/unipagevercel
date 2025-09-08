"use client";
import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Layout from "../../../../../components/Layout";
import { Plus } from 'lucide-react';

const AddVisaFaq = () => {
  const params = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [visaTypes, setVisaTypes] = useState([]);
  const [country, setCountry] = useState(null);
  
  const [form, setForm] = useState({
    visa_country_id: parseInt(params.countryId),
    visa_type_id: "",
    title: "",
    description: "",
    visa_country_name: "",
    visa_type_name: ""
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch country name
        const countryRes = await fetch(`/api/internal/visa-country/${params.countryId}`);
        if (!countryRes.ok) throw new Error('Failed to fetch country');
        const countryData = await countryRes.json();
        
        // Fetch visa types for this country
        const typesRes = await fetch(`/api/internal/visa-types?visa_country_id=${params.countryId}`);
        if (!typesRes.ok) throw new Error('Failed to fetch visa types');
        const typesData = await typesRes.json();
        
        setCountry(countryData.data);
        setForm(prev => ({
          ...prev,
          visa_country_name: countryData.data.country_name
        }));
        setVisaTypes(typesData.data || []);
      } catch (err) {
        setError(err.message);
      }
    };

    fetchData();
  }, [params.countryId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'visa_type_id') {
      const selectedVisaType = visaTypes.find(v => v.id === parseInt(value));
      setForm({
        ...form,
        visa_type_id: value,
        visa_type_name: selectedVisaType?.name || ''
      });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/internal/visa-faqs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(form),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to create FAQ');
      }

      router.push(`/admin/visit-visa/details/${params.countryId}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="p-6 max-w-2xl mx-auto bg-white rounded-lg shadow-md">
        <h1 className="text-2xl font-bold mb-6 text-gray-800">
          Add FAQ for {country?.country_name || 'Country'}
        </h1>
        
        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
            {error}
          </div>
        )}
        
        <form className="space-y-6" onSubmit={handleSubmit}>
          {/* Show Country Name (read-only) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Country
            </label>
            <input
              type="text"
              value={country?.country_name || ''}
              readOnly
              className="w-full border border-gray-300 rounded-md px-4 py-2 bg-gray-100"
            />
          </div>

          {/* Visa Type Dropdown */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Visa Type*
            </label>
            <select
              name="visa_type_id"
              className="w-full border border-gray-300 rounded-md px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={form.visa_type_id}
              onChange={handleChange}
              required
              disabled={visaTypes.length === 0}
            >
              <option value="">{visaTypes.length === 0 ? 'No visa types available' : 'Select Visa Type'}</option>
              {visaTypes.map(type => (
                <option key={type.id} value={type.id}>
                  {type.name}
                </option>
              ))}
            </select>
            {visaTypes.length === 0 && (
              <p className="text-sm text-red-600 mt-1">
                No visa types found for this country. Please add visa types first.
              </p>
            )}
          </div>

          {/* Show Visa Type Name (read-only) */}
          {form.visa_type_name && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Selected Visa Type
              </label>
              <input
                type="text"
                value={form.visa_type_name}
                readOnly
                className="w-full border border-gray-300 rounded-md px-4 py-2 bg-gray-100"
              />
            </div>
          )}
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Title*
            </label>
            <input
              type="text"
              name="title"
              className="w-full border border-gray-300 rounded-md px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={form.title}
              onChange={handleChange}
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description*
            </label>
            <textarea
              name="description"
              className="w-full border border-gray-300 rounded-md px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              rows={6}
              value={form.description}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="flex justify-end gap-4 pt-4">
            <button
              type="button"
              onClick={() => router.push(`/admin/visit-visa/details/${params.countryId}`)}
              className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || visaTypes.length === 0}
              className={`bg-[#0B6D76] hover:bg-[#09545c] text-white px-6 py-2 rounded-md shadow-sm transition-colors flex items-center gap-2 ${
                visaTypes.length === 0 ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              <Plus size={18} />
              {loading ? 'Saving...' : 'Save FAQ'}
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
};

export default AddVisaFaq;