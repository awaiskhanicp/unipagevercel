'use client';

import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';

import { BsFillPersonFill } from "react-icons/bs";
import Paragraph from "../atoms/Paragraph";
import Heading from "../atoms/Heading";
import reviews from '../../utils/reviewsClient';
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

const Client = () => {
  return (
    <section className="bg-white">
      <div className=" text-center text-bottom-space">
        <Heading level={3}>
          Why Clients Love <span className="text-[#0B6D76]">Universites Page</span>
        </Heading>
      </div>

      {/* Swiper Slider */}
      <Swiper
        modules={[Navigation]}
        spaceBetween={20}
        slidesPerView={1}
        navigation={{
          prevEl: '.client-prev',
          nextEl: '.client-next',
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
        {reviews.map((review, i) => (
          <SwiperSlide key={i} className="flex h-full">
            <div className="bg-white p-[30px] rounded-lg shadow-md relative flex flex-col justify-between h-[250px]">
              <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-[120px] bg-[#0B6D76] rounded-r-md"></span>

              <div>
                <div className="text-teal-500 mb-2">★★★★★</div>
                <Paragraph>
                  <div className="mb-4 max-h-[100px] overflow-y-auto pr-1">{review.message}</div>
                </Paragraph>
              </div>

              <div className="flex items-center gap-[20px] mt-4">
                <BsFillPersonFill className="text-[50px] text-gray-400" />
                <p className="font-semibold text-teal-700">{review.name}</p>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      {/* Navigation Buttons */}
      <div className="flex justify-center gap-4 mt-8">
        <button className="client-prev bg-[var(--brand-color)] p-3 lg:p-4 rounded-full shadow-md hover:bg-[#095d65] transition">
          <FaChevronLeft className="text-white" />
        </button>
        <button className="client-next bg-[var(--brand-color)] p-3 lg:p-4 rounded-full shadow-md hover:bg-[#095d65] transition">
          <FaChevronRight className="text-white" />
        </button>
      </div>
    </section>
  );
};

export default Client;