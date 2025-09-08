'use client';

import React from 'react';
import Heading from '../atoms/Heading';
import Paragraph from '../atoms/Paragraph';
import { CiHeart } from "react-icons/ci";
import { useSession } from 'next-auth/react';

const ConsultantHomeTab = () => {
  const { data: session } = useSession();
  const student = session?.user || {};

  const cards = [
    {
      label: 'Total Students',
      count: 0,
      icon: <CiHeart className="text-[20px] text-[#0B6D76]" />,
    },
   
  ];

  return (
    <div className='flex flex-col justify-center items-center gap-[30px]'>
      <div className="flex flex-col gap-[20px] text-center">
        <Heading level={5}>Dashboard</Heading>

        <Paragraph level={5}>
          Hey {student.first_name || ''} {student.last_name || ''}
        </Paragraph>

        <div className="max-w-[500px] mx-auto">
          <Paragraph>
            From your Dashboard you have the ability to view your university application's activity and update your account information. Select a link below to view or edit information.
          </Paragraph>
        </div>
      </div>

      {/* Cards Section - Responsive Grid */}
      <div className=" w-[40%]  ">
        {cards.map((card, index) => (
          <div
            key={index}
            className="flex items-center justify-between bg-[var(--brand-color)] text-white rounded-tl-[30px] rounded-tr-[30px] rounded-br-[30px] px-5 py-4 font-medium text-sm shadow-md"
          >
            <div>
              <Paragraph><span className='text-white'>{card.label}</span></Paragraph>
              <Heading level={5}><span className='text-white'>{card.count}</span></Heading>
            </div>
            <div className="icon h-[42px] w-[42px] rounded-full bg-white flex justify-center items-center text-black">
              {card.icon}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ConsultantHomeTab;