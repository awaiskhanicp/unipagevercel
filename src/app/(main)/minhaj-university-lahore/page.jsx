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
import { FaFlag, FaGlobe, FaUser, FaGraduationCap, FaUniversity } from "react-icons/fa";
import { MdOutlineMail, MdOutlinePhoneEnabled, MdSchool } from "react-icons/md";
import { HiOutlineAcademicCap } from "react-icons/hi";
import { LiaDiceSolid } from "react-icons/lia";
import { FcDepartment } from "react-icons/fc";
import { Loader2 } from "lucide-react";
import Swal from 'sweetalert2';
import Image from "next/image";


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
      const res = await fetch("/api/frontend/minhaj-leads", {
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

  const renderError = (field) =>
    errors[field] && <p className="text-red-500 text-sm mt-1">{errors[field]}</p>;

  return (
    <div className="minhaj-university-page">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-r from-[#0B6D76] to-[#0B6D76]">
        <div className="absolute inset-0 z-0 opacity-20">
          <div className="absolute inset-0 pattern-dots pattern-blue-500 pattern-bg-white pattern-size-4 pattern-opacity-20"></div>
        </div>
        
        <Container>
          <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-12 py-20">
            <div className="lg:w-1/2 text-white">
              <div className="mb-6">
                <div className="inline-flex items-center px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm text-sm font-medium mb-6">
                  <span className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></span>
                  Exclusive for Minhaj University Students
                </div>
              </div>
              
              <Heading level={1} className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
                Study Abroad for <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-300 to-cyan-300">FREE</span> with Our Partnership
              </Heading>
              
              <Paragraph className="text-xl opacity-90 mb-10 leading-relaxed">
                Get expert guidance for admissions, scholarships, visas, and IELTS preparation — at no cost to Minhaj University students.
              </Paragraph>
              
              <div className="flex flex-col sm:flex-row gap-4 mt-10">
                <Link href={"#application-form"}>
                  <Button size="lg" className="bg-white text-[#0B6D76] hover:bg-gray-100 text-lg px-8 py-4 font-semibold rounded-xl">
                    Start Your Free Application
                  </Button>
                </Link>
                <Link href={"#services"}>
                  <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10 text-lg px-8 py-4 font-semibold rounded-xl">
                    Explore Services
                  </Button>
                </Link>
              </div>
            </div>
            
            <div className="lg:w-1/2 flex justify-center">
              <div className="relative">
                <div className="absolute -inset-6 bg-gradient-to-r from-[#0B6D76] to-[#0B6D76] rounded-2xl rotate-3 opacity-70"></div>
                                <Image
  src="/assets/minhaj-leads/minhaj-campus.jpg"
  alt="Study Abroad Support Services"
  width={1200} // set your image width
  height={600} // set your image height
  className="relative rounded-2xl shadow-lg w-full object-cover"
/>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Partnership Badge */}
      <section className="py-12 bg-gray-50">
        <Container>
          <div className="text-center max-w-3xl mx-auto mb-10">
            <div className="inline-flex items-center justify-center p-2 bg-[#0B6D76] rounded-full mb-6">
              <FaUniversity className="text-white text-2xl" />
            </div>
            <Heading level={4} className="text-3xl font-bold text-[#0B6D76] mb-4">
              Official Education Abroad Partner
            </Heading>
          </div>
          <div className="text-center max-w-3xl mx-auto mb-10">
            <Paragraph className="text-center max-w-3xl  text-lg text-gray-600">
              UniversitiesPage is proud to be the official study abroad consultant for Minhaj University Lahore, 
              providing exclusive services and support to help students achieve their international education goals.
            </Paragraph>
            </div>
        </Container>
      </section>

      {/* Services Section */}
      <section id="services" className="py-16 bg-white mb-25">
        <Container>
          <div className="text-center mb-25">
            <Heading level={4} className="text-3xl font-bold text-[#0B6D76] mb-4">
              Our Exclusive Services for Minhaj Students
            </Heading>
            <Paragraph className="text-lg text-gray-600 max-w-3xl mx-auto">
              We provide comprehensive support throughout your study abroad journey, completely free of charge.
            </Paragraph>
          </div>
          
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
  {/* Admission Support */}
  <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100 hover:border-[#0B6D76]/20 transition-all duration-300 hover:shadow-lg">
    <div className="w-12 h-12 bg-gradient-to-br from-[#0B6D76] to-[#0B6D76] rounded-xl flex items-center justify-center mb-4">
      <FaUniversity className="text-white text-lg" />
    </div>
    <div className="flex flex-col gap-2">
      <div className="text-xl font-bold text-[#0B6D76]">Admission Support</div>
      <div className="text-sm text-gray-600">Guidance with applications</div>
    </div>
  </div>

  {/* Scholarships */}
  <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100 hover:border-[#0B6D76]/20 transition-all duration-300 hover:shadow-lg">
    <div className="w-12 h-12 bg-gradient-to-br from-[#0B6D76] to-[#0B6D76] rounded-xl flex items-center justify-center mb-4">
      <FaGraduationCap className="text-white text-lg" />
    </div>
    <div className="flex flex-col gap-2">
      <div className="text-xl font-bold text-[#0B6D76]">Scholarships</div>
      <div className="text-sm text-gray-600">Assistance with funding</div>
    </div>
  </div>

  {/* Visa Help */}
  <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100 hover:border-[#0B6D76]/20 transition-all duration-300 hover:shadow-lg">
    <div className="w-12 h-12 bg-gradient-to-br from-[#0B6D76] to-[#0B6D76] rounded-xl flex items-center justify-center mb-4">
      <FaFlag className="text-white text-lg" />
    </div>
    <div className="flex flex-col gap-2">
      <div className="text-xl font-bold text-[#0B6D76]">Visa Help</div>
      <div className="text-sm text-gray-600">Guidance for visa approval</div>
    </div>
  </div>

  {/* IELTS Training */}
  <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100 hover:border-[#0B6D76]/20 transition-all duration-300 hover:shadow-lg">
    <div className="w-12 h-12 bg-gradient-to-br from-[#0B6D76] to-[#0B6D76] rounded-xl flex items-center justify-center mb-4">
      <MdSchool className="text-white text-lg" />
    </div>
    <div className="flex flex-col gap-2">
      <div className="text-xl font-bold text-[#0B6D76]">IELTS Training</div>
      <div className="text-sm text-gray-600">Preparation for language test</div>
    </div>
  </div>
</div>

            </div>
            
            <div>
              <div className="relative">
                <div className="absolute -inset-6 bg-gradient-to-r from-[#0B6D76] to-[#0B6D76] rounded-2xl rotate-3 opacity-10"></div>
                <Image
  src="/assets/minhaj-leads/study-abroad-support.jpg"
  alt="Study Abroad Support Services"
  width={1200} // set your image width
  height={600} // set your image height
  className="relative rounded-2xl shadow-lg w-full object-cover"
/>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Destination Countries */}
      <MinhajCountry />

      <div className="mb-20"></div>

      {/* Success Stories */}
      <StudentSuccess />


      <div className="mb-20"></div>

      {/* Application Form */}
      <section id="application-form" className="py-16 bg-gray-50">
        <Container>
          <div className="text-center mb-12">
            <Heading level={4} className="text-3xl font-bold text-[#0B6D76] mb-4">
              Start Your Study Abroad Journey
            </Heading>
            <Paragraph className="text-lg text-gray-600 max-w-3xl mx-auto">
              Fill out the form below to get personalized guidance for your study abroad plans. 
              Our team will contact you within 24 hours.
            </Paragraph>
          </div>

          <div className="bg-white rounded-2xl shadow-lg overflow-hidden max-w-6xl mx-auto">
            <div className="grid md:grid-cols-2 gap-0">
              <div className="p-8 md:p-12">
                <div className="mb-8">
                  <div className="w-12 h-12 bg-gradient-to-br from-[#0B6D76] to-[#0B6D76] rounded-xl flex items-center justify-center mb-4">
                    <FaUniversity className="text-white text-xl" />
                  </div>
                  <Heading level={3} className="text-2xl font-bold text-[#0B6D76]">
                    Minhaj University Student Application
                  </Heading>
                  <Paragraph className="text-gray-600 mt-2">
                    Exclusive free services for currently enrolled students
                  </Paragraph>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Input 
                        icon={<FaUser className="text-[#0B6D76]" />} 
                        placeholder="Full Name" 
                        value={formData.full_name} 
                        onChange={(e) => handleChange('full_name', e.target.value)} 
                      />
                      {renderError('full_name')}
                    </div>
                    <div>
                      <Input 
                        icon={<LiaDiceSolid className="text-[#0B6D76]" />} 
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
                        icon={<MdOutlineMail className="text-[#0B6D76]" />} 
                        placeholder="Email" 
                        value={formData.email} 
                        onChange={(e) => handleChange('email', e.target.value)} 
                      />
                      {renderError('email')}
                    </div>
                    <div>
                      <Input 
                        icon={<MdOutlinePhoneEnabled className="text-[#0B6D76]" />} 
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
                        icon={<HiOutlineAcademicCap className="text-[#0B6D76]" />} 
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
                        icon={<FaGlobe className="text-[#0B6D76]" />} 
                        placeholder="Select Interested Country"
                        options={['Italy', 'UK', 'France', 'Turkey', 'China', 'Cyprus', 'Others']}
                        value={formData.interested_country} 
                        onChange={(e) => handleChange('interested_country', e.target.value)} 
                      />
                      {renderError('interested_country')}
                    </div>

                    <div>
                      <Input 
                        icon={<FaFlag className="text-[#0B6D76]" />} 
                        placeholder="Your City" 
                        value={formData.city} 
                        onChange={(e) => handleChange('city', e.target.value)} 
                      />
                      {renderError('city')}
                    </div>

                    <div>
                      <Input 
                        icon={<FaUser className="text-[#0B6D76]" />} 
                        placeholder="Apply For (e.g., Study Visa)" 
                        value={formData.apply_for} 
                        onChange={(e) => handleChange('apply_for', e.target.value)} 
                      />
                      {renderError('apply_for')}
                    </div>
                  </div>

                  <div>
                    <Button 
                      type="submit" 
                      disabled={loading} 
                      className="w-full bg-gradient-to-r from-[#0B6D76] to-[#0B6D76] hover:from-[#0B6D76]/90 hover:to-[#0B6D76]/90 text-lg py-4 rounded-xl"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="animate-spin mr-2" size={20} />
                          Processing...
                        </>
                      ) : (
                        "Submit Application (Free)"
                      )}
                    </Button>
                  </div>
                </form>
              </div>
              
              <div className="hidden md:block relative bg-gradient-to-br from-[#0B6D76] to-[#0B6D76]">
                <div className="absolute inset-0 bg-[url('/assets/world-map.svg')] bg-center bg-no-repeat opacity-10"></div>
                <div className="relative h-full flex flex-col justify-center items-center text-center p-12 text-white">
                  <div className="mb-8">
                    <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-6">
                      <FaUniversity className="text-white text-3xl" />
                    </div>
                    <Heading level={3} className="text-2xl font-bold mb-4">
                      Why Choose Our Services?
                    </Heading>
                    <Paragraph className="opacity-80">
                      As Minhaj University&apos;s official partner, we provide exclusive benefits tailored specifically for your needs.
                    </Paragraph>
                  </div>
                  
                  <div className="space-y-4 text-left">
                    <div className="flex items-start">
                      <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center mr-3 mt-1">
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      </div>
                      <span>No application or service fees</span>
                    </div>
                    <div className="flex items-start">
                      <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center mr-3 mt-1">
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      </div>
                      <span>Priority processing for Minhaj students</span>
                    </div>
                    <div className="flex items-start">
                      <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center mr-3 mt-1">
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      </div>
                      <span>Dedicated support team</span>
                    </div>
                    <div className="flex items-start">
                      <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center mr-3 mt-1">
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      </div>
                      <span>Scholarship opportunities exclusive to Minhaj</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-[#0B6D76] to-[#0B6D76] text-white">
        <Container>
          <div className="text-center max-w-3xl mx-auto">
            <Heading level={4} className="text-3xl font-bold mb-6">
              Ready to Begin Your International Education Journey?
            </Heading>
            <div className="m-5"></div>
            <Paragraph className="text-xl opacity-90 mb-10">
              Join thousands of Minhaj University students who have successfully studied abroad with our guidance.
            </Paragraph>
            <div className="m-10"></div>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href={"#application-form"}>
                <Button size="lg" className="bg-white text-[#0B6D76] hover:bg-gray-100 text-lg px-8 py-4 font-semibold rounded-xl">
                  Apply Now
                </Button>
              </Link>
              <Link href={"/contact-us"}>
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10 text-lg px-8 py-4 font-semibold rounded-xl">
                  Contact Our Team
                </Button>
              </Link>
            </div>
          </div>
        </Container>
      </section>
    </div>
  );
}

export default MinhajUniversity;