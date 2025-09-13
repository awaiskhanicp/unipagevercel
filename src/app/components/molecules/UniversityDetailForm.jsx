'use client';
import React from 'react';

const UniversityDetailForm = ({ university }) => {
  console.log(university, "university form page");

  if (!university) {
    return <div>No university data available.</div>;
  }

  // Format currency display
  const formatCurrency = (amount) => {
    if (amount === 0) return 'Free';
    return `${university.currency} ${amount.toLocaleString()}`;
  };

  return (
    <div className="bg-[#E7F1F2] p-6 md:p-10 rounded-tl-[30px] rounded-tr-[30px] rounded-br-[30px]">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Row 1 */}
        <div>
          <label className="block mb-1 font-medium">Intakes</label>
          <input
            value={university.intake || 'September / January'}
            readOnly
            className="w-full p-2 rounded-lg bg-white"
          />
        </div>
        <div>
          <label className="block mb-1 font-medium">Accommodation</label>
          <input
            value={university.accommodation || 'Available on Campus'}
            readOnly
            className="w-full p-2 rounded-lg bg-white"
          />
        </div>

        {/* Row 2 */}
        <div>
          <label className="block mb-1 font-medium">Languages</label>
          <input
            value={university.languages || 'English'}
            readOnly
            className="w-full p-2 rounded-lg bg-white"
          />
        </div>
        <div>
          <label className="block mb-1 font-medium">Scholarship</label>
          <input
            value={university.scholarship === 1 ? 'Available' : 'Not Available'}
            readOnly
            className="w-full p-2 rounded-lg bg-white"
          />
        </div>

        {/* Row 3 - Consultation Fee */}
        <div>
          <label className="block mb-1 font-medium">Consultation Fee</label>
          <input
            value={formatCurrency(university.consultation_fee)}
            readOnly
            className="w-full p-2 rounded-lg bg-white"
          />
        </div>
        <div>
          <label className="block mb-1 font-medium">Consultation Discount</label>
          <input
            value={
              university.consultation_fee_discount > 0
                ? `${university.consultation_fee_discount} %`
                : 'No discount'
            }
            readOnly
            className="w-full p-2 rounded-lg bg-white"
          />
        </div>

        {/* Row 4 */}
        <div>
          <label className="block mb-1 font-medium">Discounted Consultation Fee</label>
          <input
            value={formatCurrency(university.consultation_fee_after_discount)}
            readOnly
            className="w-full p-2 rounded-lg bg-white"
          />
        </div>
        <div>
          <label className="block mb-1 font-medium">Address</label>
          <input
            value={university.address || university.city || 'Address not provided'}
            readOnly
            className="w-full p-2 rounded-lg bg-white"
          />
        </div>

      </div>
    </div>
  );
};

export default UniversityDetailForm;