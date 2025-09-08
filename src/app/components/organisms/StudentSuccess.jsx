'use client';

import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';

import Image from 'next/image';
import Heading from '../atoms/Heading';
import Paragraph from '../atoms/Paragraph';
import { studentSuccessData } from '../../../app/utils/studentSuccess';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';

const StudentSuccess = () => {
  return (
    <section className="bg-white py-16">
      {/* Heading */}
      <div className="mb-6 text-center">
        <Heading level={3}>
          Student <span className="text-[#0B6D76]">Success</span>
        </Heading>
      </div>

      {/* Swiper Slider */}
      <Swiper
        modules={[Navigation]}
        spaceBetween={20}
        slidesPerView={1}
        navigation={{
          prevEl: '.student-prev',
          nextEl: '.student-next',
        }}
        breakpoints={{
          768: {
            slidesPerView: 2,
          },
          1024: {
            slidesPerView: 3,
          },
        }}
      >
        {studentSuccessData.map((review, i) => (
          <SwiperSlide key={i} className="flex h-full">
            <div className="flex flex-col justify-between bg-[#E7F1F2] p-6 rounded-lg shadow-md w-full h-[250px] relative">
              {/* Left Indicator Bar */}
              <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-[120px] bg-[#0B6D76] rounded-r-md"></span>

              {/* Review Content */}
              <div>
                <div className="text-teal-500 mb-2">★★★★★</div>
                <div className="mb-4 max-h-[120px] overflow-y-auto pr-1">
                  <Paragraph>{review.message}</Paragraph>
                </div>
              </div>

              {/* Student Info */}
              <div className="flex items-center gap-[20px] mt-4">
                <div className="w-[50px] h-[50px] relative rounded-full overflow-hidden">
                  <Image
                    src={review.image}
                    alt={review.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <p className="font-semibold text-teal-700">{review.name}</p>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      {/* Navigation Buttons */}
      <div className="flex justify-center gap-4 mt-8">
        <button
          className="student-prev bg-[var(--brand-color)] p-3 lg:p-4 rounded-full shadow-md hover:bg-[#095d65] transition"
          aria-label="Previous Slide"
        >
          <FaChevronLeft className="text-white" />
        </button>
        <button
          className="student-next bg-[var(--brand-color)] p-3 lg:p-4 rounded-full shadow-md hover:bg-[#095d65] transition"
          aria-label="Next Slide"
        >
          <FaChevronRight className="text-white" />
        </button>
      </div>
    </section>
  );
};

export default StudentSuccess;
