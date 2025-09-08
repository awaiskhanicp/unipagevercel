'use client';

import React from 'react';

const CountrySelect = ({ icon, placeholder, options = [], name, value, onChange }) => {
  return (
    <div className="relative">
      <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
        {icon}
      </div>
      <select
        name={name}
        value={value}
        onChange={onChange}
        className="w-full pl-12 pr-4 py-4 rounded-[30px] bg-[#E7F1F2] text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#0B6D76] appearance-none"
        required
      >
        <option value="">{placeholder}</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {typeof opt === "string" ? opt : opt.label}
          </option>
        ))}
      </select>
    </div>
  );
};

export default CountrySelect; 