'use client';

import { useState } from 'react';
import Swal from 'sweetalert2';
import Heading from "../../components/atoms/Heading";
import Paragraph from "../../components/atoms/Paragraph";
import { FaFacebook, FaGlobe, FaPhone, FaUser, FaWhatsapp } from "react-icons/fa";
import { FaLinkedin } from "react-icons/fa6";
import { BsInstagram } from "react-icons/bs";
import Container from "../../components/atoms/Container";
import { MdOutlineMail, MdOutlinePhone } from "react-icons/md";
import Button from "../../components/atoms/Button";
import Link from "next/link";
import Input from '../../components/atoms/Input';
import Select from '../../components/atoms/Select';

const offices = [
  {
    city: "Lahore Office",
    phones: ["0324 3640038", "0333 0033235", "03112853198"],
    email: "info@universitiespage.com",
    address: "Universities Page, 2nd Floor Faisal Bank, Raja Market, Garden Town, Lahore, Pakistan",
    image: "/assets/la.png",
  },
  {
    city: "Islamabad Office",
    phones: ["0334 9990308", "0310 3172004", "0300 4010286"],
    email: "Info@universitiespage.com",
    address: "Universities Page, Punjab market, Venus Plaza, 1st Floor, Office No. 1, Sector G13/4, Islamabad",
    image: "/assets/is.png",
  },
  {
    city: "Karachi Office",
    phones: ["0310 6225430", "0310 6225408", "0310 6225410"],
    email: "Info@universitiespage.com",
    address: "Universities Page, 1st floor, Amber Estate, Shahrah-e-Faisal Rd, Bangalore Town Block A Shah, Karachi, Sindh",
    image: "/assets/ka.png",
  },
];

const ContactSection = () => {
  const [form, setForm] = useState({
    user_name: '',
    user_email: '',
    phone_number: '',
    office_location: '',
    message: '',
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: '' }));
  };
  const validate = () => {
    const newErrors = {};
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

    try {
      const res = await fetch('/api/internal/contactUs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (data.success) {
        Swal.fire({
          icon: 'success',
          title: 'Message Sent',
          text: 'Your message has been sent successfully!',
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
    }
  };

  return (
    <Container>
      <div className="bottom-session-space banner-bottom-space">
        <div className="text-bottom-space text-center md:pt-[0px] sm:pt-[80px] pt-[80px]">
          <Heading level={3}>
            Do you want to <span className="text-[#0B6D76] font-medium">Contact Us?</span>
          </Heading>
          <div className="max-w-[700px]  md:mt-[20px] sm:mt-[10px]  mt-[10px] mx-auto">
            <Paragraph>
              Please complete the form below to initiate your study abroad application. Our expert team will provide you a free assessment and reach out to guide you through the next steps.
            </Paragraph>
          </div>
        </div>

        <div className="contact-inner complete-page-spaceing">
          <div className="form">
            <div className="left-main grid md:grid-cols-2 gap-[80px] items-center">
              <form onSubmit={handleSubmit} className="form-left grid grid-cols-1 gap-6 w-full">
                <div className="grid xl:grid-cols-2 lg:grid-cols-2 md:grid-cols-2 grid-cols-1 gap-4">
                  <div>
                    <Input
                      name="user_name"
                      icon={<FaUser />}
                      value={form.user_name}
                      onChange={handleChange}
                      placeholder="Name"
                    />
                    {renderError('user_name')}
                  </div>
                  <div>
                    <Input
                      name="user_email"
                      icon={<MdOutlineMail />}
                      value={form.user_email}
                      onChange={handleChange}
                      placeholder="Email"
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
                      placeholder="Office Location"
                      options={['Lahore', 'Islamabad', 'Karachi']}
                    />
                    {renderError('office_location')}
                  </div>
                </div>

                <div>
                  <textarea
                    name="message"
                    value={form.message}
                    onChange={handleChange}
                    placeholder="Enter Details"
                    className="px-4 py-4 rounded-tl-[30px] rounded-tr-[30px] rounded-br-[30px] bg-[#E7F1F2] text-sm resize-none h-[120px] placeholder-gray-500 w-full"
                  />
                  {renderError('message')}
                </div>

                <Button type="submit">Submit Complaint</Button>
              </form>

              <div className="relative md:block hidden rounded-3xl overflow-visible shadow-lg">
                <div className="absolute left-[-5%] top-1/2 -translate-y-1/2 h-[80%] w-[30px] bg-[var(--brand-color)] rounded-bl-3xl rounded-tl-3xl z-10"></div>
                <img
                  src="/assets/comp.png"
                  alt="Free Consultation"
                  className="w-full rounded-[24px] object-cover relative z-0"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[30px] mt-10">
            {offices.map((office, index) => (
              <div className="contact relative" key={index}>
                <div className="contact-inner flex flex-col md:flex-row relative z-10">
                  <div className="hidden md:flex icon bg-[#0B6D76] flex-col mt-[40%] left-[3%] relative w-[60px]">
                    <Link href="#"><div className="text-xl text-white border-t py-[15px] flex justify-center items-center border-white"><FaFacebook /></div></Link>
                    <Link href="#"><div className="text-xl text-white border-t py-[15px] flex justify-center items-center border-white"><FaLinkedin /></div></Link>
                    <Link href="#"><div className="text-xl text-white border-t py-[15px] flex justify-center items-center border-white"><BsInstagram /></div></Link>
                    <Link href="#"><div className="text-xl text-white border-t py-[15px] flex justify-center items-center border-white"><FaWhatsapp /></div></Link>
                  </div>
                  <div className="img relative z-10 w-full">
                    <img
                      src={office.image}
                      alt={`${office.city} Image`}
                      className="w-full object-cover relative ml-[3%] z-10 hidden md:block"
                    />
                  </div>
                </div>
                <div className="text-inner bg-[#E7F1F2] md:pt-[80px] sm:pt-[30px] pt-[30px] flex flex-col relative justify-end w-[95%] p-4 z-0 rounded-b-2xl mx-auto">
                  <Heading level={4}>{office.city}</Heading>
                  {office.phones.map((phone, i) => (
                    <Paragraph key={i}>
                      <p className="flex items-center gap-[10px]"><MdOutlinePhone /> {phone}</p>
                    </Paragraph>
                  ))}
                  <Paragraph>
                    <p className="mt-2 flex items-center gap-[10px]"><MdOutlineMail />{office.email}</p>
                  </Paragraph>
                  <Paragraph>
                    <p className="mt-1">{office.address}</p>
                  </Paragraph>
                  <div className="flex md:hidden bg-[#0B6D76] flex-row justify-center gap-4 py-3 mt-4 rounded-xl">
                    <FaFacebook className="text-white text-xl" />
                    <FaLinkedin className="text-white text-xl" />
                    <BsInstagram className="text-white text-xl" />
                    <FaWhatsapp className="text-white text-xl" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Container>
  );
};

export default ContactSection;