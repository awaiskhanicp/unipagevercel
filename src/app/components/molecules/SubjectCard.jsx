import React from 'react';

const SubjectCard = ({ subject, isSelected, onClick }) => {
  return (
    <button
      onClick={onClick}
      className={`w-full p-4 rounded-xl text-center transition-all duration-300 cursor-pointer hover:scale-105 border-2 ${
        isSelected
          ? 'bg-gradient-to-br from-[#0B6D76] to-[#0a5a62] text-white shadow-xl ring-4 ring-[#0B6D76] ring-opacity-30 border-[#0B6D76]'
          : 'bg-gradient-to-br from-white to-gray-50 text-gray-700 hover:from-[#0B6D76] hover:to-[#0a5a62] hover:text-white border-gray-200 hover:border-[#0B6D76] hover:shadow-lg'
      }`}
    >
      {/* Subject Name Only */}
      <div className="font-semibold text-base truncate" title={subject}>
        {subject}
      </div>
      
      {/* Selection Indicator */}
      {isSelected && (
        <div className="mt-2 text-xs font-medium text-blue-100">
          ✓ Selected
        </div>
      )}
    </button>
  );
};

export default SubjectCard;