"use client";

import { FaUser, FaGlobe } from 'react-icons/fa';
import { MdOutlineMail, MdOutlinePhoneEnabled } from "react-icons/md";
import Button from '../../components/atoms/Button';
import Container from '../../components/atoms/Container';
import Heading from '../../components/atoms/Heading';
import Paragraph from '../../components/atoms/Paragraph';
import Input from '../../components/atoms/Input';
import { useState } from 'react';
import Swal from 'sweetalert2';

const Complaint = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    phone: '',
    location: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/internal/complaints', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setFormData({
          name: '',
          email: '',
          subject: '',
          phone: '',
          location: '',
          message: ''
        });

        Swal.fire({
          icon: 'success',
          title: 'Complaint Submitted',
          text: 'Your complaint/suggestion has been submitted successfully!',
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
    <Container>
      <div className="text-center banner-bottom-space bottom-session-space">
        <div className="pb-6 md:pt-[0px] sm:pt-[80px] pt-[80px]">
          <Heading level={3}>
            Complaint / <span className="text-[#0B6D76] font-medium">Suggestion Box</span>
          </Heading>
          <Paragraph>
            If you have any complaint or suggestion please send us a message
          </Paragraph>
        </div>

        <div className="grid md:grid-cols-2 gap-[80px] items-start">
          {/* Form Section */}
<form className="grid grid-cols-1 gap-6 w-full" onSubmit={handleSubmit}>
  <div className="grid xl:grid-cols-2 lg:grid-cols-2 md:grid-cols-2 grid-cols-1 gap-4">
    <Input
      icon={<FaUser />}
      placeholder="Enter Your Name"
      name="name"
      value={formData.name}
      onChange={handleChange}
    />
    <Input
      icon={<MdOutlineMail />}
      placeholder="Enter Your Email"
      name="email"
      value={formData.email}
      onChange={handleChange}
    />
    <Input
      icon={<MdOutlinePhoneEnabled />}
      placeholder="Phone"
      name="phone"
      value={formData.phone}
      onChange={handleChange}
    />

    {/* ✅ Dropdown for Location */}
    <div className="relative">
      <FaGlobe className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
      <select
        name="location"
        value={formData.location}
        onChange={handleChange}
        className="pl-10 pr-4 py-3 w-full rounded-xl bg-[#E7F1F2] text-sm text-gray-700 focus:ring-2 focus:ring-[#0B6D76] outline-none"
      >
        <option value="">Select Location</option>
        <option value="lahore">Lahore</option>
        <option value="islamabad">Islamabad</option>
        <option value="karachi">Karachi</option>
      </select>
    </div>
  </div>

  {/* Subject */}
  <Input
    placeholder="Subject"
    name="subject"
    value={formData.subject}
    onChange={handleChange}
  />

  {/* Message */}
  <textarea
    name="message"
    placeholder="Enter Details"
    value={formData.message}
    onChange={handleChange}
    className="px-4 py-4 rounded-tl-[30px] rounded-tr-[30px] rounded-br-[30px] bg-[#E7F1F2] text-sm resize-none h-[120px] placeholder-gray-500"
  />

  {/* Submit Button */}
  <Button type="submit" disabled={loading}>
    {loading ? (
      <span className="flex items-center gap-2 justify-center">
        <svg
          className="animate-spin h-5 w-5 text-white"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z"
          ></path>
        </svg>
        Submitting...
      </span>
    ) : (
      "Submit Complaint"
    )}
  </Button>
</form>


          {/* Image Section */}
          <div className="relative rounded-3xl overflow-visible shadow-lg">
            <div className="absolute left-[-5%] top-1/2 -translate-y-1/2 h-[80%] w-[30px] bg-[var(--brand-color)] rounded-bl-3xl rounded-tl-3xl z-10"></div>
            <img
              src="/assets/comp.png"
              alt="Free Consultation"
              className="w-full rounded-[24px] md:block sm:hidden hidden object-cover relative z-0"
            />
          </div>
        </div>
      </div>
    </Container>
  );
};

export default Complaint;
