'use client';

import { useState } from "react";
import Container from "../../components/atoms/Container";
import Heading from "../../components/atoms/Heading";
import Paragraph from "../../components/atoms/Paragraph";
import Link from "next/link";
import Button from "../../components/atoms/Button";
import StudentSuccess from "../../components/organisms/StudentSuccess";
import MinhajCountry from "../../components/molecules/MInhajCountry";
import Input from '../../components/atoms/Input';
import Select from '../../components/atoms/Select';
import { FaFlag, FaGlobe, FaUser } from "react-icons/fa";
import { MdOutlineMail, MdOutlinePhoneEnabled } from "react-icons/md";
import { HiOutlineAcademicCap } from "react-icons/hi";
import { LiaDiceSolid } from "react-icons/lia";
import { FcDepartment } from "react-icons/fc";
import { Loader2 } from "lucide-react";
import Swal from 'sweetalert2';

function MinhajUniversity() {
  const [formData, setFormData] = useState({
    full_name: '',
    roll_number: '',
    department: '',
    email: '',
    last_education: '',
    country: '',
    city: '',
    interested_country: '',
    apply_for: '',
    whatsapp_number: '',
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: '' }));
  };

  const validateForm = () => {
    const requiredFields = [
      'full_name',
      'roll_number',
      'department',
      'email',
      'whatsapp_number',
      'last_education',
      'city',
      'interested_country',
      'apply_for',
    ];
  
    const newErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
    // Clean phone: remove spaces, dashes, parentheses
    const rawPhone = formData.whatsapp_number.trim();
    const cleanedPhone = rawPhone.replace(/[()\s-]/g, '');
  
    // Allow numbers that start with '+' followed by 7 to 16 digits
    const phoneRegex = /^\+?[0-9]{7,16}$/;
  
    requiredFields.forEach((field) => {
      if (!formData[field]?.trim()) {
        newErrors[field] = 'This field is required';
      }
    });
  
    if (formData.email && !emailRegex.test(formData.email)) {
      newErrors.email = 'Enter a valid email';
    }
  
    if (formData.whatsapp_number && !phoneRegex.test(cleanedPhone)) {
      newErrors.whatsapp_number =
        'Enter a valid international phone number starting with + and 7–16 digits';
    }
  
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);
    try {
      const res = await fetch("/api/internal/minhaj-leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error("Submission failed");

      await res.json();
      Swal.fire({
        icon: 'success',
        title: 'Form submitted successfully!',
        confirmButtonColor: '#0B6D76',
      });

      setFormData({
        full_name: '',
        roll_number: '',
        department: '',
        email: '',
        last_education: '',
        country: '',
        city: '',
        interested_country: '',
        apply_for: '',
        whatsapp_number: '',
      });
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Something went wrong!',
        text: 'Please try again later.',
        confirmButtonColor: '#0B6D76',
      });
    } finally {
      setLoading(false);
    }
  };

  const stats = [
    { id: 1, number: "Admission Support", label: "Guidance with applications" },
    { id: 2, number: "Scholarships", label: "Assistance with funding" },
    { id: 3, number: "Visa Help", label: "Guidance for visa approval" },
    { id: 4, number: "IELTS Training", label: "Preparation for language test" },
  ];

  const renderError = (field) =>
    errors[field] && <p className="text-red-500 text-sm mt-1">{errors[field]}</p>;

  return (
    <div>
      {/* Hero Section */}
      <div className="mihaj">
        <section className="relative md:h-[84vh] sm:h-[100vh] h-[100vh] flex items-center justify-center overflow-hidden">
          <img src="/assets/minhaj.png" alt="Hero Background" className="absolute top-0 left-0 w-full h-full object-cover z-0" />
          <div className="absolute inset-0 bg-black opacity-50 z-10"></div>
          <div className="absolute inset-0 z-10 bg-gradient-to-b from-[rgba(0,0,0,0.1)] to-[rgba(0,0,0,0.9)]"></div>
          <div className="relative z-20 text-center px-4 max-w-4xl mx-auto pb-12">
            <Heading level={1}>
              <div className="text-white md:leading-[92px] mb-[10px] sm:pt-[200px] pt-[200px] md:pt-[0px]  leading-[34px]">
                Minhaj University Students – Study Abroad for FREE
              </div>
            </Heading>
            <Paragraph>
              <p className="text-white w-[65%] mx-auto leading-relaxed">
                Get expert help for admissions, scholarships, visas, and IELTS prep — at no cost to Minhaj students.
              </p>
            </Paragraph>
            <div className="flex flex-col sm:flex-row gap-4 justify-center md:pb-[0px] sm:pb-[100px] pb-[100px] items-center mt-6">
              <Link href={"/free-consultation"}>
                <Button size="lg" className="text-white text-lg px-10 py-4 shadow-xl hover:shadow-2xl">
                  Start Your Free Application
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </div>

      {/* Services Section */}
      <Container>
        <div className="bg-white py-16">
          <div className="flex flex-col lg:flex-row items-center gap-[80px]">
            <div><img className="w-[100%]" src="/assets/visit.png" alt="" /></div>
            <div className="xl:w-[30%]">
              <div className="grid xl:grid-cols-2 gap-6">
                {stats.map((stat) => (
                  <div key={stat.id} className="bg-gray-100 flex flex-col items-center rounded-lg p-6 text-center">
                    <div className="w-8 h-8 bg-[var(--brand-color)] rounded-full flex items-center justify-center text-white text-sm font-semibold">
                      {stat.id}
                    </div>
                    <div className="flex flex-col gap-[10px]">
                      <div className="text-2xl font-bold text-gray-800">{stat.number}</div>
                      <div className="text-sm text-gray-600">{stat.label}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </Container>

      <MinhajCountry />
      <Container>
        <StudentSuccess />

        {/* Form Section */}
        <div className="main md:py-12 sm:py-2 py-2">
          <div className="text-bottom-space pt-[50px] max-w-[900px] mx-auto text-center">
            <Heading level={3}>
              Apply Now to Study Abroad via Minhaj <span className="text-[#0B6D76]">University Lahore</span>
            </Heading>
          </div>

          <form onSubmit={handleSubmit} className="applyMinhaj grid md:grid-cols-2 gap-[70px] items-center">
  <div className="">
    <div className="grid gap-4">
      <div className="grid xl:grid-cols-2 gap-4">
        <div>
          <Input 
            icon={<FaUser />} 
            placeholder="Full Name" 
            value={formData.full_name} 
            onChange={(e) => handleChange('full_name', e.target.value)} 
          />
          {renderError('full_name')}
        </div>
        <div>
          <Input 
            icon={<LiaDiceSolid />} 
            placeholder="University Roll Number" 
            value={formData.roll_number} 
            onChange={(e) => handleChange('roll_number', e.target.value)} 
          />
          {renderError('roll_number')}
        </div>
        <div>
          <Input 
            icon={<FcDepartment />} 
            placeholder="Department" 
            value={formData.department} 
            onChange={(e) => handleChange('department', e.target.value)} 
          />
          {renderError('department')}
        </div>
        <div>
          <Input 
            icon={<MdOutlineMail />} 
            placeholder="Email" 
            value={formData.email} 
            onChange={(e) => handleChange('email', e.target.value)} 
          />
          {renderError('email')}
        </div>
        <div>
          <Input 
            icon={<MdOutlinePhoneEnabled />} 
            placeholder="WhatsApp Number" 
            value={formData.whatsapp_number} 
            onChange={(e) => handleChange('whatsapp_number', e.target.value)} 
          />
          {renderError('whatsapp_number')}
        </div>

        {/* Last Education dropdown */}
        <div>
          <Select 
            name="last_education"
            icon={<HiOutlineAcademicCap />} 
            placeholder="Select Last Education" 
            options={['Matric', 'Intermediate', 'Bachelor', 'Master']}
            value={formData.last_education} 
            onChange={(e) => handleChange('last_education', e.target.value)} 
          />
          {renderError('last_education')}
        </div>

        {/* Interested Country dropdown */}
        <div>
          <Select 
            name="interested_country"
            icon={<FaGlobe />} 
            placeholder="Select Interested Country"
            options={['Italy', 'UK', 'France', 'Turkey', 'China', 'Cyprus', 'Others']}
            value={formData.interested_country} 
            onChange={(e) => handleChange('interested_country', e.target.value)} 
          />
          {renderError('interested_country')}
        </div>

        <div>
          <Input 
            icon={<FaFlag />} 
            placeholder="Your City" 
            value={formData.city} 
            onChange={(e) => handleChange('city', e.target.value)} 
          />
          {renderError('city')}
        </div>

        <div>
          <Input 
            icon={<FaUser />} 
            placeholder="Apply For (e.g., Study Visa)" 
            value={formData.apply_for} 
            onChange={(e) => handleChange('apply_for', e.target.value)} 
          />
          {renderError('apply_for')}
        </div>
      </div>

      <div>
        <Button type="submit" disabled={loading} className="flex items-center gap-2">
          {loading && <Loader2 className="animate-spin" size={18} />}
          {loading ? "Submitting..." : "Get Started Now (Free)"}
        </Button>
      </div>
    </div>
  </div>

  {/* Image Side */}
  <div className="relative rounded-3xl overflow-visible shadow-lg">
    <div className="absolute left-[-5%] top-1/2 -translate-y-1/2 h-[80%] w-[30px] bg-[var(--brand-color)] rounded-bl-3xl rounded-tl-3xl z-10"></div>
    <img
      src="/assets/comp.png"
      alt="Free Consultation"
      className="w-full h-[549px] rounded-[24px] object-cover hidden md:block"
    />
  </div>
</form>

        </div>
      </Container>
    </div>
  );
}

export default MinhajUniversity;