
'use client';
import Image from 'next/image';
import Heading from '../atoms/Heading';
import Paragraph from '../atoms/Paragraph';
import Link from 'next/link';
import { FaArrowRight } from 'react-icons/fa';

const CourseCard = ({ image, title, university, location, id }) => {
  // Fallback for image
  const validImage = image && typeof image === 'string' && image.trim() !== '' ? image : '/assets/co1.png';
  return (
    <Link href={`/courses/${id}`}>
      <div className="relative bg-[#E7F1F2]  group  h-full ">
        {/* Image Container */}
      <div className="relative h-[280px] w-full group">
  <Image
    src={validImage}
    alt={title || 'Course'}
    fill
    className="object-cover p-[20px] w-full transition-transform duration-300 group-hover:scale-105"
  />

  {/* Discount badge / Flag */}
  <div className="absolute z-32 top-[85%] right-[40%] w-[70px] h-[73px] rounded-full text-center border-6 border-white">
    <img
      src="/assets/china.png"
      alt="China Flag"
      className="w-full h-full rounded-full transition-transform duration-700 ease-in-out group-hover:rotate-[360deg]"
    />
  </div>
</div>
        {/* Overlayed content */}
        <div className='pt-[30px]'>
          <div className="relative z-30   text-center  text-white py-6 px-10  ">
            <Paragraph>{university}</Paragraph>
            <div className="hover:">
              <Heading level={4}>{title}</Heading>
            </div>
            <Heading level={2}>{location}</Heading>
            {/* <span className="inline-block bg-white text-blue-600 px-3 py-1 rounded-full text-sm font-medium">
              {type}
            </span> */}
          </div>
        </div>
        <div className="flex justify-center pb-[30px] items-end relative">
          {/* Link button */}
          <div className="link border border-gray-300 rounded-[30px] px-6 py-2 transition-colors duration-300 hover:bg-[#0B6D76] hover:text-white peer">
            <Link href={`/courses/${id}`}>Read More</Link>
          </div>

          {/* Arrow button */}
          <div className="arrow bg-[#0B6D76] -rotate-40 absolute top-[10%] right-[30%] w-[30px] h-[30px] rounded-full flex items-center justify-center text-white transition-colors duration-300 peer-hover:bg-white peer-hover:text-[#0B6D76]">
            <FaArrowRight />
          </div>
        </div>


      </div>
    </Link>
  );
};

export default CourseCard;