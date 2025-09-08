import { useState } from "react";
import { Calendar, Users, CheckCircle, XCircle, Clock } from "lucide-react";

const StudentAttendance = () => {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [students] = useState([
    { id: 1, name: "John Doe", studentId: "CS2021001", course: "Computer Science", attendance: "Present" },
    { id: 2, name: "Jane Smith", studentId: "BA2022001", course: "Business Administration", attendance: "Present" },
    { id: 3, name: "Mike Johnson", studentId: "ENG2020001", course: "Engineering", attendance: "Absent" },
    { id: 4, name: "Sarah Wilson", studentId: "MED2023001", course: "Medicine", attendance: "Present" },
    { id: 5, name: "David Brown", studentId: "LAW2022001", course: "Law", attendance: "Late" }
  ]);

  const [attendanceData, setAttendanceData] = useState(
    students.reduce((acc, student) => {
      acc[student.id] = student.attendance;
      return acc;
    }, {})
  );

  const handleAttendanceChange = (studentId, status) => {
    setAttendanceData({
      ...attendanceData,
      [studentId]: status
    });
  };

  const getAttendanceStats = () => {
    const total = students.length;
    const present = Object.values(attendanceData).filter(status => status === "Present").length;
    const absent = Object.values(attendanceData).filter(status => status === "Absent").length;
    const late = Object.values(attendanceData).filter(status => status === "Late").length;
    
    return { total, present, absent, late };
  };

  const stats = getAttendanceStats();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Student Attendance</h1>
          <p className="text-gray-600">Track and manage student attendance</p>
        </div>
        <div className="flex items-center space-x-4">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
            Save Attendance
          </button>
        </div>
      </div>

      {/* Attendance Statistics */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <Users className="w-8 h-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Students</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <CheckCircle className="w-8 h-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Present</p>
              <p className="text-2xl font-bold text-green-600">{stats.present}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <XCircle className="w-8 h-8 text-red-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Absent</p>
              <p className="text-2xl font-bold text-red-600">{stats.absent}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <Clock className="w-8 h-8 text-yellow-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Late</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.late}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Attendance Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Attendance for {selectedDate}</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Course</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Attendance Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {students.map((student) => (
                <tr key={student.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                        <Users className="w-5 h-5 text-gray-600" />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{student.name}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{student.studentId}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{student.course}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleAttendanceChange(student.id, "Present")}
                        className={`px-3 py-1 rounded-lg text-sm font-medium ${
                          attendanceData[student.id] === "Present"
                            ? "bg-green-100 text-green-800 border-green-300"
                            : "bg-gray-100 text-gray-700 border-gray-300"
                        } border`}
                      >
                        Present
                      </button>
                      <button
                        onClick={() => handleAttendanceChange(student.id, "Absent")}
                        className={`px-3 py-1 rounded-lg text-sm font-medium ${
                          attendanceData[student.id] === "Absent"
                            ? "bg-red-100 text-red-800 border-red-300"
                            : "bg-gray-100 text-gray-700 border-gray-300"
                        } border`}
                      >
                        Absent
                      </button>
                      <button
                        onClick={() => handleAttendanceChange(student.id, "Late")}
                        className={`px-3 py-1 rounded-lg text-sm font-medium ${
                          attendanceData[student.id] === "Late"
                            ? "bg-yellow-100 text-yellow-800 border-yellow-300"
                            : "bg-gray-100 text-gray-700 border-gray-300"
                        } border`}
                      >
                        Late
                      </button>
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

export default StudentAttendance;
