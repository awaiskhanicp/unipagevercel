'use client';

import '../../../app/globals.css';
import Heading from '../atoms/Heading';
import Paragraph from '../atoms/Paragraph';
import { IoMdCheckmarkCircleOutline } from "react-icons/io";

const DiscountOfferfirst = () => {
  return (
    <div className='w-full  '>
      <div className='flex flex-col lg:flex-row justify-between gap-12'>

        {/* Left Side Images */}
        <div className="w-full lg:w-[50%] flex gap-6 lg:gap-12">
          <div className="flex flex-col md:block sm:hidden hidden gap-[20px] w-1/2">
            <img src='/assets/dis1.png' alt='image' className='w-full' />
            <img src='/assets/dis2.png' alt='image' className='w-full' />
          </div>
          <div className="flex flex-col md:block sm:hidden hidden gap-[30px] w-1/2">
            <div className="bg-[#3C8A91] mb-[20px] rounded-tl-[63px] rounded-tr-[63px] rounded-br-[63px] w-[130px] h-[126px] flex justify-center items-center">
              <div className="border-2 border-dashed border-white w-[120px] h-[116px] rounded-tl-[63px] rounded-tr-[63px] rounded-br-[63px] flex justify-center items-center">
                <span className='text-white text-center leading-tight'>
                  30+
                  <div className="text-sm font-normal">Years of <br /> experience</div>
                </span>
              </div>
            </div>
            <img src='/assets/dis3.png' alt='image' className='w-full' />
          </div>
        </div>

        {/* Right Side Content */}
        <div className="w-full lg:w-[50%] flex flex-col gap-4">
          <div className="max-w-[330px]">
            <Heading level={3}>
              100% <span className="text-[#0B6D76] font-medium"> Discount Offer</span>
            </Heading>
          </div>

          <div className="max-w-[500px]">
            <Paragraph>
              100% discount offer program is designed by our company to encourage and support poor families students who want to study abroad but cannot afford consultancy fee.
            </Paragraph>
          </div>

          <div className="max-w-[500px]">
            <Heading level={4}>The student must come under the following criteria.</Heading>
          </div>

          <div className="icon-text flex gap-[15px] flex-col">
            {[...Array(4)].map((_, index) => (
              <div key={index} className="flex flex-row gap-[10px] items-center">
                <IoMdCheckmarkCircleOutline className='text-[#3C8A91]' />
                <Paragraph>Must be from a deserving family.</Paragraph>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export default DiscountOfferfirst;
