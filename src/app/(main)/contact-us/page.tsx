'use client';

import React, { useState } from 'react';
import Swal from 'sweetalert2';
import Image from 'next/image';
import { 
  FaUser, 
  FaGlobe, 
  FaPhone, 
  FaFacebook, 
  FaLinkedin, 
  FaWhatsapp, 
  FaMapMarkerAlt,
  FaClock,
  FaEnvelope
} from 'react-icons/fa';
import { 
  BsInstagram 
} from 'react-icons/bs';
import { 
  MdOutlineMail, 
  MdOutlinePhone,
  MdMessage
} from 'react-icons/md';

// Custom Components
import Heading from "../../components/atoms/Heading";
import Paragraph from "../../components/atoms/Paragraph";
import Container from "../../components/atoms/Container";
import Button from "../../components/atoms/Button";
import Input from "../../components/atoms/Input";
import Select from "../../components/atoms/Select";

const offices = [
  {
    city: "Lahore Office",
    phones: ["0324 3640038", "0333 0033235", "03112853198"],
    email: "info@universitiespage.com",
    address: "Universities Page, 2nd Floor Faisal Bank, Raja Market, Garden Town, Lahore, Pakistan",
    image: "/assets/la.png",
    hours: "Mon - Sat: 9:30 AM - 6:30 PM"
  },
  {
    city: "Islamabad Office",
    phones: ["0334 9990308", "0310 3172004", "0300 4010286"],
    email: "Info@universitiespage.com",
    address: "Universities Page, Punjab market, Venus Plaza, 1st Floor, Office No. 1, Sector G13/4, Islamabad",
    image: "/assets/is.png",
    hours: "Mon - Sat: 9:30 AM - 6:30 PM"
  },
  {
    city: "Karachi Office",
    phones: ["0310 6225430", "0310 6225408", "0310 6225410"],
    email: "Info@universitiespage.com",
    address: "Universities Page, 1st floor, Amber Estate, Shahrah-e-Faisal Rd, Bangalore Town Block A Shah, Karachi, Sindh",
    image: "/assets/ka.png",
    hours: "Mon - Sat: 9:30 AM - 6:30 PM"
  },
];

const socialLinks = [
  { icon: <FaFacebook />, url: "#", label: "Facebook" },
  { icon: <FaLinkedin />, url: "#", label: "LinkedIn" },
  { icon: <BsInstagram />, url: "#", label: "Instagram" },
  { icon: <FaWhatsapp />, url: "#", label: "WhatsApp" },
];

// Add interface for form data
interface ContactForm {
  user_name: string;
  user_email: string;
  phone_number: string;
  office_location: string;
  message: string;
}

const ContactSection = () => {
  const [form, setForm] = useState<ContactForm>({
    user_name: '',
    user_email: '',
    phone_number: '',
    office_location: '',
    message: '',
  });

  const [errors, setErrors] = useState<Partial<ContactForm>>({});
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: '' }));
  };

const validate = () => {
  // Type the newErrors object with Partial<ContactForm>
  const newErrors: Partial<ContactForm> = {};
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  // Clean phone number for validation: remove (, ), -, space
  const cleanedPhone = form.phone_number.replace(/[\s()-]/g, '');
  const internationalPhoneRegex = /^\+?[1-9]\d{6,15}$/;

  if (!form.user_name.trim()) newErrors.user_name = "Name is required";
  if (!form.user_email.trim()) newErrors.user_email = "Email is required";
  else if (!emailRegex.test(form.user_email)) newErrors.user_email = "Invalid email format";

  if (!form.phone_number.trim()) newErrors.phone_number = "Phone number is required";
  else if (!internationalPhoneRegex.test(cleanedPhone))
    newErrors.phone_number = "Invalid phone number (only digits allowed after +)";

  if (!form.office_location.trim()) newErrors.office_location = "Office location is required";
  if (!form.message.trim()) newErrors.message = "Message is required";

  setErrors(newErrors);
  return Object.keys(newErrors).length === 0;
};
  
  const renderError = (field) =>
    errors[field] ? <p className="text-red-500 text-sm mt-1">{errors[field]}</p> : null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    
    setIsLoading(true);

    try {
      const res = await fetch('/api/frontend/contact-us', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (data.success) {
        Swal.fire({
          icon: 'success',
          title: 'Message Sent',
          text: 'Your message has been sent successfully! We will contact you shortly.',
        });
        setForm({
          user_name: '',
          user_email: '',
          phone_number: '',
          office_location: '',
          message: '',
        });
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Submission Failed',
          text: data.message || "Please try again later.",
        });
      }
    } catch (error) {
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

    <div>
                  {/* Hero Section */}
      <section className="bg-gradient-to-r from-lightgreen-900 to-teal-800 text-white py-16">
        <Container>
          <div className="text-center max-w-3xl mx-auto">
            <Heading level={3} className="mb-4">
            Get in <span className="text-[#0B6D76] font-medium">Touch</span>
          </Heading>
            <Paragraph>
              We&apos;re here to help you with your educational journey. Whether you have questions about 
              programs, admissions, or need guidance, our team is ready to assist you.
            </Paragraph>
          </div>
        </Container>
      </section>
    <Container>
      <div className="bottom-session-space banner-bottom-space">
        {/* Contact Information Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          <div className="bg-white p-6 rounded-xl shadow-md text-center">
            <div className="bg-[#E7F1F2] w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <MdOutlinePhone className="text-2xl text-[#0B6D76]" />
            </div>
            <Heading level={4} className="mb-2">Call Us</Heading>
            <Paragraph>Speak directly with our consultants</Paragraph>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-md text-center">
            <div className="bg-[#E7F1F2] w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <MdOutlineMail className="text-2xl text-[#0B6D76]" />
            </div>
            <Heading level={4} className="mb-2">Email Us</Heading>
            <Paragraph>Send us an email anytime at info@universitiespage.com</Paragraph>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-md text-center">
            <div className="bg-[#E7F1F2] w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <FaMapMarkerAlt className="text-xl text-[#0B6D76]" />
            </div>
            <Heading level={4} className="mb-2">Visit Us</Heading>
            <Paragraph>Meet us at our offices at Lahore, Islamabad, Karachi</Paragraph>
          </div>
        </div>

        {/* Form Section */}
        <div className="contact-inner complete-page-spaceing">
          <div className="form">
            <div className="grid md:grid-cols-2 gap-12 items-start">
              {/* Contact Form */}
              <div className="bg-white p-8 rounded-2xl shadow-lg">
                <Heading level={4} className="mb-2">Send us a Message</Heading>
                <Paragraph className="mb-6">
                  Fill out the form below and our team will get back to you within 24 hours.
                </Paragraph>
                
                <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-6 mt-15">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Input
                        name="user_name"
                        icon={<FaUser />}
                        value={form.user_name}
                        onChange={handleChange}
                        placeholder="Your Full Name"
                      />
                      {renderError('user_name')}
                    </div>
                    <div>
                      <Input
                        name="user_email"
                        icon={<MdOutlineMail />}
                        value={form.user_email}
                        onChange={handleChange}
                        placeholder="Your Email Address"
                      />
                      {renderError('user_email')}
                    </div>
                    <div>
                      <Input
                        name="phone_number"
                        icon={<FaPhone />}
                        value={form.phone_number}
                        onChange={handleChange}
                        placeholder="Phone (e.g. +923001234567)"
                      />
                      {renderError('phone_number')}
                    </div>
                    <div>
                      <Select
                        name="office_location"
                        icon={<FaGlobe />}
                        value={form.office_location}
                        onChange={handleChange}
                        placeholder="Nearest Office Location"
                        options={['Lahore', 'Islamabad', 'Karachi']}
                      />
                      {renderError('office_location')}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Your Message
                    </label>
                    <textarea
                      name="message"
                      value={form.message}
                      onChange={handleChange}
                      placeholder="How can we help you?"
                      className="px-4 py-3 rounded-xl bg-[#E7F1F2] text-sm resize-none h-[140px] placeholder-gray-500 w-full border-none focus:ring-2 focus:ring-[#0B6D76]"
                    />
                    {renderError('message')}
                  </div>

                  <Button type="submit" disabled={isLoading} className="w-full">
                    {isLoading ? 'Sending...' : 'Send Message'}
                  </Button>
                </form>
              </div>


{/* FAQ Section with Accordion */}
<div className="mt-16">
  <Heading level={4} className="text-center mb-4">Frequently Asked Questions</Heading>

  
  <div className="max-w-4xl mx-auto">
    <div className="space-y-4">
      {/* FAQ Item 1 */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <button 
          className="flex justify-between items-center w-full p-5 text-left font-semibold text-[#0B6D76] hover:bg-[#E7F1F2] transition-colors"
          onClick={() => {/* Add toggle functionality */}}
        >
          <span>How quickly do you respond to inquiries?</span>
          <svg className="w-5 h-5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        <div className="px-5 pb-5">
          <Paragraph>
            We typically respond to all inquiries within 24 hours during business days. For urgent matters, 
            please call our office directly for immediate assistance.
          </Paragraph>
        </div>
      </div>
      
      {/* FAQ Item 2 */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <button 
          className="flex justify-between items-center w-full p-5 text-left font-semibold text-[#0B6D76] hover:bg-[#E7F1F2] transition-colors"
          onClick={() => {/* Add toggle functionality */}}
        >
          <span>Do I need to book an appointment before visiting?</span>
          <svg className="w-5 h-5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        <div className="px-5 pb-5">
          <Paragraph>
            While walk-ins are welcome, we recommend scheduling an appointment to ensure 
            that a consultant is available to assist you without waiting. You can book an 
            appointment through our website or by calling our office.
          </Paragraph>
        </div>
      </div>
      
      {/* FAQ Item 3 */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <button 
          className="flex justify-between items-center w-full p-5 text-left font-semibold text-[#0B6D76] hover:bg-[#E7F1F2] transition-colors"
          onClick={() => {/* Add toggle functionality */}}
        >
          <span>What documents should I bring to my consultation?</span>
          <svg className="w-5 h-5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        <div className="px-5 pb-5">
          <Paragraph>
            Please bring your academic transcripts, passport, any language test results (IELTS, TOEFL, etc.),
            and letters of recommendation if available. This will help us provide the most accurate guidance 
            for your educational journey.
          </Paragraph>
        </div>
      </div>
      
    </div>
    
  </div>
</div>
            </div>
          </div>


{/* Office Locations - Horizontal Layout */}
<div className="mt-12">
  <Heading level={4} className="text-center mb-8">Our Office Locations</Heading>
  
  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 mt-20">
    {offices.map((office, index) => (
      <div key={index} className="bg-white rounded-xl shadow-lg overflow-hidden transition-transform duration-300 hover:shadow-xl hover:-translate-y-1">
        <div className="h-48 relative">
          <Image
            src={office.image}
            alt={office.city}
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0B6D76] to-transparent opacity-80"></div>
          <div className="absolute bottom-4 left-4 text-white">
            <Heading level={4}>{office.city}</Heading>
          </div>
        </div>
        
        <div className="p-5">
          <div className="space-y-3">
            <div className="flex items-start">
              <FaMapMarkerAlt className="text-[#0B6D76] mt-1 mr-3 flex-shrink-0" />
              <span className="text-sm">{office.address}</span>
            </div>
            
            <div className="flex items-start">
              <MdOutlinePhone className="text-[#0B6D76] mr-3 mt-1 flex-shrink-0" />
              <div className="text-sm">
                {office.phones.map((phone, i) => (
                  <div key={i}>{phone}</div>
                ))}
              </div>
            </div>
            
            <div className="flex items-center">
              <MdOutlineMail className="text-[#0B6D76] mr-3 flex-shrink-0" />
              <span className="text-sm">{office.email}</span>
            </div>
            
            <div className="flex items-center">
              <FaClock className="text-[#0B6D76] mr-3 flex-shrink-0" />
              <span className="text-sm">{office.hours}</span>
            </div>
          </div>
          
          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="flex justify-center space-x-3">
              {socialLinks.map((social, idx) => (
                <a
                  key={idx}
                  href={social.url}
                  className="bg-[#E7F1F2] text-[#0B6D76] p-2 rounded-full hover:bg-[#0B6D76] hover:text-white transition-colors"
                  aria-label={social.label}
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    ))}
  </div>
</div>
        </div>
      </div>
    </Container>
    </div>
  );
};

export default ContactSection;