'use client';

import { useState, useEffect } from 'react';
import { Bell, User, FileText, Heart, Lock, Menu } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

import StudentDashboardHome from '../organisms/StudentDashboardHome';
import Container from '../atoms/Container';
import Heading from '../atoms/Heading';
import Paragraph from '../atoms/Paragraph';
import StudentProfile from '../organisms/StudentProfile';
import StudentApplication from '../organisms/StudentApplication';
import StudentWishlist from '../organisms/StudentWishlist';
import StudentPassword from '../organisms/StudentPassword';
import StudentNotifications from '../organisms/StudentNotifications';

const NewDashboard = () => {
  const [activeTab, setActiveTab] = useState('Dashboard');
  const { data: session, status } = useSession();
  const router = useRouter();

  // Redirect if not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    }
  }, [status, router]);

  if (status === 'loading') {
    return (
      <Container>
        <div className="flex justify-center items-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#0B6D76]"></div>
        </div>
      </Container>
    );
  }

  const renderComponent = () => {
    switch (activeTab) {
      case 'Dashboard': return <StudentDashboardHome />;
      case 'Profile': return <StudentProfile />;
      case 'Application': return <StudentApplication />;
      case 'Wishlist': return <StudentWishlist />;
      case 'Password': return <StudentPassword />;
      case 'Notifications': return <StudentNotifications />;
      default: return <StudentDashboardHome />;
    }
  };

  const menuItems = [
    { name: 'Dashboard', icon: <Menu size={20} /> },
    { name: 'Profile', icon: <User size={20} /> },
    { name: 'Application', icon: <FileText size={20} /> },
    { name: 'Wishlist', icon: <Heart size={20} /> },
    { name: 'Password', icon: <Lock size={20} /> },
    { name: 'Notifications', icon: <Bell size={20} /> },
  ];

  // Helper to show value or fallback
  const show = (val) => val && val !== '' ? val : '—';

  // Get student data directly from session
  const student = session?.user || {};

  return (
    <Container>
      <div className="">
        <div className="flex gap-[30px] flex-col lg:flex-row min-h-screen pb-[50px] lg:pt-[50px] pt-[80px] bg-white p-6">
          {/* Left Sidebar - unchanged */}
          <div className="w-80 bg-[#E7F1F2] rounded-3xl p-4 space-y-4">
            {menuItems.map((item) => (
              <div
                key={item.name}
                onClick={() => setActiveTab(item.name)}
                className={`flex items-center space-x-3 px-4 py-3 cursor-pointer rounded-xl
                  ${activeTab === item.name ? 'bg-[#0B6D76] text-white' : 'hover:bg-gray-200'}`}
              >
                {item.icon}
                <span>{item.name}</span>
              </div>
            ))}
          </div>

          {/* Main Content Area - unchanged */}
          <div className="bg-[#E7F1F2] w-full rounded-3xl p-8 space-y-8">
            {renderComponent()}
          </div>
        </div>

        {/* Additional Form Section - REMOVED */}
      </div>
    </Container>
  );
};

export default NewDashboard;