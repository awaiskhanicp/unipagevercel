'use client';

import { UserCheck, Users, FileText, Clock, CheckCircle, XCircle } from "lucide-react";
import React from "react";

const Admissions = () => {
  const applications = [
    { id: 1, name: "Alex Johnson", email: "alex.johnson@email.com", program: "Computer Science", status: "Pending", date: "2024-01-15" },
    { id: 2, name: "Maria Garcia", email: "maria.garcia@email.com", program: "Business Administration", status: "Approved", date: "2024-01-14" },
    { id: 3, name: "Robert Smith", email: "robert.smith@email.com", program: "Engineering", status: "Under Review", date: "2024-01-13" },
    { id: 4, name: "Lisa Wong", email: "lisa.wong@email.com", program: "Medicine", status: "Rejected", date: "2024-01-12" },
    { id: 5, name: "David Kim", email: "david.kim@email.com", program: "Law", status: "Approved", date: "2024-01-11" }
  ];

  const stats = [
    { title: "Total Applications", value: "1,247", icon: FileText, color: "bg-blue-500" },
    { title: "Pending Review", value: "156", icon: Clock, color: "bg-yellow-500" },
    { title: "Approved", value: "891", icon: CheckCircle, color: "bg-green-500" },
    { title: "Rejected", value: "200", icon: XCircle, color: "bg-red-500" }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'Approved': return 'bg-green-100 text-green-800';
      case 'Rejected': return 'bg-red-100 text-red-800';
      case 'Under Review': return 'bg-blue-100 text-blue-800';
      case 'Pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Admissions Management</h1>
          <p className="text-gray-600">Manage student applications and admissions</p>
        </div>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2">
          <UserCheck className="w-4 h-4" />
          <span>Process Applications</span>
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
              </div>
              <div className={`${stat.color} p-3 rounded-lg`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Applications Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800">Recent Applications</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Applicant</th>
                <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Program</th>
                <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Application Date</th>
                <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {applications.map((application) => (
                <tr key={application.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                        <Users className="w-5 h-5 text-gray-600" />
                      </div>
                      <div className="ml-4">
                        <div className="text-gray-900 font-medium">{application.name}</div>
                        <div className="text-gray-500">{application.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-900">{application.program}</td>
                  <td className="px-6 py-4 text-gray-900">{application.date}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(application.status)}`}>
                      {application.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <div className="flex space-x-2">
                      <button className="text-blue-600 hover:text-blue-900">Review</button>
                      <button className="text-green-600 hover:text-green-900">Approve</button>
                      <button className="text-red-600 hover:text-red-900">Reject</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Admissions;
