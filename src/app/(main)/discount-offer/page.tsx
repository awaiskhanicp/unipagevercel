'use client';

import React, { useState } from 'react';
import Container from '../../components/atoms/Container';
import Heading from '../../components/atoms/Heading';
import Paragraph from '../../components/atoms/Paragraph';
import Button from '../../components/atoms/Button';
import Input from '../../components/atoms/Input';
import Select from '../../components/atoms/Select';
import { FaFlag, FaGlobe, FaUser } from 'react-icons/fa';
import { MdOutlineMail, MdOutlinePhoneEnabled } from "react-icons/md";
import { HiOutlineAcademicCap } from 'react-icons/hi';
import { CiPercent } from "react-icons/ci";
import { IoMdCheckmarkCircleOutline } from "react-icons/io";
import Image from "next/image";
import Swal from 'sweetalert2';

const DiscountOfferPage = () => {
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

  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch('/api/frontend/discount-offers', {
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
        const errorMessages = Object.values(data.message || {}).flat().join(", ") || 'Submission failed';
        Swal.fire({
          icon: 'error',
          title: 'Submission Failed',
          text: errorMessages,
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
      setIsLoading(false);
    }
  };

  return (
    <div className="">
      {/* Hero Section */}
      <section className="relative md:h-[50vh] sm:h-[50vh] md:pt-[0px] sm:pt-[90px] pt-[90px] h-[50vh] flex items-center justify-center overflow-hidden">
        <Image
        src="/assets/disb.png"
        alt="Hero Background"
        fill
        priority
        className="object-cover z-0"
      />
        <div className="absolute inset-0 bg-black opacity-50 z-10"></div>
        <div className="absolute inset-0 z-10 bg-gradient-to-b from-[rgba(0,0,0,0.1)] to-[rgba(0,0,0,0.9)]"></div>
        <div className="relative z-20 text-center px-4 max-w-4xl mx-auto pb-12">
          <Heading level={1}>
            <div className="text-white">Discount Offer</div>
          </Heading>
        </div>
      </section>
      
      <Container>
        <div className="complete-page-spaceing banner-bottom-space bottom-session-space">
          {/* Information Section */}
          <div className='w-full mb-12'>
            <div className='flex flex-col lg:flex-row justify-between gap-12'>
              {/* Left Side Images */}
              <div className="w-full lg:w-[50%] flex gap-6 lg:gap-12">
                <div className="flex flex-col md:block sm:hidden hidden gap-[20px] w-1/2">
                  <Image src="/assets/dis1.png" alt="Discount 1" width={400} height={400} className="w-full" />
                  <Image src="/assets/dis2.png" alt="Discount 2" width={400} height={400} className="w-full" />
                </div>
                <div className="flex flex-col md:block sm:hidden hidden gap-[30px] w-1/2">
                  <div className="bg-[#3C8A91] mb-[20px] rounded-tl-[63px] rounded-tr-[63px] rounded-br-[63px] w-[130px] h-[126px] flex justify-center items-center">
                    <div className="border-2 border-dashed border-white w-[120px] h-[116px] rounded-tl-[63px] rounded-tr-[63px] rounded-br-[63px] flex justify-center items-center">
                      <span className='text-white text-center leading-tight'>
                        30+
                        <div className="text-sm font-normal">Years of <br /> experience</div>
                      </span>
                    </div>
                  </div>
                  
                  <Image src="/assets/dis3.png" alt="Discount 3" width={400} height={400} className="w-full" />

                </div>
              </div>

              {/* Right Side Content */}
              <div className="w-full lg:w-[50%] flex flex-col gap-4">
                <div className="max-w-[330px]">
                  <Heading level={3}>
                    100% <span className="text-[#0B6D76] font-medium"> Discount Offer</span>
                  </Heading>
                </div>

                <div className="max-w-[500px]">
                  <Paragraph>
                    Our <strong>100% Discount Offer Program</strong> is specially designed to support
                    talented students from financially challenged families who dream of studying abroad.
                    Through this initiative, we waive our consultancy fee entirely to ensure that deserving
                    students get an equal opportunity to pursue higher education without financial barriers.
                  </Paragraph>
                </div>

                <div className="max-w-[500px]">
                  <Heading level={4}>Eligibility Criteria</Heading>
                </div>

                <div className="icon-text flex gap-[15px] flex-col">
                  <div className="flex flex-row gap-[10px] items-center">
                    <IoMdCheckmarkCircleOutline className="text-[#3C8A91]" />
                    <Paragraph>Belong to a financially deserving family.</Paragraph>
                  </div>
                  <div className="flex flex-row gap-[10px] items-center">
                    <IoMdCheckmarkCircleOutline className="text-[#3C8A91]" />
                    <Paragraph>Maintain an excellent academic record.</Paragraph>
                  </div>
                  <div className="flex flex-row gap-[10px] items-center">
                    <IoMdCheckmarkCircleOutline className="text-[#3C8A91]" />
                    <Paragraph>Demonstrate genuine financial need.</Paragraph>
                  </div>
                  <div className="flex flex-row gap-[10px] items-center">
                    <IoMdCheckmarkCircleOutline className="text-[#3C8A91]" />
                    <Paragraph>Fulfill all eligibility requirements for studying abroad.</Paragraph>
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* Form Section */}
          <div className="text-center">
            <div className="pb-6 mb-20">
              <Heading level={3}>
                Fill The Form Below to <span className="text-[#0B6D76] font-medium">Apply Now</span>
              </Heading>
            </div>
            
            <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-[80px] items-start">
              <div className="grid grid-cols-1 gap-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <Input
                    icon={<FaUser />}
                    placeholder="Enter Your Name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                  
                  <Input
                    icon={<MdOutlineMail />}
                    placeholder="Enter Your Email"
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />

                  
                  
                  <Input
                    icon={<HiOutlineAcademicCap />}
                    placeholder="Last Education"
                    name="education"
                    value={formData.education}
                    onChange={handleChange}
                    required
                  />
                  
                  <Input
                    icon={<CiPercent />}
                    placeholder="Enter Your Percentage"
                    name="percentage"
                    value={formData.percentage}
                    onChange={handleChange}
                    required
                  />
                  
                  <Input
                    icon={<MdOutlinePhoneEnabled />}
                    placeholder="Phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                  />
                  
                  <Input
                    icon={<FaFlag />}
                    placeholder="Enter Your City"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    required
                  />
                  
                  <Select
                    icon={<FaGlobe />}
                    placeholder="Office Location"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    options={['Lahore', 'Islamabad', 'Karachi']}
                    required
                  />
                </div>
                
                <textarea
                  name="details"
                  value={formData.details}
                  onChange={handleChange}
                  placeholder="Enter Details"
                  className="px-4 py-4 rounded-tl-[30px] rounded-tr-[30px] rounded-br-[30px] bg-[#E7F1F2] text-sm resize-none h-[120px] placeholder-gray-500"
                  required
                />
                
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? (
                    <span className="flex items-center gap-2 justify-center">
                      <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z"></path>
                      </svg>
                      Processing...
                    </span>
                  ) : 'Submit Offer'}
                </Button>
              </div>
              
              {/* Image Section */}
              <div className="relative rounded-3xl overflow-visible shadow-lg h-full">
                <div className="absolute left-[-5%] top-1/2 -translate-y-1/2 h-[80%] w-[30px] bg-[var(--brand-color)] rounded-bl-3xl rounded-tl-3xl z-10"></div>
                <Image
                  src="/assets/dsic.png"
                  alt="Discount Offer"
                  width={600}
                  height={600}
                  className="w-full h-full rounded-[24px] md:block sm:hidden hidden object-cover relative z-0"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0B6D76] to-transparent opacity-50 rounded-[24px]"></div>
                <div className="absolute bottom-8 left-8 text-white">
                  <h3 className="text-2xl font-bold mb-2">Why Apply for Discount?</h3>
                  <ul className="space-y-2">
                    <li className="flex items-center">
                      <span className="mr-2">✓</span> Financial Support for Deserving Students
                    </li>
                    <li className="flex items-center">
                      <span className="mr-2">✓</span> 100% Discount on Consultancy Fees
                    </li>
                    <li className="flex items-center">
                      <span className="mr-2">✓</span> Expert Guidance for Study Abroad
                    </li>
                  </ul>
                </div>
              </div>
            </form>
          </div>
        </div>
      </Container>
    </div>
  );
};

export default DiscountOfferPage;