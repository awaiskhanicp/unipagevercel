'use client';

import React from 'react';

interface InputProps {
  icon: React.ReactNode;
  placeholder: string;
  name: string;
  type?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string; // ✅ optional now
  required?: boolean;
}

const Input: React.FC<InputProps> = ({ 
  icon, 
  placeholder, 
  name, 
  type = "text", 
  value, 
  onChange, 
  error, 
  required 
}) => {
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
        required={required}
      />
      {error && (
        <p className="text-red-500 text-xs mt-1 pl-3">{error}</p>
      )}
    </div>
  );
};

export default Input;
