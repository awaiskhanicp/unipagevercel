'use client';

import Button from '../atoms/Button';
import Image from 'next/image';
import Heading from '../atoms/Heading';
import Paragraph from '../atoms/Paragraph';
import Link from 'next/link';
import SearchBar from './SearchBar';

const Hero = () => {
  return (
    <div className="">
      <section className="relative md:h-[74vh] sm:h-[95vh] h-[95vh]  flex items-center justify-center ">
      {/* Background Image */}
      <img
        src="/assets/hero.jpg"
        alt="Hero Background"
        className="absolute top-0 left-0 w-full h-full object-center  object-cover z-0"
      />
      {/* Overlay */}
      <div className="absolute inset-0 bg-black opacity-50 z-10"></div>

      {/* Gradient Overlay */}
      <div className="absolute inset-0 z-10 bg-gradient-to-b from-[rgba(0,0,0,0.1)] to-[rgba(0,0,0,0.9)]"></div>
      {/* Content */}
      <div className="relative z-20 text-center px-4 md:pt-[0px] sm:pt-[120px] pt-[120px] max-w-4xl mx-auto pb-12">
        <Heading level={1}>
          <div className="text-white">Study Abroad?</div>
        </Heading>
        <Paragraph>
          <p className="text-white w-[65%] mx-auto leading-relaxed">
            Discover global opportunities and expand your horizons with world-class education
          </p>
        </Paragraph>
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-[fadeIn_1s_ease-in_0.4s] mt-6">
         <Link href={"/institutions"}>
         <Button
            size="lg"
            className=" text-white text-lg px-10 py-4 shadow-xl hover:shadow-2xl"
          >
            Universities
          </Button>
         </Link>
          <Link href={"/courses"}>
         <Button
            size="lg"
            className=" text-white text-lg px-10 py-4 shadow-xl hover:shadow-2xl"
          >
           courses
          </Button>
          
         </Link>
        </div>
      </div>
      {/* SearchBar Overlay */}
      <div className="absolute z-30 left-1/2  w-full  transform -translate-x-[50%] top-[87%] ">
        <SearchBar />
      </div>
    </section>
    </div>
  );
};

export default Hero;