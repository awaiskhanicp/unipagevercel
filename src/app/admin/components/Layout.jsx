'use client'
import Sidebar from "./Sidebar";
import Header from "./Header";
import { useState } from "react";

const Layout = ({ children }) => {
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => setSidebarOpen((prev) => !prev);
  const closeSidebar = () => setSidebarOpen(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 flex">
      <Sidebar isOpen={isSidebarOpen} onClose={closeSidebar} />
      <div className="flex-1 flex flex-col">
        <Header onMenuClick={toggleSidebar} />
        <main className="flex-1 overflow-y-auto h-full p-2 sm:p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout; 