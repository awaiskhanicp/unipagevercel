import React from 'react';

const CoursesPageSubject = ({ title, onClick }) => {
  return (
    <div
      className="w-full bg-white text-center p-4 rounded-md border hover:bg-[#0B6D76] hover:text-white transition-all duration-200 cursor-pointer"
      onClick={onClick}
    >
      <h3 className="text-base font-medium">{title}</h3>
    </div>
  );
};

export default CoursesPageSubject;