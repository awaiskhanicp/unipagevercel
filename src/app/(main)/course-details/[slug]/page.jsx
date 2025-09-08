import Link from 'next/link';
import Button from '../../../../app/components/atoms/Button';
import Container from '../../../../app/components/atoms/Container';
import Heading from '../../../../app/components/atoms/Heading';
import CourseCard from '../../../../app/components/molecules/CourseCard';
import CourseDetailForm from '../../../../app/components/organisms/CourseDetailForm';
import CourseActions, { SocialSharing } from './CourseActions';

// Generate metadata for SEO and Open Graph
export async function generateMetadata({ params }) {
  try {
    const { slug } = params;
    console.log('🔍 Generating metadata for slug:', slug);
    
    const id = Number(slug);
    if (isNaN(id)) {
      console.log('❌ Invalid slug, using fallback metadata');
      return {
        title: 'Course Details - Universities Page',
        description: 'View detailed information about university courses and programs.',
        openGraph: {
          title: 'Course Details - Universities Page',
          description: 'View detailed information about university courses and programs.',
          images: ['https://www.universitiespage.com/filemanager/photos/1/thumbs/5d98611365165.png'],
          url: 'https://universitiespage.com/course-details',
          siteName: 'Universities Page',
          type: 'website',
        },
      };
    }
    
    console.log('🔍 Fetching course data for ID:', id);
    
    // Fetch course data with absolute URL
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
    const apiUrl = `${baseUrl}/api/internal/course/${id}`;
    console.log('🔍 API URL:', apiUrl);
    
    const response = await fetch(apiUrl, {
      cache: 'no-store',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    console.log('🔍 API Response status:', response.status);
    
    if (!response.ok) {
      console.log('❌ API response not ok, using fallback metadata');
      return {
        title: 'Course Details - Universities Page',
        description: 'View detailed information about university courses and programs.',
        openGraph: {
          title: 'Course Details - Universities Page',
          description: 'View detailed information about university courses and programs.',
          images: ['https://www.universitiespage.com/filemanager/photos/1/thumbs/5d98611365165.png'],
          url: `${baseUrl}/course-details/${slug}`,
          siteName: 'Universities Page',
          type: 'website',
        },
      };
    }
    
    const data = await response.json();
    console.log('🔍 API Response data:', data);
    
    const course = data.data;
    
    if (!course) {
      console.log('❌ No course data found, using fallback metadata');
      return {
        title: 'Course Details - Universities Page',
        description: 'View detailed information about university courses and programs.',
        openGraph: {
          title: 'Course Details - Universities Page',
          description: 'View detailed information about university courses and programs.',
          images: ['https://www.universitiespage.com/filemanager/photos/1/thumbs/5d98611365165.png'],
          url: `${baseUrl}/course-details/${slug}`,
          siteName: 'Universities Page',
          type: 'website',
        },
      };
    }
    
    // Extract course information
    const courseName = course.title || course.name || 'Course';
    const universityName = course.university_name || 
                          course.university || 
                          course.university_info?.name ||
                          'University';
    const location = course.location || '';
    const duration = course.duration || '';
    const tuitionFees = course.tuition_fees || course.fees || '';
    const intake = course.intake || '';
    const language = course.language || 'English';
    const qualification = course.qualification || 'Bachelor';
    
    // Create comprehensive description
    const description = `${courseName} ${qualification} course is offered in ${universityName}${location ? ` ${location}` : ''} with the duration of ${duration}${language ? `, taught in ${language}` : ''}. ${tuitionFees ? `The tuition fees are ${tuitionFees} yearly` : ''}${intake ? ` and admission intake is ${intake}` : ''}.`;
    
    const pageTitle = `${courseName} ${qualification} in ${universityName}`;
    const imageUrl = course.campusImage || course.universityLogo || course.image || 'https://www.universitiespage.com/filemanager/photos/1/thumbs/5d98611365165.png';
    const currentUrl = `${baseUrl}/course-details/${slug}`;

    console.log('✅ Generated metadata:', {
      title: pageTitle,
      description: description.substring(0, 100) + '...',
      imageUrl: imageUrl,
      currentUrl: currentUrl
    });

    return {
      title: pageTitle,
      description: description,
      keywords: `${courseName}, ${universityName}, ${location}, admission, university course, ${qualification}`,
      
      // Open Graph tags - these are the most important for social sharing
      openGraph: {
        title: pageTitle,
        description: description,
        url: currentUrl,
        siteName: 'Universities Page',
        images: [
          {
            url: imageUrl,
            width: 400,
            height: 300,
            alt: `${courseName} at ${universityName}`,
            type: 'image/png',
          },
        ],
        locale: 'en_US',
        type: 'website',
      },
      
      // Twitter Card tags
      twitter: {
        card: 'summary_large_image',
        title: pageTitle,
        description: description,
        images: [imageUrl],
        creator: '@universitiespage',
        site: '@universitiespage',
      },
      
      // Additional meta tags
      alternates: {
        canonical: currentUrl,
      },
      
      // Icons
      icons: {
        icon: 'https://universitiespage.com/public/fav.png',
        shortcut: 'https://universitiespage.com/public/fav.png',
        apple: 'https://universitiespage.com/public/fav.png',
      },
      
      // Additional meta tags
      other: {
        'csrf-token': 'ZyZfRDJGSXIMVHWKUyaU7xTl5QzwTnLBRJ6A30nC',
      },
    };
  } catch (error) {
    console.error('❌ Error generating metadata:', error);
    return {
      title: 'Course Details - Universities Page',
      description: 'View detailed information about university courses and programs.',
      openGraph: {
        title: 'Course Details - Universities Page',
        description: 'View detailed information about university courses and programs.',
        images: ['https://www.universitiespage.com/filemanager/photos/1/thumbs/5d98611365165.png'],
        url: 'https://universitiespage.com/course-details',
        siteName: 'Universities Page',
        type: 'website',
      },
    };
  }
}

// Server-side data fetching
async function getCourseData(slug) {
  try {
    const id = Number(slug);
    const response = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/internal/course/${id}`, {
      cache: 'no-store'
    });
    
    if (!response.ok) {
      return null;
    }
    
    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error('Error fetching course data:', error);
    return null;
  }
}

async function getRelatedCourses() {
  try {
    const response = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/internal/course?page=1&limit=3`, {
      cache: 'no-store'
    });
    
    if (!response.ok) {
      return [];
    }
    
    const data = await response.json();
    return data.data || [];
  } catch (error) {
    console.error('Error fetching related courses:', error);
    return [];
  }
}

export default async function CourseDetails({ params }) {
  const { slug } = params;
  
  console.log('🚀 CourseDetails component rendering for slug:', slug);
  
  // Fetch data server-side
  const [course, relatedCourses] = await Promise.all([
    getCourseData(slug),
    getRelatedCourses()
  ]);
  
  console.log('📊 Fetched data:', { course: !!course, relatedCourses: relatedCourses?.length || 0 });
  
  // Use default/fallback data if course is not found
  const defaultCourse = {
    title: 'Course Information',
    name: 'Course Information',
    university_name: 'University',
    university: 'University',
    university_info: { name: 'University' },
    location: 'Location not specified',
    duration: 'Duration not specified',
    qualification: 'Program',
    tuition_fees: 'Fees not specified',
    fees: 'Fees not specified',
    intake: 'Intake not specified',
    language: 'English',
    campusImage: '/assets/visit.png',
    universityLogo: '/assets/dtb1.png',
    image: '/assets/visit.png'
  };
  
  // Use course data if available, otherwise use defaults
  const courseData = course || defaultCourse;
  const relatedCoursesData = relatedCourses || [];
  
  // Extract course information with fallbacks
  const courseName = courseData.title || courseData.name || 'Course';
  const universityName = courseData.university_name || 
                        courseData.university || 
                        courseData.university_info?.name ||
                        'University';
  const location = courseData.location || 'Location not specified';
  const duration = courseData.duration || 'Duration not specified';
  const tuitionFees = courseData.tuition_fees || courseData.fees || 'Fees not specified';
  const intake = courseData.intake || 'Intake not specified';
  const language = courseData.language || 'English';
  const qualification = courseData.qualification || 'Program';
  
  // Create comprehensive description with fallbacks
  const description = course ? 
    `${courseName} ${qualification} course is offered in ${universityName}${location ? ` ${location}` : ''} with the duration of ${duration}${language ? `, taught in ${language}` : ''}. ${tuitionFees ? `The tuition fees are ${tuitionFees} yearly` : ''}${intake ? ` and admission intake is ${intake}` : ''}.` :
    `Course information for ${courseName} at ${universityName}. Please contact us for more details about this program.`;
  
  const pageTitle = course ? 
    `${courseName} ${qualification} in ${universityName}` :
    `Course Information - ${universityName}`;
    
  const imageUrl = courseData.campusImage || courseData.universityLogo || courseData.image || 'https://www.universitiespage.com/filemanager/photos/1/thumbs/5d98611365165.png';
  const currentUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/course-details/${slug}`;

  console.log('🎯 Final data:', { pageTitle, imageUrl, currentUrl });

  return (
    <>
      {/* Structured Data for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
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
          })
        }}
      />
      
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
              <div className="text-white md:pt-[0px] sm:pt-[80px] pt-[80px]">
                {course ? (courseData.title || courseData.name) : 'Course Information'}
              </div>
            </Heading>
            
            {/* Show message if course not found */}
            {!course && (
              <div className="text-white text-lg mb-6 bg-yellow-600 bg-opacity-80 px-6 py-3 rounded-lg inline-block">
                ⚠️ Course details are being updated. Please contact us for current information.
              </div>
            )}
            
            {/* Client-side interactive buttons */}
            <CourseActions course={courseData} currentUrl={currentUrl} />
          </div>
        </section>
        
        <Container>
          <div className="complete-page banner-bottom-space bottom-session-space complete-page-spaceing">
            <div className="main-session flex justify-between items-center gap-6 flex-wrap md:flex-nowrap">
              {/* LEFT SIDE */}
              <div className="image-session bg-[#E7F1F2] w-full md:w-[45%] p-6 rounded-lg relative shadow-md">
                {/* DISCOUNT TAG */}
                {courseData?.country_info?.consultation_fee_discount ? (
                  <div className="absolute top-3 right-3 bg-teal-700 text-white text-sm font-semibold px-3 py-1 rounded-full">
                    {courseData.country_info.consultation_fee_discount}% OFF
                  </div>
                ) : null}
                
                {/* LOGO + TEXT */}
                <div className="box-session flex items-center gap-6 mb-6">
                  <div className="img">
                    <img 
                      src={courseData.universityLogo && courseData.universityLogo.trim() !== '' ? courseData.universityLogo : '/assets/dtb1.png'} 
                      alt={courseData.university || 'university logo'} 
                      className="" 
                    />
                  </div>
                  <div className="text">
                    <Heading level={5}>
                      {courseData.university_info?.name || 'University Information'}
                    </Heading>
                    <Heading level={6} className="text-gray-600">{courseData.location}</Heading>
                    
                    {/* Client-side social sharing */}
                    <SocialSharing course={courseData} currentUrl={currentUrl} />
                  </div>
                </div>
              </div>
              
              {/* RIGHT SIDE IMAGE */}
              <div className="">
                <img 
                  src={courseData.campusImage && courseData.campusImage.trim() !== '' ? courseData.campusImage : '/assets/visit.png'} 
                  alt="campus" 
                  className="w-full h-full object-cover" 
                />
              </div>
            </div>
            
            <div className="">
              <CourseDetailForm course={courseData} />
            </div>
            
            <div className="">
              <div className="text-center pb-[20px]">
                <Heading level={3}>Other Related Courses</Heading>
              </div>
              
              {/* Show related courses if available, otherwise show message */}
              {relatedCoursesData.length > 0 ? (
                <>
                  <div className="grid lg:grid-cols-3 grid-cols-1 md:grid-cols-2 gap-8 px-4 py-8">
                    {relatedCoursesData.slice(0, 3).map((related) => (
                      <CourseCard
                        key={related.id}
                        id={related.id}
                        image={related.image}
                        title={related.title || related.name}
                        university={related.university}
                        location={related.location}
                        type={related.qualification}
                        discount={related.discount}
                      />
                    ))}
                  </div>
                  <div className="flex justify-center">
                    <Link href="/courses">
                      <Button>View More Courses</Button>
                    </Link>
                  </div>
                </>
              ) : (
                <div className="text-center py-8">
                  <div className="bg-gray-100 rounded-lg p-8">
                    <h3 className="text-lg font-semibold text-gray-700 mb-2">No Related Courses Available</h3>
                    <p className="text-gray-600 mb-4">We're currently updating our course database.</p>
                    <Link href="/courses">
                      <Button>Browse All Courses</Button>
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        </Container>
      </div>
    </>
  );
} 