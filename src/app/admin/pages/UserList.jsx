"use client";

import React, { useState } from "react";
import { useUserList } from "./UserContext";
import { Pencil, Trash2, Plus } from "lucide-react";
import AddUser from "./AddUser";

const UserList = () => {
  const { users, setUsers } = useUserList();
  const [open, setOpen] = useState(false);

  const handleDelete = (id) => {
    setUsers(prev => prev.filter(user => user.id !== id));
    alert("User deleted successfully.");
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">User Management</h1>
        <button
          onClick={() => setOpen(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-5 h-5" />
          Add User
        </button>
      </div>

      {/* Add User Modal */}
      {open && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-xl relative">
            <h2 className="text-xl font-semibold mb-4">Add User</h2>
            <button
              className="absolute top-3 right-4 text-gray-500 hover:text-gray-800"
              onClick={() => setOpen(false)}
            >
              ✕
            </button>
            <AddUser onSuccess={() => setOpen(false)} />
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-100">
              <tr>
                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600">Image</th>
                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600">Name</th>
                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600">Email</th>
                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600">Phone</th>
                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600">Role</th>
                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600">Created At</th>
                <th className="py-3 px-4 text-center text-sm font-semibold text-gray-600">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <img
                      src={user.image}
                      alt={user.name}
                      className="w-12 h-12 object-cover rounded-full"
                    />
                  </td>
                  <td className="py-3 px-4 font-medium text-gray-800">{user.name}</td>
                  <td className="py-3 px-4 text-gray-600">{user.email}</td>
                  <td className="py-3 px-4 text-gray-600">{user.phone}</td>
                  <td className="py-3 px-4 text-gray-600">{user.role}</td>
                  <td className="py-3 px-4 text-gray-600">{user.createdAt}</td>
                  <td className="py-3 px-4 text-center space-x-2">
                    <button className="p-2 hover:bg-gray-100 rounded">
                      <Pencil className="w-4 h-4 text-blue-600" />
                    </button>
                    <button
                      onClick={() => handleDelete(user.id)}
                      className="p-2 hover:bg-gray-100 rounded"
                    >
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {users.length === 0 && (
            <div className="text-center py-12 text-gray-500 text-lg">
              No users found.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserList;
