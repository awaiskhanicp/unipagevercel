
import { useState } from "react";
import { FileText, Search, Download, Eye } from "lucide-react";

const StudentRecords = () => {
  const [records] = useState([
    { id: 1, studentName: "John Doe", studentId: "CS2021001", course: "Computer Science", year: "3rd Year", gpa: "3.8", status: "Active", lastUpdated: "2024-01-15" },
    { id: 2, studentName: "Jane Smith", studentId: "BA2022001", course: "Business Administration", year: "2nd Year", gpa: "3.9", status: "Active", lastUpdated: "2024-01-14" },
    { id: 3, studentName: "Mike Johnson", studentId: "ENG2020001", course: "Engineering", year: "4th Year", gpa: "3.7", status: "Active", lastUpdated: "2024-01-13" },
    { id: 4, studentName: "Sarah Wilson", studentId: "MED2023001", course: "Medicine", year: "1st Year", gpa: "4.0", status: "Active", lastUpdated: "2024-01-12" },
    { id: 5, studentName: "David Brown", studentId: "LAW2022001", course: "Law", year: "2nd Year", gpa: "3.6", status: "Active", lastUpdated: "2024-01-11" }
  ]);

  const [searchTerm, setSearchTerm] = useState("");

  const filteredRecords = records.filter(record =>
    record.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    record.studentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    record.course.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Student Records</h1>
          <p className="text-gray-600">View and manage student academic records</p>
        </div>
        <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center space-x-2">
          <Download className="w-4 h-4" />
          <span>Export Records</span>
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center space-x-4">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name, student ID, or course..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Course</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Year</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">GPA</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Updated</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredRecords.map((record) => (
                <tr key={record.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                        <FileText className="w-5 h-5 text-gray-600" />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{record.studentName}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{record.studentId}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{record.course}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{record.year}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`text-sm font-semibold ${
                      parseFloat(record.gpa) >= 3.5 ? 'text-green-600' : 
                      parseFloat(record.gpa) >= 3.0 ? 'text-yellow-600' : 'text-red-600'
                    }`}>
                      {record.gpa}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                      {record.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{record.lastUpdated}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <button className="text-blue-600 hover:text-blue-900">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button className="text-green-600 hover:text-green-900">
                        <Download className="w-4 h-4" />
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

export default StudentRecords;
