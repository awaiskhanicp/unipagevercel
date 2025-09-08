'use client';

import '../../../app/globals.css';
import Heading from '../atoms/Heading';
import { FaFlag, FaGlobe, FaUser } from 'react-icons/fa';
import { MdOutlineMail, MdOutlinePhoneEnabled } from "react-icons/md";
import { HiOutlineAcademicCap } from 'react-icons/hi';
import { CiPercent } from "react-icons/ci";
import Button from '../atoms/Button';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Swal from 'sweetalert2'; // ✅ SweetAlert2 added

const DiscountOfferApplyNow = () => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    percentage: '',
    phone: '',
    education: '',
    city: '',
    location: '',
    details: ''
  });

  const [loading, setLoading] = useState(false); // ✅ loading state for button

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/internal/discount-offers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setFormData({
          name: '',
          email: '',
          percentage: '',
          phone: '',
          education: '',
          city: '',
          location: '',
          details: ''
        });

        Swal.fire({
          icon: 'success',
          title: 'Application Submitted',
          text: 'Your discount offer application has been submitted successfully!',
        });
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Submission Failed',
          text: 'Please try again later.',
        });
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error Occurred',
        text: 'Something went wrong. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='text-center md:py-12 sm:py-2 py-2'>
      <div className="pb-[50px]">
        <Heading level={3}>
          Fill The Form Below to <span className="text-[#0B6D76] font-medium">Apply Now</span>
        </Heading>
      </div>
      <form onSubmit={handleSubmit} className="discount-sesiom grid md:grid-cols-2 gap-[80px]">
        <div className="grid grid-cols-1 gap-4 w-full">
          <div className="form grid xl:grid-cols-2 lg:grid-cols-2 md:grid-cols-2 grid-cols-1 gap-4">
            
            {/* Name */}
            <div className="relative">
              <FaUser className="absolute left-3 top-1/4 transform -translate-y-1/2 text-gray-400" />
              <input
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter Your Name"
                className="pl-10 w-full px-4 py-3 rounded-tl-[30px] rounded-tr-[30px] rounded-br-[30px] bg-[#E7F1F2] text-sm"
                required
              />
            </div>
            
            {/* Email */}
            <div className="relative">
              <MdOutlineMail className="absolute left-3 top-1/4 transform -translate-y-1/2 text-gray-400" />
              <input
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter Your Email"
                className="pl-10 w-full px-4 py-3 rounded-tl-[30px] rounded-tr-[30px] rounded-br-[30px] bg-[#E7F1F2] text-sm"
                required
              />
            </div>

            {/* Percentage */}
            <div className="relative">
              <CiPercent className="absolute left-3 top-1/4 transform -translate-y-1/2 text-gray-400" />
              <input
                name="percentage"
                value={formData.percentage}
                onChange={handleChange}
                placeholder="Enter Your Percentage"
                className="pl-10 w-full px-4 py-3 rounded-tl-[30px] rounded-tr-[30px] rounded-br-[30px] bg-[#E7F1F2] text-sm"
                required
              />
            </div>

            {/* Phone */}
            <div className="relative">
              <MdOutlinePhoneEnabled className="absolute left-3 top-1/4 transform -translate-y-1/2 text-gray-400" />
              <input
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="Phone"
                className="pl-10 w-full px-4 py-3 rounded-tl-[30px] rounded-tr-[30px] rounded-br-[30px] bg-[#E7F1F2] text-sm"
                required
              />
            </div>

            {/* Education */}
            <div className="relative">
              <HiOutlineAcademicCap className="absolute left-3 top-1/4 transform -translate-y-1/2 text-gray-400" />
              <input
                name="education"
                value={formData.education}
                onChange={handleChange}
                placeholder="Last Education"
                className="pl-10 w-full px-4 py-3 rounded-tl-[30px] rounded-tr-[30px] rounded-br-[30px] bg-[#E7F1F2] text-sm"
                required
              />
            </div>

            {/* City */}
            <div className="relative">
              <FaFlag className="absolute left-3 top-1/4 transform -translate-y-1/2 text-gray-400" />
              <input
                name="city"
                value={formData.city}
                onChange={handleChange}
                placeholder="Enter Your City"
                className="pl-10 w-full px-4 py-3 rounded-tl-[30px] rounded-tr-[30px] rounded-br-[30px] bg-[#E7F1F2] text-sm"
                required
              />
            </div>
          </div>
          
          {/* Location */}
          <div className="col-span-2 flex gap-[20px] flex-col">
            <div className="relative">
              <FaGlobe className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <select
                name="location"
                value={formData.location}
                onChange={handleChange}
                className="pl-10 w-full px-4 py-3 rounded-tl-[30px] rounded-tr-[30px] rounded-br-[30px] bg-[#E7F1F2] text-sm appearance-none"
                required
              >
                <option value="">Office Location</option>
                <option value="Punjab">Punjab</option>
                <option value="Sindh">Sindh</option>
                <option value="California">California</option>
              </select>
            </div>

            {/* Details */}
            <textarea
              name="details"
              value={formData.details}
              onChange={handleChange}
              placeholder="Enter Details"
              className="px-4 py-4 rounded-tl-[30px] rounded-tr-[30px] rounded-br-[30px] bg-[#E7F1F2] text-sm resize-none h-[120px] placeholder-gray-500"
              required
            />

            {/* Submit Button */}
            <div>
              <Button type="submit" disabled={loading}>
                {loading ? (
                  <span className="flex items-center gap-2 justify-center">
                    <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10"
                        stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor"
                        d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z"></path>
                    </svg>
                    Processing...
                  </span>
                ) : 'Submit Offer'}
              </Button>
            </div>
          </div>
        </div>
        
        {/* Image Section */}
        <div className="relative rounded-3xl overflow-visible shadow-lg">
          <div className="absolute left-[-5%] top-1/2 -translate-y-1/2 h-[80%] w-[30px] bg-[var(--brand-color)] rounded-bl-3xl rounded-tl-3xl z-10"></div>
          <img
            src="/assets/dsic.png"
            alt="Free Consultation"
            className="w-full h-auto object-cover md:block sm:hidden hidden relative z-0"
          />
        </div>
      </form>
    </div>
  );
};

export default DiscountOfferApplyNow;