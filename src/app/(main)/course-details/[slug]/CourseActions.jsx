'use client';

import { useState } from 'react';
import Link from 'next/link';
import Swal from 'sweetalert2';
import Button from '../../../../app/components/atoms/Button';
import { FaFacebook, FaTwitter, FaWhatsapp } from "react-icons/fa";

export default function CourseActions({ course, currentUrl }) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleRequestInfo = async () => {
    console.log('🔍 handleRequestInfo called with course:', course);
    console.log('🔍 Course keys:', Object.keys(course));
    console.log('🔍 University info:', course?.university_info);
    console.log('🔍 University alternate email:', course?.university_alternate_email);
    console.log('🔍 University name:', course?.university_name);
    console.log('🔍 University:', course?.university);

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
            <p class="font-bold text-blue-600 mb-4">${course.title || course.name || 'This Course'}</p>
            
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
    const courseName = course.title || 
                      course.name || 
                      'Course';
    
    const universityName = course.university_name || 
                          course.university || 
                          course.university_info?.name ||
                          'University';

    // Check multiple possible email fields
    const universityEmail = course.university_alternate_email || 
                           course.university_info?.alternate_email ||
                           course.university_email ||
                           course.email;

    console.log('🔍 Email check:', {
      university_alternate_email: course.university_alternate_email,
      university_info_alternate_email: course.university_info?.alternate_email,
      university_email: course.university_email,
      email: course.email,
      final_email: universityEmail
    });

    // Check if we have university email information
    if (!universityEmail) {
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
      university_email: universityEmail,
      course: course 
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
      setIsSubmitting(true);
      Swal.fire({
        title: 'Sending request...',
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading(),
      });

      try {
        console.log('📤 Sending request to API with data:', { 
          course: {
            ...course,
            course_name: courseName,
            university_name: universityName,
            university_alternate_email: universityEmail
          }, 
          userInfo 
        });

        const res = await fetch('/api/internal/request-info', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            course: {
              ...course,
              course_name: courseName,
              university_name: universityName,
              university_alternate_email: universityEmail
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
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-[fadeIn_1s_ease-in_0.4s] mt-6">
      <div onClick={handleRequestInfo}>
        <Button 
          size="lg" 
          className="text-white text-lg px-10 py-4 shadow-xl hover:shadow-2xl"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Sending...' : 'Admission Request'}
        </Button>
      </div>
      <Link href="/freeconsulation">
        <Button size="lg" className="text-white text-lg px-10 py-4 shadow-xl hover:shadow-2xl">
          Free Consultation
        </Button>
      </Link>
    </div>
  );
}

export function SocialSharing({ course, currentUrl }) {
  return (
    <div className="flex gap-[10px] mt-4 justify-center">
      {[
        { 
          Icon: FaFacebook, 
          name: "Facebook", 
          url: (u, t) => `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(u)}` 
        },
        { 
          Icon: FaTwitter, 
          name: "Twitter", 
          url: (u, t) => `https://twitter.com/intent/tweet?url=${encodeURIComponent(u)}&text=${encodeURIComponent(t)}` 
        },
        { 
          Icon: FaWhatsapp, 
          name: "WhatsApp", 
          url: (u, t) => `https://api.whatsapp.com/send?text=${encodeURIComponent(t + " " + u)}` 
        },
      ].map(({ Icon, name, url }, i) => (
        <a
          key={i}
          className="flex items-center text-[14px] gap-[10px] hover:opacity-80 transition-opacity"
          href={url(currentUrl, course.title || course.name)}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Share on ${name}`}
        >
          <div className="bg-[var(--brand-color)] w-[40px] h-[40px] rounded-full flex justify-center items-center text-white text-[16px]">
            <Icon />
          </div>
        </a>
      ))}
    </div>
  );
}
