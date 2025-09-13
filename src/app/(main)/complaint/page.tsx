'use client';

import { useState, FormEvent } from 'react';
import { FaUser, FaGlobe, FaExclamationCircle } from 'react-icons/fa';
import { MdOutlineMail, MdOutlinePhoneEnabled, MdSubject } from "react-icons/md";
import { HiOutlineChatAlt2 } from "react-icons/hi";
import Button from '../../components/atoms/Button';
import Container from '../../components/atoms/Container';
import Heading from '../../components/atoms/Heading';
import Paragraph from '../../components/atoms/Paragraph';
import Input from '../../components/atoms/Input';
import Image from "next/image";
import Swal from 'sweetalert2';

interface FormData {
  name: string;
  email: string;
  subject: string;
  phone: string;
  location: string;
  message: string;
}

interface FormErrors {
  name?: string;
  email?: string;
  subject?: string;
  phone?: string;
  location?: string;
  message?: string;
}

const Complaint = () => {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    subject: '',
    phone: '',
    location: '',
    message: ''
  });
  
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    if (!formData.subject.trim()) {
      newErrors.subject = 'Subject is required';
    }
    
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    }
    
    if (!formData.location) {
      newErrors.location = 'Please select your location';
    }
    
    if (!formData.message.trim()) {
      newErrors.message = 'Please provide details about your complaint or suggestion';
    } else if (formData.message.trim().length < 10) {
      newErrors.message = 'Please provide more details (minimum 10 characters)';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      Swal.fire({
        icon: 'warning',
        title: 'Please check your information',
        text: 'Some fields require your attention',
        confirmButtonColor: '#0B6D76'
      });
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/frontend/complaints', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      const data = await res.json();

      if (res.ok && data.success) {
        // Reset form
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
          title: 'Thank You for Your Feedback!',
          text: 'Your complaint/suggestion has been submitted successfully. We will review it and get back to you shortly.',
          confirmButtonColor: '#0B6D76',
          timer: 4000
        });
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Submission Failed',
          text: data.message || 'There was an issue submitting your feedback. Please try again.',
          confirmButtonColor: '#0B6D76'
        });
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      Swal.fire({
        icon: 'error',
        title: 'Connection Error',
        text: 'Unable to connect to the server. Please check your internet connection and try again.',
        confirmButtonColor: '#0B6D76'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container>
      <div className="text-center py-12 md:py-16">
        {/* Header Section */}
        <div className="pb-10 md:pb-12">
          <Heading level={3}>
            Share Your <span className="text-[#0B6D76]">Feedback</span>
          </Heading>
          <div className="max-w-2xl mx-auto pt-10 mb-10">
            <Paragraph>
              Your opinion matters to us. Whether you have a complaint or a suggestion, 
              we&apos;re here to listen and improve our services.
            </Paragraph>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-12 md:gap-16 items-start">
          {/* Form Section */}
          <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8 border border-gray-100">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <Input
                    icon={<FaUser className="text-[#0B6D76]" />}
                    placeholder="Your Full Name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    error={errors.name}                    
                  />
                </div>
                
                <div className="space-y-2">
                  <Input
                    icon={<MdOutlineMail className="text-[#0B6D76]" />}
                    placeholder="Your Email Address"
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    error={errors.email}
                    
                  />
                </div>
                
                <div className="space-y-2">
                  <Input
                    icon={<MdOutlinePhoneEnabled className="text-[#0B6D76]" />}
                    placeholder="Phone Number"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    error={errors.phone}
                    
                  />
                </div>

                <div className="space-y-2">
                  <div className="relative">
                    <FaGlobe className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#0B6D76] z-10" />
                    <select
                      name="location"
                      value={formData.location}
                      onChange={handleChange}
                      className={`w-full pl-10 pr-4 py-3 rounded-xl border ${
                        errors.location ? 'border-red-300' : 'border-gray-200'
                      } focus:ring-2 focus:ring-[#0B6D76] focus:border-transparent outline-none transition-colors bg-white`}
                      
                    >
                      <option value="">Select Your Location</option>
                      <option value="lahore">Lahore Office</option>
                      <option value="islamabad">Islamabad Office</option>
                      <option value="karachi">Karachi Office</option>
                    </select>
                    {errors.location && (
                      <p className="text-red-500 text-xs mt-1 flex items-center">
                        <FaExclamationCircle className="mr-1" /> {errors.location}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Input
                  icon={<MdSubject className="text-[#0B6D76]" />}
                  placeholder="Subject of Your Feedback"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  error={errors.subject}
                  
                />
              </div>

              <div className="space-y-2">
                <div className="relative">
                  <HiOutlineChatAlt2 className="absolute left-3 top-3 text-[#0B6D76]" />
                  <textarea
                    name="message"
                    placeholder="Please describe your complaint or suggestion in detail..."
                    value={formData.message}
                    onChange={handleChange}
                    className={`w-full pl-10 pr-4 py-3 rounded-xl min-h-[120px] border ${
                      errors.message ? 'border-red-300' : 'border-gray-200'
                    } focus:ring-2 focus:ring-[#0B6D76] focus:border-transparent outline-none transition-colors resize-none placeholder-gray-500`}
                    
                  />
                  {errors.message && (
                    <p className="text-red-500 text-xs mt-1 flex items-center">
                      <FaExclamationCircle className="mr-1" /> {errors.message}
                    </p>
                  )}
                </div>
              </div>

              <Button 
                type="submit" 
                disabled={loading}
                className="w-full py-3 bg-[#0B6D76] hover:bg-[#095a62] text-white font-medium rounded-xl transition-colors duration-300"
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin h-5 w-5 text-white mr-2" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z"></path>
                    </svg>
                    Submitting...
                  </span>
                ) : (
                  "Submit Feedback"
                )}
              </Button>
            </form>
          </div>

          {/* Information Section */}
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-[#2E3B5A] to-[#0B6D76] rounded-2xl p-6 md:p-8 text-white">
              <h3 className="text-xl font-semibold mb-4">Why Your Feedback Matters</h3>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <div className="bg-white/20 rounded-full p-1 mr-3 mt-1">
                    <FaExclamationCircle className="text-white text-sm" />
                  </div>
                  <span>Helps us improve our services and address issues promptly</span>
                </li>
                <li className="flex items-start">
                  <div className="bg-white/20 rounded-full p-1 mr-3 mt-1">
                    <FaExclamationCircle className="text-white text-sm" />
                  </div>
                  <span>Your suggestions might lead to new features and improvements</span>
                </li>
                <li className="flex items-start">
                  <div className="bg-white/20 rounded-full p-1 mr-3 mt-1">
                    <FaExclamationCircle className="text-white text-sm" />
                  </div>
                  <span>We&apos;re committed to providing the best possible experience</span>
                </li>
              </ul>
            </div>

            <div className="bg-gray-50 rounded-2xl p-6 md:p-8 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">What Happens Next?</h3>
              <ol className="space-y-3 text-sm text-gray-600">
                <li className="flex items-start">
                  <span className="bg-[#0B6D76] text-white rounded-full w-5 h-5 flex items-center justify-center text-xs mr-3 mt-1">1</span>
                  <span>Your feedback is received and logged in our system</span>
                </li>
                <li className="flex items-start">
                  <span className="bg-[#0B6D76] text-white rounded-full w-5 h-5 flex items-center justify-center text-xs mr-3 mt-1">2</span>
                  <span>Our team reviews it within 24-48 business hours</span>
                </li>
                <li className="flex items-start">
                  <span className="bg-[#0B6D76] text-white rounded-full w-5 h-5 flex items-center justify-center text-xs mr-3 mt-1">3</span>
                  <span>We&apos;ll contact you if we need additional information</span>
                </li>
                <li className="flex items-start">
                  <span className="bg-[#0B6D76] text-white rounded-full w-5 h-5 flex items-center justify-center text-xs mr-3 mt-1">4</span>
                  <span>You&apos;ll receive a response outlining any actions taken</span>
                </li>
              </ol>
            </div>

            {/* Image Section */}
            <div className="relative rounded-2xl overflow-hidden shadow-lg">
              <Image
  src="/assets/comp.png"
  alt="Customer feedback illustration"
  width={800}
  height={400}
  className="w-full h-64 object-cover"
/>
              <div className="absolute inset-0 bg-gradient-to-t from-[#2E3B5A]/80 to-transparent flex items-end p-6">
                <p className="text-white text-sm">We value every voice and are committed to continuous improvement</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Container>
  );
};

export default Complaint;