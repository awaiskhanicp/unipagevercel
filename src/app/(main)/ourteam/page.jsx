'use client';

import React from 'react';
import Link from 'next/link';

export default function OurTeam() {
  const profiles = [
    {
      name: 'Guy Hawkins',
      title: 'Admin',
      imageUrl:
        'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=400',
      slug: 'guy-hawkins',
    },
    {
      name: 'Jacob Jones',
      title: 'Manager',
      imageUrl:
        'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=400',
      slug: 'jacob-jones',
    },
    {
      name: 'Kristin Watson',
      title: 'Consultant',
      imageUrl:
        'https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=400',
      slug: 'kristin-watson',
    },
    {
      name: 'Bessie Cooper',
      title: 'Founder',
      imageUrl:
        'https://images.pexels.com/photos/1300402/pexels-photo-1300402.jpeg?auto=compress&cs=tinysrgb&w=400',
      slug: 'bessie-cooper',
    },
    {
      name: 'Kristin Watson',
      title: 'Consultant',
      imageUrl:
        'https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=400',
      slug: 'kristin-watson',
    },
    {
      name: 'Guy Hawkins',
      title: 'Admin',
      imageUrl:
        'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=400',
      slug: 'guy-hawkins',
    },
    {
      name: 'Kristin Watson',
      title: 'Consultant',
      imageUrl:
        'https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=400',
      slug: 'kristin-watson',
    },
    {
      name: 'Bessie Cooper',
      title: 'Founder',
      imageUrl:
        'https://images.pexels.com/photos/1300402/pexels-photo-1300402.jpeg?auto=compress&cs=tinysrgb&w=400',
      slug: 'bessie-cooper',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 justify-items-center">
        {profiles.map((profile, index) => (
          <Link key={index} href={`/page-team-details/${profile.slug}`} className="w-72 h-[400px]">
            <div
              className="relative w-72 h-[400px] rounded-3xl overflow-hidden cursor-pointer shadow-md hover:shadow-2xl group transition-all duration-300"
            >
              {/* Image Area with Hover Stretch */}
              <div className="relative w-full h-[75%] overflow-hidden rounded-t-3xl">
                <div
                  className="w-full h-full bg-cover bg-center origin-left scale-x-100 group-hover:scale-x-125 transition-transform duration-700 ease-in-out"
                  style={{ backgroundImage: `url(${profile.imageUrl})` }}
                ></div>
                {/* Dark Overlay */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-20" />
                {/* Social Icons */}
                <div className="absolute right-6 top-1/2 -translate-y-1/2 flex flex-col gap-2 transition-all duration-500 opacity-0 group-hover:opacity-100 group-hover:translate-x-0 translate-x-5 z-30">
                  {['f', 'IG', 'in', 'Be'].map((icon, i) => (
                    <div
                      key={i}
                      className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-sm font-semibold text-black shadow-md"
                    >
                      {icon}
                    </div>
                  ))}
                </div>
                {/* Plus → X Button */}
                <div className="absolute bottom-4 right-4 z-40">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-white text-2xl font-bold bg-[#0B6D76] group-hover:bg-red-500 group-hover:rotate-45 transition-all duration-300">
                    +
                  </div>
                </div>
              </div>
              {/* Info Section */}
              <div className="bg-white h-[25%] rounded-b-3xl p-4 flex flex-col justify-center transition-colors duration-300 group-hover:bg-[#0B6D76] group-hover:text-white">
                <h2 className="text-lg font-bold text-gray-900 group-hover:text-white">
                  {profile.name}
                </h2>
                <p className="text-sm text-gray-500 group-hover:text-white/80">
                  {profile.title}
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}