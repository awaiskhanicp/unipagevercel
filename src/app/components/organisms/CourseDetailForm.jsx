'use client';
import React from 'react';
import Link from 'next/link';
import Button from '../atoms/Button';
import Container from '../atoms/Container';

const ReadOnlyField = ({ label, value }) => (
  <div>
    <label className="block mb-1 font-medium">{label}</label>
    <span className="block w-full min-h-[40px] px-3 py-2 rounded-tl-[30px] rounded-tr-[30px] rounded-br-[30px] bg-white border border-gray-300 text-gray-800">
      {value || 'N/A'}
    </span>
  </div>
);

const CourseDetailForm = ({ course }) => {
 
  if (!course) {
    return (
      <Container>
        <div className="min-h-screen flex flex-col items-center justify-center">
          <h1 className="text-2xl font-bold mb-4">Course not found</h1>
          <Link href="/"><Button>Go Back Home</Button></Link>
        </div>
      </Container>
    );
  }

  const formatDuration = () => {
    if (course.duration && course.duration_type) {
      return `${course.duration} ${course.duration_type}`;
    } else if (course.duration) {
      return `${course.duration} months`;
    }
    return 'N/A';
  };

  const formatCurrency = (amount, currency, type) => {

    if (amount === null || amount === undefined) return 'N/A';
    if(type === '$'){
      return `$ ${parseFloat(amount).toLocaleString()}`;
      }else{
        return `${currency || 'PKR'} ${parseFloat(amount).toLocaleString()} `;
      }
  };

  const formatScholarship = (scholarship) => {
    if (scholarship === 1 || scholarship === '1' || scholarship === true) {
      return 'Available';
    } else if (scholarship === 0 || scholarship === '0' || scholarship === false) {
      return 'Not Available';
    }
    return 'N/A';
  };

  return (
    <div className="bg-[#E7F1F2] p-6 md:p-10 rounded-tl-[30px] rounded-tr-[30px] rounded-br-[30px] border-none-full">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ReadOnlyField label="Subject" value={course?.subject_name} />
        <ReadOnlyField 
          label="Qualification" 
          value={course?.qualification} 
        />
        <ReadOnlyField label="Duration" value={formatDuration()} />
        <ReadOnlyField label="Intakes" value={course?.intake || 'N/A'} />
        <ReadOnlyField label="Languages" value={course?.languages || course.language || 'English'} />
        <ReadOnlyField label="Tuition Fee" value={formatCurrency(course?.yearly_fee, course.currency, '$')} />
        <ReadOnlyField label="Consultation Fee" value={formatCurrency(course?.consultation_fee, course?.currency, 'PKR')} />
        <ReadOnlyField label="Discount" value={`${course?.consultation_fee_discount}%`} />
        <ReadOnlyField
          label="Consultation After Discount"
          value={formatCurrency(course?.consultation_fee_after_discount, course?.currency, 'PKR')}
        />
        <ReadOnlyField label="Scholarship" value={formatScholarship(course?.scholarship)} />
      </div>
    </div>
  );
};

export default CourseDetailForm;