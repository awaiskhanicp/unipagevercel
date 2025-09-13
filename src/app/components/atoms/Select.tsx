'use client';

import React from 'react';

interface SelectProps {
  icon: React.ReactNode;
  placeholder: string;
  options?: string[] | { label: string; value: string }[];
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  required?: boolean; // ✅ allow required
  disabled?: boolean; // ✅ allow disabled
}

const Select: React.FC<SelectProps> = ({
  icon,
  placeholder,
  options = [],
  name,
  value,
  onChange,
  required = false,
  disabled = false,
}) => {
  return (
    <div className="relative">
      <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
        {icon}
      </div>
      <select
        name={name}
        value={value}
        onChange={onChange}
        className="w-full pl-12 pr-4 py-4 rounded-[30px] bg-[#E7F1F2] text-sm text-gray-700 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#0B6D76] appearance-none disabled:bg-gray-200"
        required={required}
        disabled={disabled}
      >
        <option value="">{placeholder}</option>
        {options.map((option, index) =>
          typeof option === 'string' ? (
            <option key={index} value={option}>
              {option}
            </option>
          ) : (
            <option key={index} value={option.value}>
              {option.label}
            </option>
          )
        )}
      </select>
    </div>
  );
};

export default Select;
