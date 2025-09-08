'use client';

import React, { useState } from 'react';
import Heading from '../atoms/Heading';

const StudentNotifications = () => {
  const [activeTab, setActiveTab] = useState('title');

  // Dummy tab components
  const renderActiveTab = () => {
    switch (activeTab) {
      case 'title':
        return (
          <div className="p-4 bg-gray-200 rounded-lg shadow mt-6">
            <h3 className="text-xl font-semibold mb-2">Notification Title</h3>
            <p>This is the content for the Title tab.</p>
          </div>
        );
      case 'message':
        return (
          <div className="p-4 bg-gray-200 rounded-lg shadow mt-6">
            <h3 className="text-xl font-semibold mb-2">Notification Message</h3>
            <p>This is the content for the Message tab.</p>
          </div>
        );
      case 'createdAt':
        return (
          <div className="p-4 bg-gray-200 rounded-lg shadow mt-6">
            <h3 className="text-xl font-semibold mb-2">Created At</h3>
            <p>This is the content for the Created At tab.</p>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div>
      <Heading><div className=" text-center  mb-6">Notifications</div></Heading>

      {/* Tabs */}
      <div className="flex space-x-4">
        <button
          onClick={() => setActiveTab('title')}
          className={`px-4 py-2 rounded-md font-medium ${
            activeTab === 'title'
              ? 'bg-[#0B6D76] text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Title
        </button>
        <button
          onClick={() => setActiveTab('message')}
          className={`px-4 py-2 rounded-md font-medium ${
            activeTab === 'message'
              ? 'bg-[#0B6D76] text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Message
        </button>
        <button
          onClick={() => setActiveTab('createdAt')}
          className={`px-4 py-2 rounded-md font-medium ${
            activeTab === 'createdAt'
              ? 'bg-[#0B6D76] text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Created At
        </button>
      </div>

      {/* Active Tab Content */}
      {renderActiveTab()}
    </div>
  );
};

export default StudentNotifications;
