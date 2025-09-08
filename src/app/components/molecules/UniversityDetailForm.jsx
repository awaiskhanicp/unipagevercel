'use client';
import React from 'react';

const UniversityDetailForm = ({ university }) => {
  console.log(university, "university form page");

  if (!university) {
    return <div>No university data available.</div>;
  }

  const countryInfo = university.country_info;
  const consultationFee = countryInfo?.consultation_fee || 0; // Original fee
  const consultationDiscountPercent = countryInfo?.consultation_fee_discount || 0; // Discount in %
  const currency = countryInfo?.currency || 'PKR';

  // Calculate discounted consultation fee from percentage
  const discountedFee =
    consultationFee > 0
      ? consultationFee - (consultationFee * consultationDiscountPercent) / 100
      : 0;

  // Format currency display
  const formatCurrency = (amount) => {
    if (amount === 0) return 'Free';
    return `${currency} ${amount.toLocaleString()}`;
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
            value={university.scholarship === 1 || university.scholarship === true ? 'Available' : 'Not Available'}
            readOnly
            className="w-full p-2 rounded-lg bg-white"
          />
        </div>

        {/* Row 3 - Consultation Fee */}
        <div>
          <label className="block mb-1 font-medium">Consultation Fee</label>
          <input
            value={formatCurrency(consultationFee)}
            readOnly
            className="w-full p-2 rounded-lg bg-white"
          />
        </div>
        <div>
          <label className="block mb-1 font-medium">Consultation Discount</label>
          <input
            value={
              consultationDiscountPercent > 0
                ? `${consultationDiscountPercent} %`
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
            value={formatCurrency(discountedFee)}
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













// 'use client';
// import React from 'react';
// import { useParams } from 'next/navigation';
// import Link from 'next/link';
// import Button from '../atoms/Button';
// import Container from '../atoms/Container';
// import { getUniversityById } from '../../../app/utils/universities';

// const UniversityDetailForm = ({ university }) => {
// console.log(university,"university form page")

//   if (!university) {
//     return <div>No university data available.</div>;
//   }

//   // Extract country information for fees and discounts
//   const countryInfo = university.country_info;
//   const consultationFee = countryInfo?.consultation_fee || 0;
//   const consultationDiscount = countryInfo?.consultation_fee_discount || 0;
//   const currency = countryInfo?.currency || 'USD';
  
//   // Calculate discounted consultation fee
//   const discountedFee = consultationFee - consultationDiscount;
  
//   // Format currency display
//   const formatCurrency = (amount) => {
//     if (amount === 0) return 'Free';
//     return ` ${amount.toLocaleString()}`;
//   };

//   return (
//     <div className="bg-[#E7F1F2] p-6 md:p-10 rounded-tl-[30px] rounded-tr-[30px] rounded-br-[30px]">
//       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//         {/* Row 1 */}
//         <div>
//           <label className="block mb-1 font-medium">Intakes</label>
//           <input
//             value={university.intake || 'September / January'}
//             readOnly
//             className="w-full p-2 rounded-lg bg-white"
//           />
//         </div>
//         <div>
//           <label className="block mb-1 font-medium">Accommodation</label>
//           <input
//             value={university.accommodation || 'Available on Campus'}
//             readOnly
//             className="w-full p-2 rounded-lg bg-white"
//           />
//         </div>

//         {/* Row 2 */}
//         <div>
//           <label className="block mb-1 font-medium">Languages</label>
//           <input
//             value={university.languages || 'English'}
//             readOnly
//             className="w-full p-2 rounded-lg bg-white"
//           />
//         </div>
//         <div>
//           <label className="block mb-1 font-medium">Scholarship</label>
//           <input
//             value={university.scholarship === 1 || university.scholarship === true ? 'Available' : 'not Available'}
//             readOnly
//             className="w-full p-2 rounded-lg bg-white"
//           />
//         </div>

//         {/* Row 3 - Consultation Fee from Country */}
//         <div>
//           <label className="block mb-1 font-medium">Consultation Fee</label>
//           <input
//             value={formatCurrency(consultationFee)}
//             readOnly
//             className="w-full p-2 rounded-lg bg-white"
//           />
//         </div>
//         <div>
//           <label className="block mb-1 font-medium">Consultation Discount</label>
//           <input
//             value={consultationDiscount > 0 ? `${formatCurrency(consultationDiscount)} % ` : 'No discount'}
//             readOnly
//             className="w-full p-2 rounded-lg bg-white"
//           />
//         </div>

//         {/* Row 4 */}
//         <div>
//           <label className="block mb-1 font-medium">Discounted Consultation Fee</label>
//           <input
//             value={formatCurrency(discountedFee)}
//             readOnly
//             className="w-full p-2 rounded-lg bg-white"
//           />
//         </div>
//         <div>
//           <label className="block mb-1 font-medium">Address</label>
//           <input
//             value={university.address || university.city || 'Address not provided'}
//             readOnly
//             className="w-full p-2 rounded-lg bg-white"
//           />
//         </div>

//         {/* Row 5 - Entry Requirements Button */}
     
//       </div>
//     </div>
//   );
// };

// export default UniversityDetailForm;