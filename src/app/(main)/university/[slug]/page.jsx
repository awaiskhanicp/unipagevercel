'use client';

import Link from 'next/link';
import { IoMdCheckmarkCircleOutline } from 'react-icons/io';
import { FaCamera, FaGraduationCap, FaStar } from "react-icons/fa";
import { useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import Button from '../../../../app/components/atoms/Button';
import Container from '../../../../app/components/atoms/Container';
import Heading from '../../../../app/components/atoms/Heading';
import Paragraph from '../../../../app/components/atoms/Paragraph';
import CourseCard from '../../../../app/components/molecules/CourseCard';
import UniversityOverview from '../../../../app/components/organisms/UniversityOverview';
import UniversityPhotos from '../../../../app/components/organisms/UniversityPhotos';
import UniversityCourses from '../../../../app/components/organisms/UniversityCourses';
import UniversityReviews from '../../../../app/components/organisms/UniversityReviews';

const UniversityDetails = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [university, setUniversity] = useState(null);
  const [relatedCourses, setRelatedCourses] = useState([]);
  const [relatedUniversities, setRelatedUniversities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [subject, setsubjects] = useState([]);

  const params = useParams();
  const { slug } = params;

  // Handle admission request
  const handleAdmissionRequest = async (item) => {
    // Check if user is logged in or collect guest information
    let userInfo = null;
    
    // Try to get user info from session/localStorage
    try {
      const session = await fetch('/api/auth/session');
      const sessionData = await session.json();
      
      if (sessionData?.user) {
        userInfo = {
          name: sessionData.user.name || 'Unknown User',
          phone: sessionData.user.phone || 'Not provided',
          email: sessionData.user.email || 'No email'
        };
      }
    } catch (error) {
      console.log('No active session found');
    }

    // If no user info, collect guest information
    if (!userInfo) {
      const { value: formValues } = await Swal.fire({
        title: 'Request University Information',
        html: `
          <div class="text-left">
            <p class="mb-3">Please provide your contact information to receive admission details for:</p>
            <p class="font-bold text-blue-600 mb-4">${item.name || 'This University'}</p>
            
            <div class="mb-3">
              <label class="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
              <input id="swal-input1" class="swal2-input" placeholder="Enter your full name">
            </div>
            
            <div class="mb-3">
              <label class="block text-sm font-medium text-gray-700 mb-1">Email *</label>
              <input id="swal-input2" class="swal2-input" type="email" placeholder="Enter your email">
            </div>
            
            <div class="mb-3">
              <label class="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
              <input id="swal-input3" class="swal-input" placeholder="Enter your phone number">
            </div>
          </div>
        `,
        focusConfirm: false,
        showCancelButton: true,
        confirmButtonText: 'Send Request',
        cancelButtonText: 'Cancel',
        preConfirm: () => {
          const name = document.getElementById('swal-input1').value;
          const email = document.getElementById('swal-input2').value;
          const phone = document.getElementById('swal-input3').value;
          
          if (!name || !email) {
            Swal.showValidationMessage('Name and Email are required');
            return false;
          }
          
          if (!email.includes('@')) {
            Swal.showValidationMessage('Please enter a valid email address');
            return false;
          }
          
          return { name, email, phone: phone || 'Not provided' };
        }
      });

      if (formValues) {
        userInfo = formValues;
      } else {
        return; // User cancelled
      }
    }

    // Check if university has an email address
    if (!item.alternate_email && !item.email) {
      Swal.fire({
        title: 'Email Not Found',
        text: `Sorry, we couldn't find an email address for ${item.name}. Please contact support or try another university.`,
        icon: 'warning',
        confirmButtonText: 'OK',
      });
      return;
    }

    // Extract university information properly with better fallbacks
    const universityName = item.name || 
                          item.university_name || 
                          'University';
    
    const universityEmail = item.alternate_email || 
                           item.email || 
                           'muhammad.bilal0729@gmail.com';

    console.log('🔍 Extracted university info:', {
      name: universityName,
      email: universityEmail,
      item: item
    });

    // Confirm the request with proper university name
    const result = await Swal.fire({
      title: `Send Information Request to ${universityName}?`,
      text: `We'll send your request to: ${universityEmail}`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Yes, Send Request',
      cancelButtonText: 'Cancel',
    });

    if (result.isConfirmed) {
      Swal.fire({
        title: 'Sending request...',
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading(),
      });

      try {
        console.log('📤 Sending request to API with data:', { 
          item: {
            ...item,
            university_email: universityEmail,
            university_name: universityName
          }, 
          userInfo 
        });

        const res = await fetch('/api/internal/request-info', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            item: {
              ...item,
              university_email: universityEmail,
              university_name: universityName
            }, 
            userInfo 
          }),
        });

        console.log('📥 API response status:', res.status);
        const data = await res.json();
        console.log('📥 API response data:', data);

        if (res.status === 401) {
          Swal.fire({
            title: 'Unauthorized',
            text: data.error || 'Please login as a student or consultant to request info.',
            icon: 'warning',
          });
          return;
        }

        if (data.success) {
          Swal.fire({
            title: 'Request Sent Successfully! 🎉',
            text: `Your information request has been sent to ${universityName} at ${universityEmail}. They will contact you within 24-48 hours.`,
            icon: 'success',
            confirmButtonText: 'Great!',
          });
        } else {
          console.error('❌ API returned error:', data.error);
          Swal.fire({
            title: 'Error',
            text: data.error || 'Failed to send request. Please try again.',
            icon: 'error',
          });
        }
      } catch (err) {
        console.error('❌ Network/JS error sending request:', err);
        Swal.fire({
          title: 'Error',
          text: 'Something went wrong while sending the request. Please try again.',
          icon: 'error',
        });
      }
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch university data
        const uniRes = await fetch(`/api/frontend/universitydetails/${slug}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          cache: 'no-store'
        });

        if(!uniRes.ok){

          const data = await uniRes.json();

          throw new Error(data.message || 'Failed to fetch university data')
        }

        const uniData = await uniRes.json();

        setUniversity(uniData.data)

        setRelatedUniversities(uniData.realtedUniversities)

      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [slug]);

  // Tab configuration
  const tabs = [
    { id: 'overview', label: 'Overview', icon: <IoMdCheckmarkCircleOutline /> },
    { id: 'photos', label: 'Photos', icon: <FaCamera /> },
    { id: 'courses', label: 'Courses', icon: <FaGraduationCap /> },
    { id: 'reviews', label: 'Reviews', icon: <FaStar /> }
  ];

  // Render content based on active tab
  const renderContent = () => {
    if (!university) return null;

    switch (activeTab) {
      case 'overview':
        return <UniversityOverview university={university} relatedUniversities={relatedUniversities} />;
      case 'photos':
        return <UniversityPhotos university={university} />;
      case 'courses':
        return (
          <UniversityCourses 
            university={university}
          />
        );
      case 'reviews':
        return <UniversityReviews university={university} />;
      default:
        return <UniversityOverview university={university} relatedUniversities={relatedUniversities} />;
    }
  };

  if (loading) {
    return (
      <Container>
        <div className="text-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#0B6D76] mx-auto"></div>
          <p className="mt-3">Loading university details...</p>
        </div>
      </Container>
    );
  }

  if (error || !university) {
    return (
      <Container>
        <div className="min-h-screen flex flex-col items-center justify-center">
          <h1 className="text-2xl font-bold mb-4">University not found</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <Link href="/">
            <Button>Go Back Home</Button>
          </Link>
        </div>
      </Container>
    );
  }

  const description = `${university.name} ${university.country} offers admission and scholarships ${new Date().getFullYear()} in total ${university.courses_count} courses. Check courses tution fees and these courses are taught in ${university.language} language.`

  const title = `${university.name} Admission,Scholarship & courses Fee ${new Date().getFullYear()}`;

  return (
    <>
      <title>{title}</title>
      <meta name="description" content={description} />
      <div className="min-h-screen">
        {/* Hero Section */}
        <section className="relative md:h-[84vh] sm:h-[100vh] h-[100vh] flex items-center justify-center overflow-hidden">
          <img
            src={university.banner_image || "/assets/detail.png"}
            alt={`${university.name} campus`}
            className="absolute top-0 left-0 w-full h-full object-cover object-top z-0"
          />
          <div className="absolute inset-0 bg-black opacity-50 z-10"></div>
          <div className="absolute inset-0 z-10 bg-gradient-to-b from-[rgba(0,0,0,0.1)] to-[rgba(0,0,0,0.9)]"></div>
          <div className="relative z-20 text-center px-4 max-w-6xl mx-auto pb-12">
            <Heading level={1}>
              <div className="text-white md:pt-[0px] sm:pt-[100px] pt-[100px]">
                {university.name}
              </div>
            </Heading>
            <Paragraph>
            <p className="text-white text-lg mt-4">
                {[university.city, university.country].filter(Boolean).join(', ')}
              </p>
            </Paragraph>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mt-6">
              <div onClick={() => handleAdmissionRequest(university)}>
                <Button 
                  size="lg" 
                  className="bg-white text-[#0B6D76] text-lg px-10 py-4 shadow-xl hover:shadow-2xl hover:bg-gray-100"
                >
                  Request Information
                </Button>
              </div>
              {/* <Link href="/apply-online">
                <Button 
                  size="lg" 
                  className="bg-white text-[#0B6D76] text-lg px-10 py-4 shadow-xl hover:shadow-2xl hover:bg-gray-100"
                >
                  Apply Now
                </Button>
              </Link> */}
              <Link href="/free-consultation">
                <Button 
                  size="lg" 
                  className="bg-white text-[#0B6D76] text-lg px-10 py-4 shadow-xl hover:shadow-2xl hover:bg-gray-100"
                >
                  Free Consultation
                </Button>
              </Link>
            </div>
          </div>
        </section>

        <Container>
          <div className="complete-page-spaceing banner-bottom-space bottom-session-space">
            {/* Tabbed Interface */}
            <div className="">
              {/* Tab Buttons */}
              <div className="grid md:w-[70%] sm:w-[100%] w-[100%] grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-8 mx-auto">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full h-32 flex flex-col items-center justify-center rounded-lg relative transition-all duration-300 p-4 ${
                      activeTab === tab.id 
                        ? 'bg-[#0B6D76] text-white shadow-lg' 
                        : 'bg-[#f0fafa] text-[#0B6D76] hover:bg-[#e0f5f5]'
                    }`}
                  >
                    <div className="text-2xl mb-2">{tab.icon}</div>
                    <span className="text-sm font-medium">{tab.label}</span>
                    {activeTab === tab.id && (
                      <div className="absolute -bottom-2 w-4 h-4 bg-[#0B6D76] rotate-45"></div>
                    )}
                  </button>
                ))}
              </div>

              {/* Tab Content */}
              <div className="w-full">
                {renderContent()}
              </div>
            </div>
          </div>
        </Container>
      </div>
    </>
  );
};

export default UniversityDetails;