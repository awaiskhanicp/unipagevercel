'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Delete, Pencil } from 'lucide-react';

const VisaCountryList = () => {
  const [countries, setCountries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const router = useRouter();

  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const response = await fetch('/api/internal/visa-country');
        if (!response.ok) {
          throw new Error('Failed to fetch visa countries');
        }
        const data = await response.json();
        setCountries(data.data || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCountries();
  }, []);

  const filtered = countries.filter((country) =>
    country.country_name.toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.ceil(filtered.length / entriesPerPage);
  const paginated = filtered.slice(
    (currentPage - 1) * entriesPerPage,
    currentPage * entriesPerPage
  );

  const handleDelete = async (id) => {
    try {
      const response = await fetch(`/api/internal/visa-country/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete country');
      }
      
      setCountries(countries.filter((c) => c.id !== id));
    } catch (err) {
      setError(err.message);
    }
  };

  const handleAddDetail = (country) => {
    router.push(`/admin/visit-visa/details/${country.id}`);
  };

  const handleEdit = (country) => {
    router.push(`/admin/pages/VisitVisa/AddVisaCountry?id=${country.id}`);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0B6D76]"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 bg-gradient-to-br from-green-50 to-teal-100 min-h-screen">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Visa Countries List</h1>
          <p className="text-gray-600 mt-2">Manage all visa countries</p>
        </div>
        <button
          onClick={() => router.push('/admin/pages/VisitVisa/AddVisaCountry')}
          className="bg-[#0B6D76] text-white px-6 py-3 rounded-xl hover:from-green-700 hover:to-teal-700 transition-all duration-200 shadow-lg"
        >
          Add Visa Country
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-xl p-6">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <label htmlFor="entries">Show</label>
            <select
              id="entries"
              value={entriesPerPage}
              onChange={(e) => {
                setEntriesPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="border rounded px-3 py-2"
            >
              {[10, 25, 50, 100].map((num) => (
                <option key={num} value={num}>{num}</option>
              ))}
            </select>
            <span>entries</span>
          </div>

          <input
            type="text"
            placeholder="Search countries..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            className="px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gradient-to-r from-green-50 to-teal-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase">#</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase">Country</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase">Banner</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase">Price</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase">Discount</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase">Detail</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {paginated.map((country, idx) => (
                <tr key={country.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-medium">{(currentPage - 1) * entriesPerPage + idx + 1}</td>
                  <td className="px-6 py-4 flex items-center gap-3">
                    <img 
                      src={country.country_image} 
                      alt={country.country_name} 
                      className="w-10 h-6 object-cover border rounded" 
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'inline-block';
                      }}
                    />
                    <div className="w-10 h-6 bg-gray-200 border rounded flex items-center justify-center text-xs text-gray-500" style={{display: 'none'}}>
                      Flag
                    </div>
                    <span className="font-semibold">{country.country_name}</span>
                  </td>
                  <td className="px-6 py-4">
                    <img 
                      src={country.banner_image} 
                      alt={`${country.country_name} banner`} 
                      className="w-20 h-10 object-cover border rounded"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'inline-block';
                      }}
                    />
                    <div className="w-20 h-10 bg-gray-200 border rounded flex items-center justify-center text-xs text-gray-500" style={{display: 'none'}}>
                      Banner
                    </div>
                  </td>
                  <td className="px-6 py-4">{country.currency} {country.price}</td>
                  <td className="px-6 py-4">{country.discount_price}%</td>
                  <td>
                    <button
                      onClick={() => handleAddDetail(country)}
                      className="text-white bg-green-600 hover:bg-green-700 px-3 py-1 rounded text-xs"
                    >
                      Add Details
                    </button>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button 
                        onClick={() => handleEdit(country)}
                        className="text-blue-600 hover:bg-blue-100 p-2 rounded-lg"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(country.id)}
                        className="text-red-600 hover:bg-red-100 p-2 rounded-lg"
                      >
                        <Delete className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex justify-between items-center mt-4 text-sm">
          <div>
            Showing {paginated.length ? (currentPage - 1) * entriesPerPage + 1 : 0} to{' '}
            {(currentPage - 1) * entriesPerPage + paginated.length} of {filtered.length} entries
          </div>
          <div className="flex gap-2">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((prev) => prev - 1)}
              className="px-3 py-1 border rounded disabled:opacity-50"
            >
              Previous
            </button>
            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentPage(i + 1)}
                className={`px-3 py-1 border rounded ${
                  currentPage === i + 1 ? 'bg-[#0B6D76] text-white' : ''
                }`}
              >
                {i + 1}
              </button>
            ))}
            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((prev) => prev + 1)}
              className="px-3 py-1 border rounded disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VisaCountryList;