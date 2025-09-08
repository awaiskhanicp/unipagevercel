'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { HiMenu, HiX } from 'react-icons/hi'; // React Icons
import '../../../app/globals.css';

const navItems = [
  { name: 'Home', href: '/' },
  { name: 'Guides', href: '/CountriesGuide' },
  { name: 'Universities', href: '/institutions' },
  { name: 'Articles', href: '/blog' },
  { name: 'Courses', href: '/courses' },
  { name: 'Visit visa', href: '/visit-visa' },
  { name: 'Free Consultation', href: '/free-consultation' },
  { name: 'Track Application ', href: '/track-application' },
  { name: 'Discount Offer', href: '/discount-offer' },
  { name: 'Search', href: '/search' },
  { name: 'Apply Online', href: '/apply-online' },
  { name: 'Complaint', href: '/complaint' },
  { name: 'Contact Us', href: '/contact-us' },
  { name: 'Job-Opportunities', href: '/jobs' },
  { name: 'Minhaj-University', href: '/minhaj-university-lahore' },
];

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [animate, setAnimate] = useState(false);

  const shouldShow = isOpen || animate;

  useEffect(() => {
    if (isOpen) {
      setAnimate(true);
      document.body.style.overflow = 'hidden'; // Disable scrolling on body
    } else {
      const timeout = setTimeout(() => {
        setAnimate(false);
        document.body.style.overflow = ''; // Enable scrolling on body
      }, 700); // Match this with your transition duration
      return () => {
        clearTimeout(timeout);
        document.body.style.overflow = '';
      };
    }
  }, [isOpen]);

  return (
    <>
      {/* Full Screen Overlay when menu is open */}
      {isOpen && (
        <div className="fixed inset-0 bg-black z-30 opacity-90 lg:hidden"></div>
      )}

      <nav className="w-full relative z-50">
        {/* Desktop Nav */}
        <div className="hidden lg:flex items-center justify-center space-x-4 xl:space-x-8 w-full">
          {navItems.map(({ name, href }) => (
            <Link
              key={name}
              href={href}
              className="text-xs xl:text-sm text-white hover:text-teal-300 transition-colors relative group font-medium px-1 xl:px-0"
            >
              {name}
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-teal-300 group-hover:w-full transition-all duration-300"></span>
            </Link>
          ))}
        </div>

        {/* Mobile Menu Button */}
        <div className="lg:hidden fixed top-0 left-0 right-0 bg-[var(--brand-color)] z-50 px-4 py-3 flex justify-between items-center shadow-md">
          <div className="text-white font-semibold text-base">Menu</div>
          <button
            className="text-white hover:text-teal-300 transition-transform duration-300 transform active:scale-95"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle menu"
          >
            {isOpen ? <HiX size={24} /> : <HiMenu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {shouldShow && (
          <div className="fixed inset-0 z-40 overflow-visible">
            {/* Sliding Sidebar */}
            <div
              className={`fixed top-[-200px] left-0 h-full w-full bg-[#0B6D76]  transform transition-transform duration-700 ease-in-out ${
                isOpen ? 'translate-x-0' : '-translate-x-full'
              }`}
            >
              {/* Header with close button */}
              {/* <div className="flex justify-between mt-[50%] items-center px-4 py-3 border-b border-white/20">
                <div className="text-lg font-semibold text-white">Menu</div>
                <button 
                  onClick={() => setIsOpen(false)} 
                  aria-label="Close Menu"
                  className="text-white hover:text-teal-300"
                >
                  <HiX size={24} />
                </button>
              </div> */}

              {/* Scrollable menu content */}
              <div className="h-[calc(100vh-60px)] bg-[#0B6D76]  overflow-y- pb">
                <div className="grid grid-cols-2 gap-2 p-4">
                  {navItems.map(({ name, href }) => (
                    <Link
                      key={name}
                      href={href}
                      className="text-white hover:text-teal-300 transition-colors text-sm py-2 px-3 roun  ded hover:bg-white/10 block"
                      onClick={() => setIsOpen(false)}
                    >
                      {name}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </nav>
    </>
  );
};

export default Navigation;