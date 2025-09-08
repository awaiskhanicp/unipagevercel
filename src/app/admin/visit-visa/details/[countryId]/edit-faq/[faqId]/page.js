'use client';
import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Layout from '../../../../../../admin/components/Layout';
import { Save } from 'lucide-react';

const EditVisaFaq = () => {
  const router = useRouter();
  const params = useParams();
  const countryId = params.countryId;
  const faqId = params.faqId;

  const [country, setCountry] = useState(null);
  const [visaTypes, setVisaTypes] = useState([]);
  const [form, setForm] = useState({
    visa_country_id: countryId,
    visa_type_id: '',
    title: '',
    description: '',
    visa_country_name: '',
    visa_type_name: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Fetch country details
        const countryRes = await fetch(`/api/internal/visa-country/${countryId}`);
        if (!countryRes.ok) throw new Error('Failed to fetch country');
        
        const countryData = await countryRes.json();
        if (!countryData?.data) throw new Error('Country data not found');
        
        setCountry(countryData.data);

        // Fetch visa types for this country
        const visaTypesRes = await fetch(`/api/internal/visa-types?visa_country_id=${countryId}`);
        if (!visaTypesRes.ok) throw new Error('Failed to fetch visa types');
        
        const visaTypesData = await visaTypesRes.json();
        setVisaTypes(visaTypesData.data || []);

        // Fetch existing FAQ data
        const faqRes = await fetch(`/api/internal/visa-faqs/${faqId}`);
        if (!faqRes.ok) throw new Error('Failed to fetch FAQ');
        
        const faqData = await faqRes.json();
        if (!faqData?.data) throw new Error('FAQ data not found');
        
        setForm({
          visa_country_id: countryId,
          visa_type_id: faqData.data.visa_type_id.toString(),
          title: faqData.data.title,
          description: faqData.data.description,
          visa_country_name: faqData.data.visa_country_name,
          visa_type_name: faqData.data.visa_type_name
        });

      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    if (countryId && faqId) {
      fetchData();
    }
  }, [countryId, faqId]);

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
    
    if (!form.visa_type_id) {
      setError('Please select a visa type');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/internal/visa-faqs/${faqId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...form,
          visa_country_id: parseInt(form.visa_country_id),
          visa_type_id: parseInt(form.visa_type_id)
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to update FAQ');
      }

      alert('FAQ Updated Successfully!');
      router.push(`/admin/visit-visa/details/${countryId}`);
    } catch (err) {
      console.error('Error:', err);
      setError(err.message || 'Failed to update FAQ');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="p-6 text-center">Loading...</div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="p-6 text-center text-red-600">
          Error: {error}
          <button 
            onClick={() => window.location.reload()}
            className="ml-4 bg-blue-500 text-white px-4 py-2 rounded"
          >
            Retry
          </button>
        </div>
      </Layout>
    );
  }

  if (!country) {
    return (
      <Layout>
        <div className="p-6 text-center">Country not found</div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="p-6 max-w-2xl mx-auto bg-white rounded-lg shadow-md">
        <h1 className="text-2xl font-bold mb-6 text-gray-800">
          Edit FAQ for {country.country_name}
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

          {/* Title */}
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

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description*
            </label>
            <textarea
              name="description"
              className="w-full border border-gray-300 rounded-md px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={form.description}
              onChange={handleChange}
              required
              rows={6}
            />
          </div>

          <div className="flex justify-end gap-4 pt-4">
            <button
              type="button"
              onClick={() => router.push(`/admin/visit-visa/details/${countryId}`)}
              className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || visaTypes.length === 0}
              className={`bg-[#0B6D76] hover:bg-[#09545c] text-white px-6 py-2 rounded-md shadow-sm transition-colors flex items-center gap-2 ${
                visaTypes.length === 0 ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              <Save size={18} />
              {isSubmitting ? 'Updating...' : 'Update FAQ'}
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
};

export default EditVisaFaq; 