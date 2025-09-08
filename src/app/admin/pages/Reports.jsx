
import { FileText, Download, TrendingUp, BarChart3, PieChart, Calendar } from "lucide-react";

const Reports = () => {
  const reportTypes = [
    { name: "Student Reports", description: "Enrollment, attendance, and performance reports", icon: FileText, color: "bg-blue-500" },
    { name: "Financial Reports", description: "Revenue, expenses, and payment reports", icon: TrendingUp, color: "bg-green-500" },
    { name: "Academic Reports", description: "Course performance and exam analytics", icon: BarChart3, color: "bg-purple-500" },
    { name: "Faculty Reports", description: "Faculty performance and attendance reports", icon: PieChart, color: "bg-orange-500" }
  ];

  const recentReports = [
    { id: 1, name: "Monthly Student Enrollment Report", type: "Student Report", date: "2024-01-15", size: "2.4 MB" },
    { id: 2, name: "Financial Summary Q4 2023", type: "Financial Report", date: "2024-01-14", size: "1.8 MB" },
    { id: 3, name: "Faculty Performance Analysis", type: "Faculty Report", date: "2024-01-13", size: "3.2 MB" },
    { id: 4, name: "Course Completion Statistics", type: "Academic Report", date: "2024-01-12", size: "1.5 MB" },
    { id: 5, name: "Library Usage Report", type: "Library Report", date: "2024-01-11", size: "950 KB" }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reports & Analytics</h1>
          <p className="text-gray-600">Generate and download institutional reports</p>
        </div>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2">
          <FileText className="w-4 h-4" />
          <span>Generate Report</span>
        </button>
      </div>

      {/* Report Types Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {reportTypes.map((report, index) => (
          <div key={index} className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow cursor-pointer">
            <div className="flex items-center justify-between mb-4">
              <div className={`${report.color} p-3 rounded-lg`}>
                <report.icon className="w-6 h-6 text-white" />
              </div>
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">{report.name}</h3>
            <p className="text-sm text-gray-600 mb-4">{report.description}</p>
            <button className="w-full bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 text-sm font-medium">
              Generate Report
            </button>
          </div>
        ))}
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { title: "Total Reports", value: "142", icon: FileText, color: "bg-blue-500" },
          { title: "This Month", value: "23", icon: Calendar, color: "bg-green-500" },
          { title: "Downloads", value: "1,567", icon: Download, color: "bg-purple-500" },
          { title: "Automated", value: "89", icon: BarChart3, color: "bg-orange-500" }
        ].map((stat, index) => (
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

      {/* Recent Reports */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-800">Recent Reports</h3>
            <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">View All</button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Report Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Generated Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Size</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {recentReports.map((report) => (
                <tr key={report.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-gray-300 rounded-lg flex items-center justify-center">
                        <FileText className="w-5 h-5 text-gray-600" />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{report.name}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{report.type}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{report.date}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{report.size}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <button className="text-blue-600 hover:text-blue-900 flex items-center space-x-1">
                        <Download className="w-4 h-4" />
                        <span>Download</span>
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

export default Reports;
