'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

const initialLogs = [
  { id: 1, email: "student4@email.com", course: "BSc Mathematics", date: "2024-07-04" },
  { id: 2, email: "student5@email.com", course: "BSc Physics", date: "2024-07-05" },
  { id: 3, email: "student6@email.com", course: "BSc Chemistry", date: "2024-07-06" }
];

const CourseLogs = () => {
  const [logs, setLogs] = useState(initialLogs);
  const [deleteId, setDeleteId] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [toast, setToast] = useState(null);

  const handleDelete = () => {
    setLogs(logs.filter(log => log.id !== deleteId));
    setDeleteId(null);
    setShowConfirm(false);
    setToast("Log deleted successfully.");
    setTimeout(() => setToast(null), 3000);
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Course Logs</h1>

      {toast && (
        <div className="mb-4 p-4 bg-red-100 border border-red-300 text-red-800 rounded-lg">
          {toast}
        </div>
      )}

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
                      onClick={() => {
                        setDeleteId(log.id);
                        setShowConfirm(true);
                      }}
                      className="px-2 py-1 text-red-600 hover:bg-red-100 rounded-lg transition"
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

      {showConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-[90%] max-w-md shadow-xl">
            <h2 className="text-lg font-semibold text-gray-800 mb-2">Are you sure?</h2>
            <p className="text-sm text-gray-600 mb-4">This will permanently delete the log.</p>
            <div className="flex justify-end space-x-4">
              <button
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                onClick={() => {
                  setDeleteId(null);
                  setShowConfirm(false);
                }}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                onClick={handleDelete}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CourseLogs;
