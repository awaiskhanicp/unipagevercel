'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { HiMenu, HiX, HiChevronDown } from 'react-icons/hi';
import { FaUserCircle, FaHeart, FaUser, FaSignOutAlt } from 'react-icons/fa';
import { useRouter } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import Logo from '../atoms/Logo';
import Button from '../atoms/Button';
import { useWishlist } from '../../context/WishlistContext';
import { MdCompare } from "react-icons/md";

const navCategories = [
  {
    name: 'Home',
    href: '/',
    hasDropdown: false
  },
  {
    name: 'Study Abroad',
    hasDropdown: true,
    href: '/study-abroad',
    items: [
      { name: 'Guides', href: '/guides' },
      { name: 'Universities', href: '/institutions' },
      { name: 'Courses', href: '/courses' },
      { name: 'Articles', href: '/blog' }
    ]
  },
  {
    name: 'Services',
    hasDropdown: true,
    href: '/services',
    items: [
      { name: 'our Services', href: '/services' },
      { name: 'Visit Visa', href: '/visit-visa' },
      { name: 'Free Consultation', href: '/free-consultation' },
      { name: 'Track Application', href: '/track-application' },
      { name: 'Discount Offer', href: '/discount-offer' }
    ]
  },
  {
    name: 'Apply',
    hasDropdown: true,
    href: '/apply',
    items: [
      { name: 'Apply Online', href: '/apply-online' },
      { name: 'Job Opportunities', href: '/jobs' }
    ]
  },
  {
    name: 'Support',
    hasDropdown: true,
    href: '/support',
    items: [
      { name: 'Student Support Documents', href: '/student-support-documents' },
      { name: 'Complaint', href: '/complaint' }
    ]
  },
  {
    name: 'About',
    hasDropdown: true,
    href: '/about',
    items: [
      { name: 'About Us', href: '/about-us' },
      { name: 'Our Team', href: '/our-team' },
      { name: 'Contact Us', href: '/contact-us' }
    ]
  },
  {
    name: 'Tools',
    hasDropdown: true,
    href: '/tools',
    items: [
      { name: 'Compare Universities & Courses', href: '/comparison' },
      { name: 'AI CV Analysis Tool', href: '/cv-analysis' }
    ]
  },
  {
    name: 'Minhaj University',
    href: '/minhaj-university-lahore',
    hasDropdown: false
  },
  {
    name: 'Search',
    href: '/search',
    hasDropdown: false
  }
];

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const { data: session } = useSession();
  const router = useRouter();
  const { wishlist, fetchWishlist } = useWishlist();
  const [showWishlist, setShowWishlist] = useState(false);
  const [activeCategory, setActiveCategory] = useState(null);
  const [touchDevice, setTouchDevice] = useState(false);
  const [dropdownTimeout, setDropdownTimeout] = useState(null);
  const [wishlistLoaded, setWishlistLoaded] = useState(false);

  const studentName = session?.user?.first_name || 
                     session?.user?.name?.split(' ')[0] || 
                     'Student';

  const handleLogout = async () => {
    await signOut({ redirect: false });
    router.push('/');
    setShowMenu(false);
    setIsOpen(false);
  };

  const handleDashboard = () => {
    router.push('/dashboard');
    setShowMenu(false);
    setIsOpen(false);
  };

  useEffect(() => {
    // Check if it's a touch device
    setTouchDevice('ontouchstart' in window || navigator.maxTouchPoints > 0);
  }, []);

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
  }, [isOpen]);

  useEffect(() => {
    if (!showWishlist) return;
    const handler = (e) => {
      if (!e.target.closest('.wishlist-dropdown')) setShowWishlist(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showWishlist]);

  useEffect(() => {
    if (!activeCategory || touchDevice) return;
    const handler = (e) => {
      if (!e.target.closest('.dropdown-menu')) setActiveCategory(null);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [activeCategory, touchDevice]);

  const handleCategoryClick = (category) => {
    if (touchDevice) {
      setActiveCategory(activeCategory === category.name ? null : category.name);
    }
  };

  return (
    <header className="relative z-50">
      {/* Desktop Header */}
      <div className="hidden lg:block bg-white shadow-sm border-b border-gray-200">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between py-2 text-sm border-b border-gray-100">
            {/* Left Links */}
            <div className="flex items-center gap-[20px]">
              {!session ? (
                <>
                  <Link href="/student-login" passHref>
                    <span className="text-sm cursor-pointer hover:text-blue-600">Student</span>
                  </Link>
                  <Link href="/consultant-register" passHref>
                    <span className="text-sm cursor-pointer hover:text-blue-600">Consultant</span>
                  </Link>
                  <Link href="/social-login" passHref>
                    <span className="text-sm cursor-pointer hover:text-blue-600">Social</span>
                  </Link>
                </>
              ) : (
                <div className="relative">
                  <div
                    onClick={() => setShowMenu(!showMenu)}
                    className="flex items-center gap-2 cursor-pointer px-4 py-2 rounded-full bg-white hover:shadow-sm transition duration-200 border border-gray-200"
                  >
                    <FaUserCircle size={24} className="text-[#0B6D76]" />
                    <span className="text-sm font-medium text-gray-800">{studentName}</span>
                    <svg
                      className={`w-4 h-4 text-gray-500 transition-transform duration-300 ${showMenu ? 'rotate-180' : ''}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                
                 {showMenu && (
  <div className="absolute -right-20 mt-2 w-52 bg-white border border-gray-200 rounded-xl shadow-lg z-50 animate-fade-in-down">
    <div className="px-4 py-4 bg-[#F1FAFA] text-sm font-semibold text-[#0B6D76] border-b border-gray-200">
      👋 Welcome, {studentName}
    </div>
    
    {/* Only show Dashboard if user is not admin */}
    {session?.user?.role !== 'admin' && (
      <button
        onClick={handleDashboard}
        className="flex items-center cursor-pointer gap-2 w-full px-4 py-3.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
      >
        <span>📋</span> Dashboard
      </button>
    )}
    
    <button
      onClick={handleLogout}
      className="flex items-center cursor-pointer gap-2 w-full px-4 py-3.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
    >
      <span>🚪</span> Logout
    </button>
  </div>
)}
                </div>
              )}
            </div>

            {/* Logo */}
            <Logo />

            {/* Right Side */}
            <div className="flex items-center gap-[15px]">
              <div className="relative wishlist-dropdown">
                <span className="cursor-pointer flex items-center" onClick={async () => {
                  if (!wishlistLoaded && session?.user) {
                    await fetchWishlist();
                    setWishlistLoaded(true);
                  }
                  setShowWishlist(v => !v);
                }}>
                  <FaHeart className="text-red-500 text-xl mr-1" />wishlist
                  {wishlist.length > 0 && (
                    <span className="ml-1 bg-red-500 text-white rounded-full px-2 text-xs">{wishlist.length}</span>
                  )}
                </span>
                {showWishlist && (
                  <div className="absolute right-0 mt-2 w-72 bg-white border border-gray-200 rounded-xl shadow-lg z-50 p-4">
                    <div className="font-semibold mb-2">Wishlist</div>
                    {wishlist.length === 0 ? (
                      <div className="text-gray-500 text-sm">No items in wishlist.</div>
                    ) : (
                      <ul className="max-h-60 overflow-y-auto divide-y divide-gray-100 mb-2">
                        {wishlist.slice(0, 5).map((item, idx) => (
                          <li key={item.key || idx} className="py-2 flex items-center gap-2">
                            <span className="font-medium text-gray-800 text-sm">
                              {item.title || item.name || 'Item'}
                            </span>
                            <span className="text-xs text-gray-400 ml-auto">
                              {item.label || (item.course_id ? 'Course' : 'University')}
                            </span>
                          </li>
                        ))}
                      </ul>
                    )}
                    <button
                      className="w-full bg-teal-600 text-white py-2 rounded-lg mt-2 hover:bg-teal-700 transition"
                      onClick={() => { setShowWishlist(false); router.push('/wishlist'); }}
                    >
                      View All
                    </button>
                  </div>
                )}
              </div>
              <Link href="/comparison">
                <div className="flex justify-center item-center cursor-pointer px-4 gap-2 py-2 rounded-full bg-white hover:shadow-sm transition duration-200 border border-gray-200">
                  <MdCompare style={{height:"20px"}}/>Compare
                </div>
              </Link>

              {/* <img src="/assets/logor.png" alt="user" className="" /> */}
              {/* <Link href="/contact-us">
                <Button className="text-xs md:text-sm">Contact Us</Button>
              </Link> */}
            </div>
          </div>
        </div>

        {/* Nav Items */}
        <div className="bg-[#0B6D76] text-white py-4 backdrop-blur-lg">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-center space-x-2 lg:space-x-8 xl:space-x-6">
              {navCategories.map((category) => (
                <div 
                  key={category.name} 
                  className="relative group"
                >
                  {category.hasDropdown ? (
                    <div className="flex items-center">
                      <button
                        type="button"
                        onClick={() =>
                          setActiveCategory(
                            activeCategory === category.name ? null : category.name
                          )
                        }
                        className="flex items-center text-[13px] lg:text-[20px] hover:text-teal-300 transition-colors px-2 py-1 block focus:outline-none"
                      >
                        {category.name}
                        <HiChevronDown
                          className={`w-3 h-3 ml-1 transition-transform duration-300 ${
                            activeCategory === category.name ? 'rotate-180' : ''
                          }`}
                        />
                      </button>
                    </div>
                  ) : (
                    <Link
                      href={category.href}
                      className="text-[13px] lg:text-[20px] hover:text-teal-300 transition-colors relative group px-2 py-1 block"
                      onClick={() => setIsOpen(false)}
                    >
                      {category.name}
                      <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-teal-300 group-hover:w-full transition-all duration-300"></span>
                    </Link>
                  )}
                  
                  {category.hasDropdown && activeCategory === category.name && (
                    <div
                      className="absolute left-1/2 transform -translate-x-1/2 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50 dropdown-menu"
                    >
                      {category.items.map((item) => (
                        <Link
                          key={item.name}
                          href={item.href}
                          className="block px-4 py-2 text-sm text-gray-800 hover:bg-gray-100 first:rounded-t-lg last:rounded-b-lg"
                          onClick={() => {
                            setIsOpen(false);
                            setActiveCategory(null);
                          }}
                        >
                          {item.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Header */}
      <div className={`lg:hidden fixed top-0 left-0 right-0 px-4 py-2 flex justify-between items-center z-50 ${isOpen ? 'bg-[var(--brand-color)] text-white' : 'bg-white text-black border-b border-gray-200 shadow-sm'}`}>
        <Link href="/">
          <img src="/assets/logo1.png" alt="Mobile Logo" className="h-[40px] w-[40px]" />
        </Link>
        <button onClick={() => setIsOpen(!isOpen)}>{isOpen ? <HiX size={26} /> : <HiMenu size={26} />}</button>
      </div>

      {/* Mobile Sidebar */}
      {isOpen && (
        <div className="fixed top-[48px] left-0 w-full h-[calc(100vh-48px)] bg-[var(--brand-color)] text-white z-40 p-4 overflow-y-auto">
          <div className="grid grid-cols-4 mb-6 bg-[#0B6D76] rounded-lg p-2 text-center">
            {!session ? (
              <>
                <Link href="/student-login" onClick={() => setIsOpen(false)} className="col-span-4 text-sm py-2 hover:bg-white/10">Student</Link>
                <Link href="/consultant-register" onClick={() => setIsOpen(false)} className="col-span-4 text-sm py-2 hover:bg-white/10">Consultant</Link>
                <Link href="/social-login" onClick={() => setIsOpen(false)} className="col-span-4 text-sm py-2 hover:bg-white/10">Social</Link>
              </>
            ) : (
              <div className="col-span-4 flex justify-center">
                <div className="relative flex justify-center w-full">
                  <div onClick={() => setShowMenu(!showMenu)} className="flex items-center gap-1 cursor-pointer justify-center w-full">
                    <FaUserCircle size={18} className="text-white" />
                    <span className="text-xs font-medium">{studentName}</span>
                  </div>
                  {showMenu && (
  <div className="absolute left-1/2 -translate-x-1/2 mt-2 w-36 bg-white border rounded shadow-md z-50 text-black">
    <div className="px-4 py-2 font-medium border-b text-gray-700">👋 {studentName}</div>
    {/* Only show Dashboard if user is not admin */}
    {session?.user?.role !== 'admin' && (
      <button onClick={handleDashboard} className="block px-4 py-2 w-full text-left hover:bg-gray-100">Dashboard</button>
    )}
    <button onClick={handleLogout} className="block px-4 py-2 w-full text-left hover:bg-gray-100">Logout</button>
  </div>
)}
                </div>
              </div>
            )}
          </div>

          {/* Mobile Nav Items */}
          <div className="space-y-4">
            {navCategories.map((category) => (
              <div key={category.name} className="mb-4">
                {category.hasDropdown ? (
                  <>
                    <div 
                      className="flex justify-between items-center font-bold text-lg mb-2 border-b pb-2 cursor-pointer"
                      onClick={() => handleCategoryClick(category)}
                    >
                      <span>{category.name}</span>
                      <HiChevronDown className={`w-4 h-4 transition-transform ${activeCategory === category.name ? 'rotate-180' : ''}`} />
                    </div>
                    {activeCategory === category.name && (
                      <div className="grid grid-cols-2 gap-2 mb-4">
                        {category.items.map((item) => (
                          <Link 
                            key={item.name} 
                            href={item.href} 
                            onClick={() => setIsOpen(false)}
                            className="py-2 px-3 text-sm rounded bg-white/10 hover:bg-white hover:text-[var(--brand-color)] block text-center"
                          >
                            {item.name}
                          </Link>
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <Link 
                    href={category.href} 
                    onClick={() => setIsOpen(false)}
                    className="block font-bold text-lg py-2 border-b hover:text-teal-200 transition-colors"
                  >
                    {category.name}
                  </Link>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
