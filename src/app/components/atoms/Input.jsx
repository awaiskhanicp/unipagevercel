'use client';

import React from 'react';

const Input = ({ icon, placeholder, name, type = "text", value, onChange }) => {
  return (
    <div className="relative items-center">
      <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
        {icon}
      </div>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full pl-12 pr-4 py-4 rounded-[30px] bg-[#E7F1F2] text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#0B6D76]"
        required
      />
    </div>
  );
};

export default Input; 