'use client';

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home, GraduationCap, UserPlus, Building2, Globe, BookOpen, MessageCircle,
  Briefcase, Users, UserCheck, FileText, Phone, Plane, Calendar, User,
  Settings, Inbox, Contact, ChevronDown, ChevronRight, Menu, X, Search, Bell
} from "lucide-react";

const Sidebar = ({ isOpen, onClose }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [expandedMenu, setExpandedMenu] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const pathname = usePathname();

  const toggleMenu = (menuName) => {
    setExpandedMenu(prev => (prev === menuName ? null : menuName));
  };

  const isActive = (path) => pathname === path;

  const menuItems = [
    { name: "Dashboard", icon: Home, path: "/admin" },
    { name: "Notifications", icon: Bell, path: "/admin/notifications" },
    {
      name: "Level of Education",
      icon: GraduationCap,
      path: "/admin/level-education",
      subItems: [
        { name: "Level of Education List", path: "/admin/level_of_education" },
        { name: "Add Level of Education", path: "/admin/level_of_education/add" }
      ]
    },
    {
      name: "Admin Register",
      icon: UserPlus,
      path: "/admin/admin-register",
      subItems: [
        { name: "Create Admin Account", path: "/admin/admin-register/create" },
        { name: "Admin User List", path: "/admin/admin-register/list" }
      ]
    },
    {
      name: "University",
      icon: Building2,
      path: "/admin/university",
      subItems: [
        { name: "University List", path: "/admin/university" },
        { name: "Add University", path: "/admin/university/add" },
        // { name: "Countries", path: "/admin/university/countries" }
      ]
    },
    {
      name: "Countries",
      icon: Globe,
      path: "/admin/countries",
      subItems: [
        { name: "Countries List", path: "/admin/countries" },
        { name: "Add Country", path: "/admin/countries/add" }
      ]
    },
    {
      name: "Course",
      icon: BookOpen,
      path: "/admin/course",
      subItems: [
        { name: "Course List", path: "/admin/course" },
        { name: "Add Course", path: "/admin/course/add" },
        { name: "Subject List", path: "/admin/course/subjects" }
      ]
    },
    {
      name: "Free Consultation",
      icon: MessageCircle,
      path: "/admin/free-consultation",
      subItems: [
        { name: "Free Consultation List", path: "/admin/free-consultation" },
        { name: "Apply Now List", path: "/admin/free-consultation/apply" }
      ]
    },
    {
      name: "Comments",
      icon: MessageCircle,
      path: "/admin/comments",
      subItems: [{ name: "Comment List", path: "/admin/comments" }]
    },
    {
      name: "Job Posts",
      icon: Briefcase,
      path: "/admin/job-posts",
      subItems: [
        { name: "Add Jobs", path: "/admin/job-posts/add" },
        { name: "Job List", path: "/admin/job-posts" },
        { name: "Job Applications", path: "/admin/job-applications" }
      ]
    },
    {
      name: "Student",
      icon: Users,
      path: "/admin/student",
      subItems: [{ name: "Student List", path: "/admin/student" }]
    },
    {
      name: "Consultant",
      icon: UserCheck,
      path: "/admin/consultant",
      subItems: [{ name: "Consultant List", path: "/admin/consultant" }]
    },
    // {
    //   name: "apply online",
    //   icon: UserCheck,
    //   path: "/admin/apply-now",
    //   subItems: [{ name: "Online Consultant List", path: "/admin/apply-now/online-consultant" }]
    // },
    {
      name: "Guide",
      icon: FileText,
      path: "/admin/guide",
      subItems: [
        { name: "Guide List", path: "/admin/guide" },
        { name: "Add Guide", path: "/admin/guide/add" }
      ]
    },
    // {
    //   name: "Pages",
    //   icon: FileText,
    //   path: "/admin/pages",
    //   subItems: [{ name: "Pages List", path: "/admin/pages" }]
    // },
    {
      name: "Articles",
      icon: FileText,
      path: "/admin/articles",
      subItems: [
        { name: "Add Article", path: "/admin/articles/add" },
        { name: "Article List", path: "/admin/articles/list" },
        { name: "Category List", path: "/admin/articles/categories" }
      ]
    },
  {
      name: "Visit Visa",
      icon: Plane,
      path: "/admin/visit-visa",
      subItems: [
        { name: "Visa Country", path: "/admin/visit-visa/country" },
        { name: "Visa Details", path: "/admin/visit-visa/details" },
        { name: "Apply Visit Visa", path: "/admin/visit-visa/apply" }
      ]
    },
    {
      name: "Events Trigger",
      icon: Calendar,
      path: "/admin/events-trigger",
      subItems: [{ name: "WhatsApp Button Click", path: "/admin/events-trigger/whatsapp" }]
    },
    // {
    //   name: "User Management",
    //   icon: User,
    //   path: "/admin/user-management",
    //   subItems: [{ name: "User", path: "/admin/user-management" }]
    // },
    // { name: "Settings", icon: Settings, path: "/admin/settings" },
    {
      name: "Inbox",
      icon: Inbox,
      path: "/admin/inbox",
      subItems: [
        { name: "Contact", path: "/admin/inbox/contact" },
        { name: "Complaints", path: "/admin/inbox/complaints" }
      ]
    },
    { name: "Discount Offer", icon: FileText, path: "/admin/discount-offer" },
    { name: "Online Consultant ", icon: FileText, path: "/admin/online-consultant" },
    { name: "Contact Us ", icon: FileText, path: "/admin/contact-us" },
    { name: "Minhaj Leads", icon: FileText, path: "/admin/minhaj-leads" },
    // {
    //   name: "University Contacts",
    //   icon: Contact,
    //   path: "/admin/university-contacts",
    //   subItems: [
    //     { name: "University Logs", path: "/admin/university-contacts/logs" },
    //     { name: "Course Logs", path: "/admin/university-contacts/course-logs" }
    //   ]
    // },
    // { name: "Application", icon: FileText, path: "/admin/application" },
    // { name: "Conversations", icon: MessageCircle, path: "/admin/conversations" },
    {
      name: "Student Support Documents",
      icon: FileText,
      path: "/admin/student-support",
      subItems: [
        { name: "Add Document", path: "/admin/student-support-documents/add" },
        { name: "Document List", path: "/admin/student-support-documents/list" },
        { name: "Document Downloads", path: "/admin/student-support-document-downloads" }
      ]
    }
  ];

  const filteredMenuItems = menuItems.filter((item) => {
    const search = searchTerm.toLowerCase();
    const inMain = item.name.toLowerCase().includes(search);
    const inSub = item.subItems?.some(sub => sub.name.toLowerCase().includes(search));
    return inMain || inSub;
  });

  // Drawer for mobile
  return (
    <>
      {/* Overlay for mobile */}
      <div
        className={`fixed inset-0 bg-black bg-opacity-40 z-40 transition-opacity md:hidden ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
        aria-hidden={!isOpen}
      />
      {/* Sidebar Drawer (mobile) and normal sidebar (desktop) */}
      <div
        className={`fixed top-0 left-0 h-full z-50 bg-gradient-to-b from-[#0B6D76] to-[#094F56] shadow-2xl transition-transform duration-300 md:static md:translate-x-0 md:w-72 min-h-screen overflow-y-auto
          ${isOpen ? 'translate-x-0' : '-translate-x-full'} w-full max-w-[90vw] md:block`}
        style={{ maxWidth: '90vw' }}
      >
        {/* Close button for mobile */}
        <div className="flex md:hidden justify-end p-2 sm:p-4">
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-white/20">
            <X className="w-6 h-6 text-white" />
          </button>
        </div>
        {/* Top Section */}
        <div className="p-2 sm:p-4 border-b border-white/10">
          <div className="flex items-center justify-between">
            {!isCollapsed && (
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center shadow-xl">
                  <GraduationCap className="w-6 h-6 text-white" />
                </div>
                <div>
                  <span className="font-bold text-white text-lg">University</span>
                  <p className="text-indigo-200 text-sm">Admin Portal</p>
                </div>
              </div>
            )}
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
            >
              {isCollapsed ? <Menu className="w-6 h-6 text-white" /> : <X className="w-5 h-5 text-white" />}
            </button>
          </div>

          {/* Search Bar */}
          {!isCollapsed && (
            <div className="mt-4 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white w-4 h-4" />
              <input
                type="text"
                placeholder="Search menu..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-lg bg-white/10 text-white placeholder-white/60 focus:outline-none focus:ring focus:ring-white/20"
              />
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-1 max-h-[calc(100vh-150px)] overflow-y-auto custom-scrollbar">
          {filteredMenuItems.map((item) => (
            <div key={item.name}>
              {item.subItems ? (
                <>
                  <button
                    onClick={() => toggleMenu(item.name)}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-left transition-all duration-200 ${
                      isActive(item.path)
                        ? 'bg-white/10 text-white shadow-lg'
                        : 'text-indigo-100 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <item.icon className="w-8 h-8 p-2 bg-white/10 rounded-[10px] flex-shrink-0" />
                    {!isCollapsed && (
                      <>
                        <span className="flex-1 font-medium">{item.name}</span>
                        {expandedMenu === item.name ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                      </>
                    )}
                  </button>
                  {!isCollapsed && expandedMenu === item.name && (
                    <div className="ml-8 mt-2 space-y-1">
                      {item.subItems
                        .filter(sub => sub.name.toLowerCase().includes(searchTerm.toLowerCase()))
                        .map((subItem) => (
                          <Link
                            key={subItem.name}
                            href={subItem.path}
                            className={`block px-4 py-2 rounded-lg text-sm transition-all duration-200 ${
                              isActive(subItem.path)
                                ? 'bg-white/10 text-white shadow-md'
                                : 'text-indigo-200 hover:text-white hover:bg-white/10'
                            }`}
                          >
                            {subItem.name}
                          </Link>
                        ))}
                    </div>
                  )}
                </>
              ) : (
                <Link
                  href={item.path}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                    isActive(item.path)
                      ? 'bg-[#0B6D76] text-white shadow-lg'
                      : 'text-indigo-100 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <item.icon className="w-5 h-5 flex-shrink-0" />
                  {!isCollapsed && <span className="font-medium">{item.name}</span>}
                </Link>
              )}
            </div>
          ))}
        </nav>

        {/* Scrollbar Styling */}
        <style>{`
          .custom-scrollbar::-webkit-scrollbar {
            width: 6px;
          }
          .custom-scrollbar::-webkit-scrollbar-track {
            background: rgba(255, 255, 255, 0.05);
          }
          .custom-scrollbar::-webkit-scrollbar-thumb {
            background: rgba(255, 255, 255, 0.2);
          }
          .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background: rgba(255, 255, 255, 0.4);
          }
        `}</style>
      </div>
    </>
  );
};

export default Sidebar;
