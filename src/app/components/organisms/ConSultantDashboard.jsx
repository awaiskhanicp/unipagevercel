'use client';

import { useState } from 'react';
import { Bell, FileText, Lock, Menu } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

import Container from '../atoms/Container';
import Heading from '../atoms/Heading';
import Paragraph from '../atoms/Paragraph';
import StudentPassword from '../organisms/StudentPassword';
import StudentNotifications from '../organisms/StudentNotifications';
import ConsultantHomeTab from '../molecules/ConsultantHomeTab';
import ConsultantGetallStudent from '../molecules/ConsultantGetallStudent';
import NewStudentForm from '../molecules/NewStudentForm';
import ConsultantChnage from '../molecules/ConsultantChnage';

const ConSultantDashboard = () => {
  const [activeTab, setActiveTab] = useState('Dashboard');
  const { data: session, status } = useSession();
  const router = useRouter();

  // Uncomment if you want to force redirect when not logged in
  // useEffect(() => {
  //   if (status === 'unauthenticated') {
  //     router.push('/auth/signin');
  //   }
  // }, [status, router]);

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
      case 'Dashboard':
        return <ConsultantHomeTab />;
      case 'All Student': // ✅ Fixed name to match menu
        return <ConsultantGetallStudent />;
      case 'Change Password':
        return <ConsultantChnage />;
      // case 'Add Student':
      //   // return <NewStudentForm />;
      default:
        return <ConsultantHomeTab />;
    }
  };

  const menuItems = [
    { name: 'Dashboard', icon: <Menu size={20} /> },
    { name: 'All Student', icon: <FileText size={20} /> },
    { name: 'Change Password', icon: <Lock size={20} /> },
    // { name: 'Add Student', icon: <Bell size={20} /> },
  ];

  const show = (val) => (val && val !== '' ? val : '—');

  const student = session?.user || {};

  return (
    <Container>
      <div className="">
        <div className="flex gap-[30px] flex-col lg:flex-row min-h-screen pb-[50px] lg:pt-[50px] pt-[80px] bg-white p-6">
          {/* Sidebar */}
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

          {/* Main Content */}
          <div className="bg w-full rounded-3xl p-8 space-y-8">
            {renderComponent()}
          </div>
        </div>
      </div>
    </Container>
  );
};

export default ConSultantDashboard;