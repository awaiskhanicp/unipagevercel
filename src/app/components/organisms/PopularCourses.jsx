'use client';

import { useEffect, useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import { FaChevronLeft, FaChevronRight, FaPlane } from 'react-icons/fa';
import { IoIosAirplane } from 'react-icons/io';

import CourseCard from '../molecules/CourseCard';
import Button from '../atoms/Button';
import Container from '../atoms/Container';
import Heading from '../atoms/Heading';
import Paragraph from '../atoms/Paragraph';
import Link from 'next/link';

const PopularCourses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Fetch only 3 courses for the home page to improve performance
    fetch('/api/frontend/limitedcourses', { 
      method: "POST",
      cache: 'no-store' })
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch courses');
        return res.json();
      })
      .then(data => {
        console.log('📚 Courses API response:', data);
        console.log('📚 Total courses received:', data.data?.length || 0);
        
        // Since we're already limiting to 3 from API, just take the first 3 popular courses
        const popular = (data.data || []).filter(course => course.popular).slice(0, 3);
        console.log('📚 Popular courses found:', popular.length);
        console.log('📚 Popular courses:', popular.map(c => ({ id: c.id, name: c.name, popular: c.popular })));
        
        // If no popular courses found, take first 3 regular courses as fallback
        let finalCourses = popular;
        if (popular.length === 0) {
          finalCourses = (data.data || []).slice(0, 3);
          console.log('📚 No popular courses found, using first 3 regular courses');
        }
        
        // Ensure we never have more than 3 courses
        finalCourses = finalCourses.slice(0, 3);
        console.log('📚 Final courses to display:', finalCourses.length);
        
        setCourses(finalCourses);
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <section className="relative py-16 overflow-hidden">
      {/* Colored background section with precisely positioned airplane icons */}
      <div className="absolute top-0 left-0 w-full h-64 md:h-[60vh] bg-[#0B6D76] z-0 overflow-hidden">
        {/* Large airplane icon - top left */}
        <img src={"/assets/airo2.png"} className="absolute opacity-60 w-[420px] top-2 left-1/2 -translate-x-1/2 float-y-slow pointer-events-none select-none" alt="airplane deco" />
        <img src={"/assets/airo2.png"} className="absolute opacity-50 w-[340px] top-6 left-5 float-y-slower pointer-events-none select-none" alt="airplane deco" />
        {/* Medium airplane icon - middle right */}
        <FaPlane className="absolute float-y-slow text-white opacity-20 text-5xl top-1/3 right-20 transform rotate-12" />
        
        {/* Small airplane icon - bottom left */}
        <FaPlane className="absolute text-white float-y-slow opacity-15 text-4xl bottom-20 left-1/4 transform -rotate-15" />
      </div>
      
      <Container className="relative z-10">
        {/* Header */}
       <div className="head">
      {/* headings-left */}
      <div className=" relative  flex flex-col mt-12 ">
          <Heading level={3}>
             <span className="text-white"> Popular Courses</span>
          </Heading>
          <div className="relative inline-block">
            <Paragraph className="text-lg md:text-xl font-medium mb-2">
              <span className='text-white'>Experience excellence in education through popular courses at top-tier universities.</span>
            </Paragraph>
          </div>
        </div>

        {/* slider-right */}
        <div className="">
          
        </div>
     </div>
        {/* Courses Slider slightly lower from the green bg top */}
        <div className="relative mt-8 mb-12 pb-8 z-[10]">
          {loading ? (
            <div className="text-center py-10 text-white">Loading...</div>
          ) : error ? (
            <div className="text-center text-red-500 py-10">{error}</div>
          ) : (
            <>
              <Swiper
                modules={[Navigation]}
                spaceBetween={25}
                slidesPerView={3}
                centeredSlides={false}
                navigation={{
                  prevEl: '.course-prev',
                  nextEl: '.course-next',
                }}
                breakpoints={{
                  640: { 
                    slidesPerView: 1.2,
                    centeredSlides: false,
                  },
                  768: { 
                    slidesPerView: 2,
                    spaceBetween: 30,
                  },
                  1024: { 
                    slidesPerView: 3,
                    spaceBetween: 35,
                  },
                }}
              >
                {courses.slice(0, 3).map((course, index) => (
                    <SwiperSlide key={index}>
                      <div className="pb-8 transform hover:-translate-y-3 transition duration-300">
                      <CourseCard
                        image={course.image || '/assets/co1.png'}
                        title={course.name || course.title || 'Course'}
                        university={course.university || ''}
                        location={course.location || ''}
                        type={course.qualification || ''}
                        discount={course.discount || ''}
                        id={course.id}
                        className="shadow-xl rounded-xl overflow-hidden h-full border-2 border-white bg-white"
                      />
                    </div>
                  </SwiperSlide>
                ))}
              </Swiper>
              
              {/* Navigation Buttons - positioned exactly as in reference */}
              <div className="flex justify-center gap-4 mt-6 lg:absolute lg:right-0 lg:-top-34">
                <button className="course-prev bg-white p-3 lg:p-4 rounded-full shadow-lg  text-black hover:scale-105">
                  <FaChevronLeft className="text-lg" />
                </button>
                <button className="course-next bg-white text-black p-3 lg:p-4 rounded-full shadow-lg  hover:scale-105">
                  <FaChevronRight className="text-lg" />
                </button>
              </div>
            </>
          )}
        </div>

        {/* View All Button - centered with perfect styling */}
        <div className="text-center mt-8">
          <Link href={"courses"}>
            <Button className="bg-[#0B6D76] hover:bg-[#095d65] px-8 py-3 text-lg font-semibold text-white border-2 border-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              View All Courses
            </Button>
          </Link>
        </div>
      </Container>
    </section>
  );
};

export default PopularCourses;