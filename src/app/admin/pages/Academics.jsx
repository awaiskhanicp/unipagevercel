'use client'; // only if you're using App Router

import { Calendar, Clock, BookOpen, FileText, Users, Plus } from "lucide-react";

const Academics = () => {
  const events = [
    { id: 1, title: "Fall Semester Begins", date: "2024-08-15", type: "semester" },
    { id: 2, title: "Mid-term Exams", date: "2024-10-15", type: "exam" },
    { id: 3, title: "Fall Break", date: "2024-11-25", type: "break" },
    { id: 4, title: "Final Exams", date: "2024-12-15", type: "exam" },
    { id: 5, title: "Spring Semester Begins", date: "2025-01-15", type: "semester" }
  ];

  const exams = [
    { id: 1, course: "Computer Science 101", date: "2024-12-20", time: "09:00 AM", duration: "3 hours", students: 45 },
    { id: 2, course: "Mathematics 201", date: "2024-12-21", time: "02:00 PM", duration: "2 hours", students: 38 },
    { id: 3, course: "Physics 101", date: "2024-12-22", time: "10:00 AM", duration: "2.5 hours", students: 42 },
    { id: 4, course: "Chemistry 201", date: "2024-12-23", time: "01:00 PM", duration: "3 hours", students: 28 }
  ];

  const getEventTypeColor = (type) => {
    switch (type) {
      case 'semester': return 'bg-blue-100 text-blue-800';
      case 'exam': return 'bg-red-100 text-red-800';
      case 'break': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const quickStats = [
    { title: "Active Courses", value: "45", icon: BookOpen, color: "bg-blue-500" },
    { title: "Scheduled Exams", value: "23", icon: FileText, color: "bg-red-500" },
    { title: "Academic Events", value: "12", icon: Calendar, color: "bg-green-500" },
    { title: "Total Students", value: "2,543", icon: Users, color: "bg-purple-500" }
  ];

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Academic Management</h1>
          <p className="text-gray-600">Manage academic calendar, exams, and schedules</p>
        </div>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2">
          <Plus className="w-4 h-4" />
          <span>Add Event</span>
        </button>
      </div>

      {/* Academic Calendar + Upcoming Exams */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Academic Calendar */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-800">Academic Calendar</h2>
            <Calendar className="w-5 h-5 text-gray-400" />
          </div>
          <div className="p-6 space-y-4">
            {events.map((event) => (
              <div key={event.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-gray-800">{event.title}</p>
                  <p className="text-xs text-gray-500">{event.date}</p>
                </div>
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getEventTypeColor(event.type)}`}>
                  {event.type}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming Exams */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-800">Upcoming Exams</h2>
            <FileText className="w-5 h-5 text-gray-400" />
          </div>
          <div className="p-6 space-y-4">
            {exams.map((exam) => (
              <div key={exam.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-gray-800">{exam.course}</h3>
                    <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-3 h-3" />
                        <span>{exam.date}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock className="w-3 h-3" />
                        <span>{exam.time}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Users className="w-3 h-3" />
                        <span>{exam.students} students</span>
                      </div>
                    </div>
                  </div>
                  <span className="text-xs font-medium text-blue-600">{exam.duration}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {quickStats.map((stat, index) => (
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
    </div>
  );
};

export default Academics;
