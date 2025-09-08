'use client';

import { useState } from 'react';
import { UploadCloud } from 'lucide-react';
// import { Input } from '@/app/(main)/free-consultation/page';
import Input from '../atoms/Input';
import { FaUser } from "react-icons/fa";
import { FaPassport } from "react-icons/fa";
import { FaDiscourse } from "react-icons/fa";
import { FaBuilding } from "react-icons/fa";
import Button from '../atoms/Button';
import Heading from '../atoms/Heading';


const NewStudentForm = () => {
  return (
    <div className="max- mx-auto mt-10 md:p-8 sm:p-3 p-3 bg-white rounded-2xl shadow-md">
      <div className=" text-center mb-4">
        <Heading level={3}>Add <span className="text-teal-700">Student</span></Heading>
      </div>
      <h2 className="text-xl font-medium text-center mb-8">Enter Information</h2>

      <form className="space-y-4">
        {/* Name and Passport Name */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input icon={<FaUser />} type="text" placeholder="Enter Your Name..." className="input-field" />
          <Input icon={<FaPassport />} type="text" placeholder="Passport Name..." className="input-field" />
        </div>

        {/* Course and Country */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input icon={<FaDiscourse />} type="text" placeholder="Course..." className="input-field" />
          <Input icon={<FaBuilding />} type="text" placeholder="Intrested Country..." className="input-field" />
        </div>

        {/* Passport and Photo Upload */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <UploadField label="Passport" />
          <UploadField label="Photo" />
        </div>

        {/* Degree and Certificate Upload */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <UploadField label="Educational Degree" />
          <UploadField label="Educational Certificate" />
        </div>

        {/* Recommendation and Study Plan */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <UploadField label="Recomendation Letter" />
          <UploadField label="Study Plan" />
        </div>

        {/* IELTS or English Letter */}
        <div className=" w-[100%] ">
          <UploadField label="IELTS Or English Proficiency Letter" />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full mt-6 bg-[#0B6D76] text-white py-3 rounded-xl text-lg font-medium hover:bg-teal-800 transition"
        >
          Add
        </button>
      </form>
    </div>
  );
};

// Upload Field Component
const UploadField = ({ label }) => {
  return (
   <div className="flex items-center bg-[#E7F1F2] rounded-[30px] overflow-hidden">
   <div className="flex-1 px-4 md:py-3 py-1 sm:py-1 text-gray-700">
     {label}
   </div>
   
   
   <label className="flex  bg-[var(--brand-color)] 
        text-white
        rounded-tl-[30px] 
        rounded-tr-[30px] 
        rounded-br-[30px]
        md:px-5 sm:px-3 px-3 py-2 
        font-medium 
        text-sm 
        cursor-pointer 
        shadow-md 
        transition-all 
        duration-200  items-center space-x-2 flex-col cursor-pointer ">
     <UploadCloud size={20} />
     <span>Choose Files</span>
     <input type="file" className="hidden" />
   </label>
  
 </div>
 
  );
};

export default NewStudentForm;
