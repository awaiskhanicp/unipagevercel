'use client';

import React from 'react';
import Heading from '../atoms/Heading';

const StudentApplication = () => {
  // Dummy data (empty array for now)
  const applications = [];

  return (
    <div className=" flex justify-center ">
      <div className=" w-full">
        <div className="text-center mb-8">
          <Heading level={5}>Application Form</Heading>
        </div>

        <div className="overflow-x-auto rounded-lg shadow bg-white">
          <table className="min-w-[700px] w-full text-sm md:text-base border border-gray-200">
            <thead className="bg-[#0B6D76] text-white">
              <tr>
                <th className="px-4 sm:px-6 py-3 text-left">Application ID</th>
                <th className="px-4 sm:px-6 py-3 text-left">Applied Course</th>
                <th className="px-4 sm:px-6 py-3 text-left">Application Form State</th>
                <th className="px-4 sm:px-6 py-3 text-left">Application Material Status</th>
                <th className="px-4 sm:px-6 py-3 text-left">Action</th>
              </tr>
            </thead>
            <tbody>
              {applications.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center py-6 text-gray-500">
                    No applications found
                  </td>
                </tr>
              ) : (
                applications.map((app) => (
                  <tr key={app.id} className="border-t hover:bg-gray-50">
                    <td className="px-4 sm:px-6 py-4">{app.id}</td>
                    <td className="px-4 sm:px-6 py-4">{app.course}</td>
                    <td className="px-4 sm:px-6 py-4">{app.formState}</td>
                    <td className="px-4 sm:px-6 py-4">{app.materialStatus}</td>
                    <td className="px-4 sm:px-6 py-4">
                      <button className="bg-[#0B6D76] text-white px-3 py-1 rounded hover:bg-[#095a62] text-xs sm:text-sm">
                        View
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default StudentApplication;
