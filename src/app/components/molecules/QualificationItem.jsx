// src/molecules/QualificationItem.jsx
'use client';
import React from "react";

const QualificationItem = ({ number, title }) => {
  return (
    <div className="flex md:flex-row flex-col text-center items-center gap-2 hover:bg-teal-50 transition rounded-xl p-3 cursor-pointer">
      <div className="w-10 h-10 rounded-full bg-[var(--brand-color)] text-white flex items-center justify-center font-bold">
        {number}
      </div>
      <div className="text-gray-800 font-medium">{title}</div>
    </div>
  );
};

export default QualificationItem;
