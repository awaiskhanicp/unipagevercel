'use client';

import { useState } from "react";

const initialLogs = [
  { id: 1, email: "student1@email.com", course: "BSc Computer Science", date: "2024-07-01" },
  { id: 2, email: "student2@email.com", course: "MBA", date: "2024-07-02" },
  { id: 3, email: "student3@email.com", course: "BBA", date: "2024-07-03" }
];

const UniversityLogs = () => {
  const [logs, setLogs] = useState(initialLogs);
  const [toastMessage, setToastMessage] = useState('');
  const [showToast, setShowToast] = useState(false);

  const handleDelete = (id) => {
    const confirmDelete = confirm("Are you sure you want to delete this log?");
    if (!confirmDelete) return;

    const updatedLogs = logs.filter(log => log.id !== id);
    setLogs(updatedLogs);

    setToastMessage("Log deleted successfully.");
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen relative">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">University Logs</h1>
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-100">
              <tr>
                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600">#</th>
                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600">Student Email</th>
                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600">Course</th>
                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600">Date</th>
                <th className="py-3 px-4 text-center text-sm font-semibold text-gray-600">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {logs.map((log, idx) => (
                <tr key={log.id} className="hover:bg-gray-50">
                  <td className="py-3 px-4">{idx + 1}</td>
                  <td className="py-3 px-4">{log.email}</td>
                  <td className="py-3 px-4">{log.course}</td>
                  <td className="py-3 px-4">{log.date}</td>
                  <td className="py-3 px-4 text-center">
                    <button
                      onClick={() => handleDelete(log.id)}
                      className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                      title="Delete"
                    >
                      🗑️
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {logs.length === 0 && (
            <div className="text-center py-12 text-gray-500 text-lg">No logs found.</div>
          )}
        </div>
      </div>

      {showToast && (
        <div className="fixed bottom-6 right-6 bg-red-600 text-white px-4 py-2 rounded-xl shadow-md">
          {toastMessage}
        </div>
      )}
    </div>
  );
};

export default UniversityLogs;
