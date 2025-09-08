'use client';

import { useState } from "react";

const UniversityCountries = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [countries] = useState([
    { id: 1, name: "United States", code: "US", universities: 25, flag: "🇺🇸" },
    { id: 2, name: "United Kingdom", code: "UK", universities: 18, flag: "🇬🇧" },
    { id: 3, name: "Canada", code: "CA", universities: 12, flag: "🇨🇦" },
    { id: 4, name: "Australia", code: "AU", universities: 15, flag: "🇦🇺" },
    { id: 5, name: "Germany", code: "DE", universities: 20, flag: "🇩🇪" },
  ]);

  const filteredCountries = countries.filter((country) =>
    country.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 p-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">University Countries</h1>
          <p className="text-gray-600 mt-2">Manage countries with universities</p>
        </div>
        <button className="bg-[#0B6D76] text-white px-6 py-3 rounded-xl hover:bg-[#095961] transition-all duration-200 flex items-center space-x-2 shadow-lg">
          <span className="text-xl">➕</span>
          <span>Add Country</span>
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-xl p-6">
        <div className="flex items-center space-x-4 mb-6">
          <div className="relative flex-1">
            <span className="absolute left-3 top-3 text-gray-400 text-lg">🔍</span>
            <input
              type="text"
              placeholder="Search countries..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gradient-to-r from-purple-50 to-blue-50">
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 rounded-l-xl">Flag</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Country</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Code</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Universities</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 rounded-r-xl">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredCountries.map((country) => (
                <tr key={country.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-2xl">{country.flag}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <span className="text-purple-600 text-lg">🌐</span>
                      <span className="font-medium text-gray-900">{country.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-600">{country.code}</td>
                  <td className="px-6 py-4">
                    <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-medium">
                      {country.universities} Universities
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <button className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors" title="Edit">
                        ✏️
                      </button>
                      <button className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors" title="Delete">
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredCountries.length === 0 && (
            <div className="text-center py-12 text-gray-500 text-lg">No countries found.</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UniversityCountries;
