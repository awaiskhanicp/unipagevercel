'use client';

import React, { useEffect, useState } from 'react';
import Heading from '../atoms/Heading';
import Paragraph from '../atoms/Paragraph';
import Button from '../atoms/Button';
import { CiHeart } from "react-icons/ci";
import Link from 'next/link';
import { GrCopy } from "react-icons/gr";
import { IoIosNotificationsOutline } from "react-icons/io";
import { useSession } from 'next-auth/react';
import { useWishlist } from '../../context/WishlistContext';

const StudentDashboardHome = () => {
  const { data: session } = useSession();
  const student = session?.user || {};
  const [wishlistCount, setWishlistCount] = useState(0);
  const { wishlist } = useWishlist();

  useEffect(() => {
    const fetchWishlist = async () => {
      try {
        const res = await fetch('/api/internal/wishlist');
        if (!res.ok) return;
        const data = await res.json();
        setWishlistCount(Array.isArray(data.wishlist) ? data.wishlist.length : 0);
      } catch {}
    };
    fetchWishlist();
  }, []);

  // Keep count in sync with global wishlist changes (live updates)
  useEffect(() => {
    setWishlistCount(Array.isArray(wishlist) ? wishlist.length : 0);
  }, [wishlist?.length]);

  const cards = [
    {
      label: 'Total Wishlist',
      count: wishlistCount,
      icon: <CiHeart className="text-[20px] text-[#0B6D76]" />,
    },
    {
      label: 'Applied Application',
      count: 0,
      icon: <GrCopy className="text-[20px] text-[#0B6D76]" />,
    },
    {
      label: 'Unread Notification',
      count: 0,
      icon: <IoIosNotificationsOutline className="text-[20px] text-[#0B6D76]" />,
    },
  ];

  return (
    <div className='flex flex-col gap-[30px]'>
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-[20px] md:gap-[30px]">
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

      {/* Bottom Button */}
      <div className="flex justify-center">
        <Link href={'/search'}>
          <Button>Search/Apply other Universities</Button>
        </Link>
      </div>
    </div>
  );
};

export default StudentDashboardHome;