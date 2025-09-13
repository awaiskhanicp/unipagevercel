'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import Swal from 'sweetalert2';
import Link from 'next/link';
import { IoMdCheckmarkCircleOutline } from 'react-icons/io';
import { FaFacebook, FaTwitter, FaWhatsapp, FaLinkedin } from "react-icons/fa";
import Button from '../../../../app/components/atoms/Button';
import Container from '../../../../app/components/atoms/Container';
import Heading from '../../../../app/components/atoms/Heading';
import CourseCard from '../../../../app/components/molecules/CourseCard';
import CourseDetailForm from '../../../../app/components/organisms/CourseDetailForm';
import { SocialIcons } from '../../../components/molecules/SocialIcons';

const CourseDetails = () => {
  const { slug } = useParams();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [relatedCourses, setRelatedCourses] = useState([]);

  // Function to update all meta tags dynamically
  const updateMetaTags = (courseData) => {
    if (!courseData) return;

    const courseName = courseData.title || courseData.name || 'Course';
    const universityName = courseData.university_name || courseData.university || 'University';
    const location = courseData.location || '';
    const duration = courseData.duration || '';
    const tuitionFees = courseData.tuition_fees || courseData.fees || '';
    const intake = courseData.intake || '';
    const language = courseData.language || 'English';
    const qualification = courseData.qualification || 'Bachelor';
    
    // Create comprehensive description
    const description = `${courseName} ${qualification} course is offered in ${universityName}${location ? ` ${location}` : ''} with the duration of ${duration}${language ? `, taught in ${language}` : ''}. ${tuitionFees ? `The tuition fees are ${tuitionFees} yearly` : ''}${intake ? ` and admission intake is ${intake}` : ''}.`;
    
    const pageTitle = `${courseName} ${qualification} in ${universityName}`;
    const imageUrl = courseData.campusImage || courseData.universityLogo || courseData.image || 'https://www.universitiespage.com/filemanager/photos/1/thumbs/5d98611365165.png';
    const currentUrl = window.location.href;

    // Update document title
    document.title = pageTitle;

    // Function to update or create meta tag
    const updateMetaTag = (property, content, isProperty = false) => {
      const attribute = isProperty ? 'property' : 'name';
      let meta = document.querySelector(`meta[${attribute}="${property}"]`);
      
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute(attribute, property);
        document.head.appendChild(meta);
      }
      meta.setAttribute('content', content);
    };

    // Update basic meta tags
    updateMetaTag('description', description);
    updateMetaTag('keywords', `${courseName}, ${universityName}, ${location}, admission, university course, ${qualification}`);
    
    // Add charset, X-UA-Compatible, and viewport if not present
    if (!document.querySelector('meta[charset="utf-8"]')) {
      const charset = document.createElement('meta');
      charset.setAttribute('charset', 'utf-8');
      document.head.appendChild(charset);
    }
    
    if (!document.querySelector('meta[http-equiv="X-UA-Compatible"]')) {
      const xua = document.createElement('meta');
      xua.setAttribute('http-equiv', 'X-UA-Compatible');
      xua.setAttribute('content', 'IE=edge');
      document.head.appendChild(xua);
    }
    
    if (!document.querySelector('meta[name="viewport"]')) {
      const viewport = document.createElement('meta');
      viewport.setAttribute('name', 'viewport');
      viewport.setAttribute('content', 'width=device-width,minimum-scale=1, initial-scale=1');
      document.head.appendChild(viewport);
    }
    
    // Add CSRF token if not present
    if (!document.querySelector('meta[name="csrf-token"]')) {
      const csrf = document.createElement('meta');
      csrf.setAttribute('name', 'csrf-token');
      csrf.setAttribute('content', 'ZyZfRDJGSXIMVHWKUyaU7xTl5QzwTnLBRJ6A30nC');
      document.head.appendChild(csrf);
    }

    // Update Open Graph tags
    updateMetaTag('og:title', pageTitle, true);
    updateMetaTag('og:description', description, true);
    updateMetaTag('og:image', imageUrl, true);
    updateMetaTag('og:image:secure_url', imageUrl, true);
    updateMetaTag('og:image:type', 'image/png', true);
    updateMetaTag('og:image:width', '400', true);
    updateMetaTag('og:image:height', '300', true);
    updateMetaTag('og:image:alt', `${courseName} at ${universityName}`, true);
    updateMetaTag('og:url', currentUrl, true);
    updateMetaTag('og:type', 'website', true);
    updateMetaTag('og:site_name', 'Universities Page', true);

    // Update Twitter Card tags
    updateMetaTag('twitter:card', 'summary_large_image');
    updateMetaTag('twitter:title', pageTitle);
    updateMetaTag('twitter:description', description);
    updateMetaTag('twitter:image', imageUrl);

    // Update canonical link
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', currentUrl);

    // Add favicon if not present
    if (!document.querySelector('link[rel="icon"][type="image/x-icon"]')) {
      const favicon = document.createElement('link');
      favicon.setAttribute('rel', 'icon');
      favicon.setAttribute('href', 'https://universitiespage.com/public/fav.png');
      favicon.setAttribute('type', 'image/x-icon');
      document.head.appendChild(favicon);
    }

    // Add or update structured data
    let existingScript = document.querySelector('script[type="application/ld+json"][data-course]');
    if (existingScript) {
      existingScript.remove();
    }

    const script = document.createElement('script');
    script.setAttribute('type', 'application/ld+json');
    script.setAttribute('data-course', 'true');
    script.textContent = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "Course",
      "name": courseName,
      "description": description,
      "provider": {
        "@type": "Organization",
        "name": universityName,
        "address": location
      },
      "image": imageUrl,
      "url": currentUrl,
      "courseCode": courseData.course_code || '',
      "educationalLevel": qualification,
      "timeRequired": duration,
      "offers": {
        "@type": "Offer",
        "price": tuitionFees,
        "priceCurrency": "USD"
      }
    });
    document.head.appendChild(script);

    console.log('✅ All meta tags updated for course:', courseName);
  };

  const handleRequestInfo = async (item) => {
    console.log('🔍 handleRequestInfo called with item:', item);
    console.log('🔍 Item keys:', Object.keys(item));
    console.log('🔍 University info:', item?.university_info);
    console.log('🔍 University alternate email:', item?.university_alternate_email);
    console.log('🔍 University name:', item?.university_name);
    console.log('🔍 University:', item?.university);
  

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
                          item.university_info?.name ||
                          'University';

    // Check multiple possible email fields
    const universityEmail = item.university_alternate_email || 
                           item.university_info?.alternate_email ||
                           item.university_email ||
                           item.email;

    console.log('🔍 Email check:', {
      university_alternate_email: item.university_alternate_email,
      university_info_alternate_email: item.university_info?.alternate_email,
      university_email: item.university_email,
      email: item.email,
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
            university_alternate_email: universityEmail
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
      }
    }
  };

  useEffect(() => {
    if (!slug) return;
    const id = Number(slug);
    fetch(`/api/frontend/getcoursedetails/${id}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    })
      .then(res => {
        if (!res.ok) throw new Error('Course not found');
        return res.json();
      })
      .then(data => {
        setCourse(data.data);
        setRelatedCourses(data.relatedcourse || []);
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [slug]);

  // Update meta tags when course data is loaded
  useEffect(() => {
    if (course) {
      updateMetaTags(course);
    }
  }, [course]); // Run when course data changes

  if (loading) {
    return <Container><div className="text-center py-20">Loading...</div></Container>;
  }

  if (error || !course) {
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
      <section className="relative md:h-[75vh] sm:h-[90vh] h-[90vh] flex items-center justify-center overflow-hidden">
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
            <div className="text-white md:pt-[0px] sm:pt-[80px] pt-[80px]">{course.title || course.name}</div>
          </Heading>
          
          {/* Social Media Sharing Section - Same as Articles Page */}

          
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
      <Container>
        <div className="complete-page banner-bottom-space bottom-session-space complete-page-spaceing">
          <div className="main-session flex justify-between items-center gap-6 flex-wrap md:flex-nowrap">
            {/* LEFT SIDE */}
            <div className="image-session bg-[#E7F1F2] w-full md:w-[45%] p-6 rounded-lg relative shadow-md">
              {/* DISCOUNT TAG */}
              {course?.consultation_fee_discount ? (
                <div className="absolute top-3 right-3 bg-teal-700 text-white text-sm font-semibold px-3 py-1 rounded-full">
                  {course?.consultation_fee_discount}% OFF
                </div>
              ) : null}
              {/* LOGO + TEXT */}
              <div className="box-session flex items-center gap-6 mb-6">
                <div className="img ">
                  <img src={course.universityLogo1 && course.universityLogo.trim() !== '' ? course.universityLogo : '/assets/dtb1.png'} alt={course.university || 'university logo'} className="" />
                </div>
                <div className="text">
                  <Heading level={5}>
                    {course.university_name || 'Unknown University'}
                  </Heading>
                  <Heading level={6} className="text-gray-600">{course.location}</Heading>
          <div className="flex gap-[10px] mt-4 justify-center">
            {[
              { Icon: FaFacebook, name: "Facebook", url: (u, t) => `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(u)}` },
              { Icon: FaTwitter, name: "Twitter", url: (u, t) => `https://twitter.com/intent/tweet?url=${encodeURIComponent(u)}&text=${encodeURIComponent(t)}` },
              { Icon: FaWhatsapp, name: "WhatsApp", url: (u, t) => `https://api.whatsapp.com/send?text=${encodeURIComponent(t + " " + u)}` },
            ].map(({ Icon, name, url }, i) => (
              <a
                key={i}
                className="flex items-center text-[14px] gap-[10px] hover:opacity-80 transition-opacity"
                href={url(window.location.href, course.title || course.name)}
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
                </div>
              </div>
              
            </div>
            {/* RIGHT SIDE IMAGE */}
            <div className="">
              <img src={course.campusImage && course.campusImage.trim() !== '' ? course.campusImage : '/assets/visit.png'} alt="campus" className="w-full h-full object-cover" />
            </div>
          </div>
          <div className="">
            <CourseDetailForm course={course} />
          </div>
          
          <div className="">
            <div className=" text-center pb-[20px]"><Heading level={3}>Other Related Courses</Heading></div>
            <div className="grid lg:grid-cols-3 grid-cols-1 md:grid-cols-2 gap-8 px-4 py-8">
              {relatedCourses.slice(0, 3).map((related) => (
                <CourseCard
                  key={related.id}
                  id={related.id}
                  image={related.image}
                  title={related.title || related.name}
                  university={related.university_name}
                  location={related.location}
                />
              ))}
            </div>
            <div className="flex justify-center"><Button>view More Courses</Button></div>
          </div>
        </div>
      </Container>
    </div>
  );
};

export default CourseDetails;