'use client';

import { useState } from 'react';
import { Search, Filter, Eye, Download, CheckCircle, Clock, XCircle } from 'lucide-react';

const Application = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [applications, setApplications] = useState([
    {
      id: 1,
      studentName: 'John Smith',
      email: 'john.smith@email.com',
      university: 'Harvard University',
      course: 'Computer Science',
      status: 'Pending',
      submittedDate: '2024-01-15',
      country: 'USA'
    },
    {
      id: 2,
      studentName: 'Maria Garcia',
      email: 'maria.garcia@email.com',
      university: 'Oxford University',
      course: 'Business Administration',
      status: 'Approved',
      submittedDate: '2024-01-10',
      country: 'UK'
    },
    {
      id: 3,
      studentName: 'Ahmed Hassan',
      email: 'ahmed.hassan@email.com',
      university: 'Stanford University',
      course: 'Engineering',
      status: 'Under Review',
      submittedDate: '2024-01-20',
      country: 'USA'
    }
  ]);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Approved': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'Rejected': return <XCircle className="w-4 h-4 text-red-600" />;
      case 'Under Review': return <Clock className="w-4 h-4 text-yellow-600" />;
      default: return <Clock className="w-4 h-4 text-blue-600" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Approved': return 'bg-green-100 text-green-800';
      case 'Rejected': return 'bg-red-100 text-red-800';
      case 'Under Review': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  const filteredApplications = applications.filter(app => {
    const matchesSearch =
      app.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.university.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.course.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'All' || app.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="p-6 bg-gradient-to-br from-orange-50 to-red-100 min-h-screen">
      <div className="bg-white rounded-2xl shadow-xl p-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Applications</h1>
            <p className="text-gray-600">Review and manage student applications</p>
          </div>
          <div className="flex space-x-2">
            <button className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white px-6 py-3 rounded-xl flex items-center space-x-2 transition-all duration-200 shadow-lg hover:shadow-xl">
              <Download className="w-5 h-5" />
              <span>Export</span>
            </button>
          </div>
        </div>

        <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4 mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search applications..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200"
            />
          </div>

          <div className="relative">
            <Filter className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="pl-10 pr-8 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200"
            >
              <option value="All">All Status</option>
              <option value="Pending">Pending</option>
              <option value="Under Review">Under Review</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredApplications.map((app) => (
            <div key={app.id} className="bg-gradient-to-br from-white to-orange-50 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 border border-orange-100">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-bold text-gray-800">{app.studentName}</h3>
                  <p className="text-sm text-gray-600">{app.email}</p>
                </div>
                <div className="flex items-center space-x-2">
                  {getStatusIcon(app.status)}
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(app.status)}`}>
                    {app.status}
                  </span>
                </div>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">University:</span>
                  <span className="font-medium text-gray-800">{app.university}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Course:</span>
                  <span className="font-medium text-gray-800">{app.course}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Country:</span>
                  <span className="font-medium text-gray-800">{app.country}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Submitted:</span>
                  <span className="font-medium text-gray-800">{app.submittedDate}</span>
                </div>
              </div>

              <div className="flex space-x-2">
                <button className="flex-1 bg-orange-100 hover:bg-orange-200 text-orange-700 px-4 py-2 rounded-lg transition-colors duration-150 flex items-center justify-center space-x-2">
                  <Eye className="w-4 h-4" />
                  <span>View</span>
                </button>
                <button className="flex-1 bg-blue-100 hover:bg-blue-200 text-blue-700 px-4 py-2 rounded-lg transition-colors duration-150 flex items-center justify-center space-x-2">
                  <Download className="w-4 h-4" />
                  <span>Download</span>
                </button>
              </div>
            </div>
          ))}
        </div>

        {filteredApplications.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-500 text-lg">No applications found</div>
            <p className="text-gray-400 mt-2">Try adjusting your search or filter criteria</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Application;
