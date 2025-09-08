'use client';

import { useSearchParams } from 'next/navigation';
import Container from '../../components/atoms/Container';
import Image from 'next/image';
import Button from '../../components/atoms/Button';
import Link from 'next/link';
import Heading from '../../components/atoms/Heading';
import CourseDetailForm from '../../components/organisms/CourseDetailForm';
import { Suspense, useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import { FaFacebook, FaTwitter, FaLinkedin, FaWhatsapp } from 'react-icons/fa';

const CourseDetailsInner = () => {
  const searchParams = useSearchParams();
  const title = searchParams.get('title');
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch course data from API
  useEffect(() => {
    if (!title) return;
    
    const fetchCourse = async () => {
      try {
        // First try to find by title in the courses list
        const res = await fetch('/api/internal/course');
        if (res.ok) {
          const data = await res.json();
          const foundCourse = data.data.find(c => c.name === title || c.title === title);
          if (foundCourse) {
            setCourse(foundCourse);
          } else {
            setError('Course not found');
          }
        } else {
          setError('Failed to fetch course data');
        }
      } catch (err) {
        setError('Error fetching course data');
      } finally {
        setLoading(false);
      }
    };

    fetchCourse();
  }, [title]);

  // Handle admission request
  const handleRequestInfo = async (item) => {
    console.log(item, "fix this item universty");

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
        title: 'Request Course Information',
        html: `
          <div class="text-left">
            <p class="mb-3">Please provide your contact information to receive admission details for:</p>
            <p class="font-bold text-blue-600 mb-4">${item.title || item.name || 'This Course'}</p>
            
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
              <input id="swal-input3" class="swal2-input" placeholder="Enter your phone number">
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

    // Extract course information properly with better fallbacks
    const courseName = item.title || 
                      item.name || 
                      'Course';
    
    const universityName = item.university_name || 
                          item.university || 
                          'University';

    // Check if we have university email information
    if (!item.university_alternate_email) {
      Swal.fire({
        title: 'University Email Not Found',
        text: `Sorry, we couldn't find an email address for ${universityName}. Please contact support or try another course.`,
        icon: 'warning',
        confirmButtonText: 'OK',
      });
      return;
    }

    console.log('🔍 Extracted course info:', { 
      name: courseName, 
      university: universityName, 
      university_email: item.university_alternate_email,
      item: item 
    });

    const result = await Swal.fire({
      title: `Send Course Information Request?`,
      text: `We'll send your request for: ${courseName} at ${universityName}`,
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
            course_name: courseName,
            university_name: universityName,
            university_alternate_email: item.university_alternate_email
          }, 
          userInfo 
        });

        const res = await fetch('/api/internal/request-info', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            item: {
              ...item,
              course_name: courseName,
              university_name: universityName,
              university_alternate_email: item.university_alternate_email
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
            text: `Your course information request has been sent. The university will contact you within 24-48 hours.`,
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

  if (loading) {
    return (
      <Container>
        <div className="min-h-screen flex flex-col items-center justify-center">
          <h1 className="text-2xl font-bold mb-4">Loading course details...</h1>
          <p>Please wait while we fetch the course information.</p>
        </div>
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <div className="min-h-screen flex flex-col items-center justify-center">
          <h1 className="text-2xl font-bold mb-4">Error: {error}</h1>
          <Link href="/"><Button>Go Back Home</Button></Link>
        </div>
      </Container>
    );
  }

  if (!course) {
    return (
      <Container>
        <div className="min-h-screen flex flex-col items-center justify-center">
          <h1 className="text-2xl font-bold mb-4">Course not found</h1>
          <Link href="/"><Button>Go Back Home</Button></Link>
        </div>
      </Container>
    );
  }

  return (
    <div className="min-h-screen">
      <section className="relative md:h-[84vh] sm:h-[70vh] h-[70vh] flex items-end justify-center overflow-hidden">
      {/* Background Image */}
      <img
        src="/assets/detail.png"
        alt="Hero Background"
        className="absolute top-0 left-0 w-full h-full object-center bg-cover object-top z-0"
      />
      {/* Overlay */}
      <div className="absolute inset-0 bg-black opacity-50 z-10"></div>

      {/* Gradient Overlay */}
      <div className="absolute inset-0 z-10 bg-gradient-to-b from-[rgba(0,0,0,0.1)] to-[rgba(0,0,0,0.9)]"></div>
      {/* Content */}
      <div className="relative z-20 text-center px-4 max-w-6xl mx-auto pb-12">
        <Heading level={1}>
          <div className="text-white">{course.title}</div>
        </Heading>
      
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-[fadeIn_1s_ease-in_0.4s] mt-6">
        <div onClick={() => handleRequestInfo(course)}>
               <Button size="lg" className=" text-white text-lg px-10 py-4 shadow-xl hover:shadow-2xl">
                Admission Request
              </Button>
          </div>   
            <Link href={"/freeconsulation"}>
              <Button size="lg" className=" text-white text-lg px-10 py-4 shadow-xl hover:shadow-2xl">
                Free Consultation
              </Button>
            </Link>
          </div>
      </div>
    </section>
    <CourseDetailForm/>
      <Container>
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="relative h-[400px] w-full">
            <Image
              src={course.image}
              alt={course.title}
              fill
              className="object-cover"
            />
          </div>
          
          <div className="p-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-4">{course.title}</h1>
            
            {/* Social Media Sharing Section - Fixed to Prevent Redirects */}
            <div className="flex gap-[10px] mt-4 mb-6">
              {[
                { 
                  Icon: FaFacebook, 
                  name: "Facebook", 
                  url: (u, t) => `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(u)}&quote=${encodeURIComponent(t)}&redirect_uri=${encodeURIComponent(u)}`
                },
                { 
                  Icon: FaTwitter, 
                  name: "Twitter", 
                  url: (u, t) => `https://twitter.com/intent/tweet?url=${encodeURIComponent(u)}&text=${encodeURIComponent(t)}`
                },
                { 
                  Icon: FaLinkedin, 
                  name: "LinkedIn", 
                  url: (u, t) => `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(u)}&title=${encodeURIComponent(t)}`
                },
                { 
                  Icon: FaWhatsapp, 
                  name: "WhatsApp", 
                  url: (u, t) => `https://wa.me/?text=${encodeURIComponent(t + " - " + u)}`
                },
              ].map(({ Icon, name, url }, i) => (
                <a
                  key={i}
                  className="flex items-center text-[14px] gap-[10px] hover:opacity-80 transition-opacity"
                  href={url(window.location.href, course.title)}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Share on ${name}`}
                  onClick={(e) => {
                    e.preventDefault();
                    const shareUrl = url(window.location.href, course.title);
                    console.log(`Sharing on ${name}:`, shareUrl);
                    console.log('Current URL:', window.location.href);
                    console.log('Course Title:', course.title);
                    
                    // For Facebook, try a different approach to prevent redirects
                    if (name === "Facebook") {
                      // Use window.open with specific parameters to prevent redirects
                      const fbUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}&quote=${encodeURIComponent(course.title)}`;
                      const popup = window.open(fbUrl, 'facebook-share', 'width=600,height=400,scrollbars=yes,resizable=yes');
                      if (popup) {
                        popup.focus();
                      }
                    } else {
                      // For other platforms, use normal popup
                      window.open(shareUrl, '_blank', 'width=600,height=400');
                    }
                  }}
                >
                  <div className="bg-[#006666] w-[40px] h-[40px] rounded-full flex justify-center items-center text-white text-[16px]">
                    <Icon />
                  </div>
                </a>
              ))}
            </div>
            
            {/* Debug: Show the exact URLs being generated */}
            <div className="mb-4 p-3 bg-gray-100 rounded text-xs">
              <p><strong>Debug Info:</strong></p>
              <p>Current URL: {typeof window !== 'undefined' ? window.location.href : 'Loading...'}</p>
              <p>Course Title: {course.title}</p>
              <p>Facebook Share URL: {typeof window !== 'undefined' ? `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}&quote=${encodeURIComponent(course.title)}&redirect_uri=${encodeURIComponent(window.location.href)}` : 'Loading...'}</p>
              <p>Facebook Feed URL: {typeof window !== 'undefined' ? `https://www.facebook.com/dialog/feed?app_id=123456789&link=${encodeURIComponent(window.location.href)}&name=${encodeURIComponent(course.title)}&description=${encodeURIComponent('Check out this course!')}&redirect_uri=${encodeURIComponent(window.location.href)}` : 'Loading...'}</p>
              <p>Twitter Share URL: {typeof window !== 'undefined' ? `https://twitter.com/intent/tweet?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(course.title)}` : 'Loading...'}</p>
              
              <p className="mt-2 text-red-600"><strong>Note:</strong> If Facebook still redirects to Universities Page, try the "Test Facebook Feed Dialog" button below.</p>
              
              {/* Test Buttons */}
              <div className="mt-3 flex gap-2">
                <button 
                  onClick={() => {
                    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}&quote=${encodeURIComponent(course.title)}`;
                    window.open(facebookUrl, '_blank', 'width=600,height=400');
                  }}
                  className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700"
                >
                  Test Facebook Share
                </button>
                <button 
                  onClick={() => {
                    const twitterUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(course.title)}`;
                    window.open(twitterUrl, '_blank', 'width=600,height=400');
                  }}
                  className="px-3 py-1 bg-sky-500 text-white text-xs rounded hover:bg-sky-600"
                >
                  Test Twitter Share
                </button>
                <button 
                  onClick={() => {
                    // Test with a simple external URL to see if sharing works at all
                    const testUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent('https://google.com')}`;
                    window.open(testUrl, '_blank', 'width=600,height=400');
                  }}
                  className="px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700"
                >
                  Test with Google URL
                </button>
                <button 
                  onClick={() => {
                    // Test Facebook sharing with alternative method
                    const fbUrl = `https://www.facebook.com/dialog/feed?app_id=123456789&link=${encodeURIComponent(window.location.href)}&name=${encodeURIComponent(course.title)}&description=${encodeURIComponent('Check out this course!')}&redirect_uri=${encodeURIComponent(window.location.href)}`;
                    console.log('Alternative Facebook URL:', fbUrl);
                    const popup = window.open(fbUrl, 'facebook-feed', 'width=600,height=400,scrollbars=yes,resizable=yes');
                    if (popup) {
                      popup.focus();
                    }
                  }}
                  className="px-3 py-1 bg-purple-600 text-white text-xs rounded hover:bg-purple-700"
                >
                  Test Facebook Feed Dialog
                </button>
              </div>
            </div>
            
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h2 className="text-xl font-semibold text-gray-700 mb-4">Course Details</h2>
                <div className="space-y-3">
                  <p className="text-gray-600"><span className="font-medium">University:</span> {course.university}</p>
                  <p className="text-gray-600"><span className="font-medium">Location:</span> {course.location}</p>
                  <p className="text-gray-600"><span className="font-medium">Type:</span> {course.type}</p>
                  {course.duration && (
                    <p className="text-gray-600"><span className="font-medium">Duration:</span> {course.duration}</p>
                  )}
                  {course.discount && (
                    <p className="text-green-600 font-semibold">Discount: {course.discount}% OFF</p>
                  )}
                </div>
              </div>
              
              <div>
                <h2 className="text-xl font-semibold text-gray-700 mb-4">Apply Now</h2>
                <p className="text-gray-600 mb-6">
                  Ready to start your journey? Apply now for this course and take the first step towards your future.
                </p>
                <Link href="/apply-online">
                  <Button>Apply for this Course</Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
};

const CourseDetails = () => (
  <Suspense>
    <CourseDetailsInner />
  </Suspense>
);

export default CourseDetails; 